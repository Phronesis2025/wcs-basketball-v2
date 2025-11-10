"use client";

import { useState, useMemo } from "react";

interface ParentPaymentData {
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

interface ParentPaymentTableProps {
  data: ParentPaymentData[];
  onRowClick: (parent: ParentPaymentData) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: "All" | "Paid" | "Pending" | "Overdue";
  onStatusFilterChange: (status: "All" | "Paid" | "Pending" | "Overdue") => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
}

export default function ParentPaymentTable({
  data,
  onRowClick,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  currentPage,
  onPageChange,
  itemsPerPage = 15,
}: ParentPaymentTableProps) {
  // Filter and search
  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((parent) => {
        const fullName = `${parent.first_name || ""} ${parent.last_name || ""}`.trim().toLowerCase();
        const email = parent.email.toLowerCase();
        const playerNames = parent.players.map((p) => p.name.toLowerCase()).join(" ");
        return (
          fullName.includes(searchLower) ||
          email.includes(searchLower) ||
          playerNames.includes(searchLower)
        );
      });
    }

    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((parent) => parent.payment_status === statusFilter);
    }

    return filtered;
  }, [data, searchTerm, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Get status badge styling
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-500 text-white";
      case "Pending":
        return "bg-yellow-500 text-white";
      case "Overdue":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Get parent display name
  const getParentName = (parent: ParentPaymentData) => {
    const firstName = parent.first_name || "";
    const lastName = parent.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || parent.email;
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, email, or player name..."
            value={searchTerm}
            onChange={(e) => {
              onSearchChange(e.target.value);
              onPageChange(1); // Reset to first page on search
            }}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => {
              onStatusFilterChange(e.target.value as "All" | "Paid" | "Pending" | "Overdue");
              onPageChange(1); // Reset to first page on filter change
            }}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {paginatedData.length > 0 ? (
        <>
          <div className="overflow-x-auto block">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-600">
                    <th className="py-2 pr-4 text-gray-300">Name</th>
                    <th className="py-2 pr-4 text-gray-300">Player(s)</th>
                    <th className="py-2 pr-4 text-gray-300">Payment Status</th>
                    <th className="py-2 pr-4 text-gray-300 hidden md:table-cell">
                      Total Paid
                    </th>
                    <th className="py-2 pr-4 text-gray-300 hidden lg:table-cell">
                      Pending Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((parent) => (
                    <tr
                      key={parent.id}
                      className="border-b border-gray-600 cursor-pointer hover:bg-gray-700/50 transition-colors"
                      onClick={() => onRowClick(parent)}
                    >
                      <td className="py-2 pr-4">
                        <div className="text-white font-medium">
                          {getParentName(parent)}
                        </div>
                        <div className="text-gray-400 text-xs mt-1 hidden md:block">
                          {parent.email}
                        </div>
                      </td>
                      <td className="py-2 pr-4">
                        <div className="text-white hidden md:block">
                          {parent.players.length > 0
                            ? parent.players.map((p) => p.name).join(", ")
                            : "No players"}
                        </div>
                        <div className="text-white md:hidden">
                          {parent.players.length} player{parent.players.length !== 1 ? "s" : ""}
                        </div>
                        {parent.players.length > 0 && (
                          <div className="text-gray-400 text-xs mt-1 hidden md:block">
                            {parent.players.length} player{parent.players.length !== 1 ? "s" : ""}
                          </div>
                        )}
                      </td>
                      <td className="py-2 pr-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                            parent.payment_status
                          )}`}
                        >
                          {parent.payment_status}
                        </span>
                      </td>
                      <td className="py-2 pr-4 hidden md:table-cell">
                        <span className="text-white">
                          {formatCurrency(parent.total_paid)}
                        </span>
                      </td>
                      <td className="py-2 pr-4 hidden lg:table-cell">
                        <span
                          className={
                            parent.pending_amount > 0
                              ? "text-yellow-400"
                              : "text-gray-400"
                          }
                        >
                          {formatCurrency(parent.pending_amount)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-700">
              <div className="text-sm text-gray-400">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of{" "}
                {filteredData.length} parent{filteredData.length !== 1 ? "s" : ""}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Show first page, last page, current page, and pages around current
                      return (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      );
                    })
                    .map((page, index, array) => {
                      // Add ellipsis if there's a gap
                      const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;
                      return (
                        <div key={page} className="flex items-center gap-1">
                          {showEllipsisBefore && (
                            <span className="text-gray-400 px-2">...</span>
                          )}
                          <button
                            onClick={() => onPageChange(page)}
                            className={`px-3 py-2 rounded-lg text-sm ${
                              currentPage === page
                                ? "bg-[red] text-white"
                                : "bg-gray-800 border border-gray-700 text-white hover:bg-gray-700"
                            } transition-colors`}
                          >
                            {page}
                          </button>
                        </div>
                      );
                    })}
                </div>
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">
            {searchTerm || statusFilter !== "All"
              ? "No parents found matching your search criteria"
              : "No parents found"}
          </p>
        </div>
      )}
    </div>
  );
}

