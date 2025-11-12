import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { getUserRole } from "@/lib/actions";

interface ParentPaymentOverview {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  players: Array<{
    id: string;
    name: string;
    status: string | null;
    team_id: string | null;
  }>;
  payment_status: "Paid" | "Pending" | "Overdue";
  total_paid: number;
  pending_amount: number;
  total_due: number;
  last_payment_date: string | null;
  due_date: string | null;
}

/**
 * Check if payment status is paid
 */
function isPaid(status: string | null | undefined): boolean {
  if (!status) return false;
  const s = status.toString().toLowerCase();
  return s === "paid" || s === "succeeded" || s.includes("paid");
}

/**
 * Calculate payment status for a parent
 */
function calculatePaymentStatus(
  totalDue: number,
  totalPaid: number,
  hasPendingPayments: boolean,
  dueDate: Date | null
): "Paid" | "Pending" | "Overdue" {
  if (totalPaid >= totalDue) {
    return "Paid";
  }

  if (dueDate && new Date() > dueDate) {
    return "Overdue";
  }

  if (hasPendingPayments || totalPaid < totalDue) {
    return "Pending";
  }

  return "Pending";
}

export async function GET(request: NextRequest) {
  try {
    // Get user ID from request headers
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const userData = await getUserRole(userId);
    if (!userData || userData.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    devLog("Fetching parent payment overview");

    const annualFee = Number(process.env.NEXT_PUBLIC_ANNUAL_FEE_USD || 360);

    // Get all parents from parents table
    const { data: parentsFromTable, error: parentsError } = await supabaseAdmin
      .from("parents")
      .select("id, email, first_name, last_name, phone, address_line1, address_line2, city, state, zip");

    if (parentsError) {
      devError("Error fetching parents:", parentsError);
      return NextResponse.json(
        { error: "Failed to fetch parents" },
        { status: 500 }
      );
    }

    // Get all unique parent emails from players table (for legacy data)
    const { data: players, error: playersError } = await supabaseAdmin
      .from("players")
      .select("parent_email, parent_id")
      .eq("is_deleted", false)
      .not("parent_email", "is", null);

    if (playersError) {
      devError("Error fetching players:", playersError);
      return NextResponse.json(
        { error: "Failed to fetch players" },
        { status: 500 }
      );
    }

    // Get unique parent emails and IDs
    const parentEmailsFromPlayers = new Set<string>();
    const parentIdsFromPlayers = new Set<string>();
    
    (players || []).forEach((p: any) => {
      if (p.parent_email) parentEmailsFromPlayers.add(p.parent_email);
      if (p.parent_id) parentIdsFromPlayers.add(p.parent_id);
    });

    // Combine parents from table and from players
    const allParentIds = new Set<string>();
    const allParentEmails = new Set<string>();

    (parentsFromTable || []).forEach((p: any) => {
      allParentIds.add(p.id);
      allParentEmails.add(p.email);
    });

    parentEmailsFromPlayers.forEach((email) => allParentEmails.add(email));
    parentIdsFromPlayers.forEach((id) => allParentIds.add(id));

    // Build parent data map
    const parentMap = new Map<string, any>();
    (parentsFromTable || []).forEach((p: any) => {
      parentMap.set(p.id, p);
      parentMap.set(p.email, p);
    });

    // Process each unique parent
    const parentOverviews: ParentPaymentOverview[] = await Promise.all(
      Array.from(allParentEmails).map(async (email: string) => {
        // Find parent record
        let parentRecord = parentMap.get(email);
        
        // If not found by email, try to find by ID
        if (!parentRecord) {
          const { data: parentByEmail } = await supabaseAdmin
            .from("parents")
            .select("*")
            .eq("email", email)
            .maybeSingle();
          parentRecord = parentByEmail;
        }

        // Get all children for this parent (by parent_id or parent_email)
        const { data: children, error: childrenError } = await supabaseAdmin
          .from("players")
          .select("id, name, status, team_id, parent_id, parent_email, created_at")
          .eq("is_deleted", false)
          .or(
            parentRecord?.id
              ? `parent_id.eq.${parentRecord.id},parent_email.eq.${email}`
              : `parent_email.eq.${email}`
          );

        if (childrenError) {
          devError(`Error fetching children for ${email}:`, childrenError);
          return null;
        }

        const childrenList = children || [];
        const approvedChildren = childrenList.filter(
          (c: any) => c.status === "approved" || c.status === "active"
        );

        // Get all payments for these children
        const childIds = childrenList.map((c: any) => c.id);
        let totalPaid = 0;
        let hasPendingPayments = false;
        let lastPaymentDate: Date | null = null;

        if (childIds.length > 0) {
          const { data: payments, error: paymentsError } = await supabaseAdmin
            .from("payments")
            .select("amount, status, created_at")
            .in("player_id", childIds)
            .order("created_at", { ascending: false });

          if (paymentsError) {
            devError(`Error fetching payments for ${email}:`, paymentsError);
          } else {
            (payments || []).forEach((p: any) => {
              if (isPaid(p.status)) {
                totalPaid += Number(p.amount) || 0;
                if (!lastPaymentDate) {
                  lastPaymentDate = new Date(p.created_at);
                }
              } else if (p.status === "pending") {
                hasPendingPayments = true;
              }
            });
          }
        }

        // Calculate total due (annual fee * number of approved children)
        const totalDue = approvedChildren.length * annualFee;
        const pendingAmount = Math.max(0, totalDue - totalPaid);

        // Calculate due date (30 days after last payment or player creation)
        let dueDate: Date | null = null;
        if (lastPaymentDate) {
          dueDate = new Date(lastPaymentDate);
          dueDate.setDate(dueDate.getDate() + 30);
        } else if (childrenList.length > 0) {
          // Use earliest child creation date
          const earliestChild = childrenList.reduce((earliest: any, child: any) => {
            const childDate = new Date(child.created_at);
            return !earliest || childDate < new Date(earliest.created_at)
              ? child
              : earliest;
          }, null);
          if (earliestChild) {
            dueDate = new Date(earliestChild.created_at);
            dueDate.setDate(dueDate.getDate() + 30);
          }
        }

        // Calculate payment status
        const paymentStatus = calculatePaymentStatus(
          totalDue,
          totalPaid,
          hasPendingPayments,
          dueDate
        );

        return {
          id: parentRecord?.id || email,
          email,
          first_name: parentRecord?.first_name || null,
          last_name: parentRecord?.last_name || null,
          phone: parentRecord?.phone || null,
          address_line1: parentRecord?.address_line1 || null,
          address_line2: parentRecord?.address_line2 || null,
          city: parentRecord?.city || null,
          state: parentRecord?.state || null,
          zip: parentRecord?.zip || null,
          players: childrenList.map((c: any) => ({
            id: c.id,
            name: c.name,
            status: c.status,
            team_id: c.team_id,
          })),
          payment_status: paymentStatus,
          total_paid: totalPaid,
          pending_amount: pendingAmount,
          total_due: totalDue,
          last_payment_date: lastPaymentDate?.toISOString() || null,
          due_date: dueDate?.toISOString() || null,
        };
      })
    );

    // Filter out null values and return
    const validOverviews = parentOverviews.filter(
      (p): p is ParentPaymentOverview => p !== null
    );

    return NextResponse.json(validOverviews);
  } catch (error) {
    devError("Parent payment overview API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}




