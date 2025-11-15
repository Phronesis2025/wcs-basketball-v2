"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import BasketballLoader from "@/components/BasketballLoader";
import { devError } from "@/lib/security";

export const dynamic = 'force-dynamic';

interface ParentSummary {
  email: string;
  children_count: number;
  total_paid: number;
  has_pending_payments: boolean;
}

export default function AdminParentsPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const [parents, setParents] = useState<ParentSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.push("/");
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchParents();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchParents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/parents");
      if (response.ok) {
        const data = await response.json();
        setParents(data);
      }
    } catch (error) {
      devError("Error fetching parents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredParents = parents.filter((parent) =>
    parent.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BasketballLoader size={80} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Parent Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage parent accounts and registrations
              </p>
            </div>
            <Link
              href="/admin/club-management"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
            >
              Back to Dashboard
            </Link>
          </div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md border rounded px-4 py-2"
            />
          </div>

          {filteredParents.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              {searchTerm
                ? "No parents found matching your search"
                : "No parents found"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Children
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Paid
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredParents.map((parent) => (
                    <tr key={parent.email} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {parent.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {parent.children_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${parent.total_paid.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {parent.has_pending_payments ? (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                            Pending
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                            Paid
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/admin/parents/${encodeURIComponent(
                            parent.email
                          )}`}
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          View Profile
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
