import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      parent_user_id,
      parent_name,
      parent_email,
      parent_phone,
      emergency_contact,
      emergency_phone,
      player: { first_name, last_name, birthdate, grade, gender },
      waiver_signed,
    } = body || {};

    if (
      !parent_user_id ||
      !parent_email ||
      !first_name ||
      !last_name ||
      !birthdate
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Database connection unavailable" },
        { status: 500 }
      );
    }

    const { data: player, error } = await supabaseAdmin
      .from("players")
      .insert([
        {
          parent_name,
          parent_email,
          parent_phone,
          parent_first_name: body.parent_first_name,
          parent_last_name: body.parent_last_name,
          emergency_contact,
          emergency_phone,
          name: `${first_name} ${last_name}`, // Combine first and last name
          date_of_birth: birthdate, // Use actual DB field name
          grade, // Use actual DB field name (not grade_level)
          gender,
          waiver_signed: !!waiver_signed,
          status: "pending",
          is_deleted: false,
        },
      ])
      .select("*")
      .single();

    if (error) {
      devError("register-player insert error", error);
      return NextResponse.json(
        { error: "Failed to register player" },
        { status: 500 }
      );
    }

    // Optional: notify admin(s)
    // If you have a list of admin emails, iterate. Here we keep it simple.
    await sendEmail(
      parent_email,
      "WCS Registration received",
      `<p>Thanks for registering ${first_name}! Your registration is pending team assignment. We'll email you when approved with a payment link.</p>`
    );

    devLog("register-player OK", { player_id: player.id });
    return NextResponse.json({ success: true, player });
  } catch (e) {
    devError("register-player exception", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
