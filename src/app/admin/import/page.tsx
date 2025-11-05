// src/app/admin/import/page.tsx
// Admin page for Excel player import

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { ParsedPlayerRow, ValidationError } from "@/lib/excel-parser";
import toast from "react-hot-toast";

interface PreviewRow {
  rowNumber: number;
  status: "new" | "update" | "no_change" | "error";
  player?: {
    existing?: any;
    proposed: any;
  };
  team?: {
    existing?: any;
    proposed: any;
  };
  parent1?: {
    existing?: any;
    proposed: any;
  };
  errors?: string[];
}

interface PreviewResponse {
  success: boolean;
  preview: PreviewRow[];
  summary: {
    total: number;
    new: number;
    update: number;
    no_change: number;
    error: number;
  };
}

export default function ImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [parsedData, setParsedData] = useState<{
    rows: ParsedPlayerRow[];
    errors: ValidationError[];
    warnings: ValidationError[];
  } | null>(null);
  const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);
  const [importResults, setImportResults] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<"upload" | "preview" | "complete">("upload");

  // Get current user session
  const [userId, setUserId] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push("/coaches/login");
        return;
      }
      setUserId(session.user.id);
    };
    checkAuth();
  }, [router]);

  // Download template
  const handleDownloadTemplate = async () => {
    try {
      if (!userId) {
        toast.error("Please log in first");
        return;
      }

      const response = await fetch("/api/admin/import/template", {
        headers: { "x-user-id": userId },
      });

      if (!response.ok) {
        throw new Error("Failed to download template");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "player-import-template.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Template downloaded");
    } catch (error) {
      devError("Template download error:", error);
      toast.error("Failed to download template");
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      if (!userId) {
        toast.error("Please log in first");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/import/parse", {
        method: "POST",
        headers: { "x-user-id": userId },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse file");
      }

      setParsedData(data);
      toast.success(`Parsed ${data.rows.length} rows`);

      // Automatically generate preview
      if (data.rows.length > 0) {
        await generatePreview(data.rows);
      }
    } catch (error) {
      devError("File upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to parse file");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate preview
  const generatePreview = async (rows: ParsedPlayerRow[]) => {
    try {
      if (!userId) {
        toast.error("Please log in first");
        return;
      }

      setIsLoading(true);

      const response = await fetch("/api/admin/import/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({ rows }),
      });

      const data: PreviewResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate preview");
      }

      setPreviewData(data);
      setCurrentStep("preview");
      toast.success("Preview generated");
    } catch (error) {
      devError("Preview generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate preview");
    } finally {
      setIsLoading(false);
    }
  };

  // Execute import
  const handleImport = async () => {
    if (!parsedData || !userId) {
      toast.error("No data to import");
      return;
    }

    if (!confirm(`Are you sure you want to import ${parsedData.rows.length} rows?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/import/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({ rows: parsedData.rows }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to execute import");
      }

      setImportResults(data);
      setCurrentStep("complete");
      toast.success(`Import completed: ${data.summary.success} successful, ${data.summary.errors} errors`);
    } catch (error) {
      devError("Import execution error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to execute import");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset and start over
  const handleReset = () => {
    setParsedData(null);
    setPreviewData(null);
    setImportResults(null);
    setCurrentStep("upload");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bebas font-bold text-red mb-2">
              Player Import
            </h1>
            <p className="text-gray-300">
              Import players from Excel file with parent and team information
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/club-management")}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Return to Dashboard
          </button>
        </div>

        {/* Step 1: Upload */}
        {currentStep === "upload" && (
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="mb-6">
              <button
                onClick={handleDownloadTemplate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mr-4"
              >
                Download Template
              </button>
            </div>

            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer block"
              >
                <div className="text-gray-400 mb-4">
                  <svg
                    className="mx-auto h-12 w-12"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-4h12m-4 4v12m0 0l-4-4m4 4l4-4"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-white font-semibold">
                  Click to upload Excel file
                </span>
                <p className="text-gray-400 text-sm mt-2">
                  .xlsx or .xls files only
                </p>
              </label>
            </div>

            {isLoading && (
              <div className="mt-4 text-center text-gray-400">
                Parsing file...
              </div>
            )}

            {parsedData && (
              <div className="mt-6 bg-gray-700 rounded p-4">
                <h3 className="text-white font-semibold mb-2">Parse Results</h3>
                <p className="text-gray-300">
                  Rows: {parsedData.rows.length}
                </p>
                {parsedData.errors.length > 0 && (
                  <p className="text-red mt-2">
                    Errors: {parsedData.errors.length}
                  </p>
                )}
                {parsedData.warnings.length > 0 && (
                  <p className="text-yellow-400 mt-2">
                    Warnings: {parsedData.warnings.length}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Preview */}
        {currentStep === "preview" && previewData && (
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bebas text-white">Preview Import</h2>
              <button
                onClick={handleReset}
                className="text-gray-400 hover:text-white"
              >
                Start Over
              </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              <div className="bg-gray-700 rounded p-4 text-center">
                <div className="text-2xl font-bold text-white">{previewData.summary.total}</div>
                <div className="text-gray-400 text-sm">Total</div>
              </div>
              <div className="bg-green-900 rounded p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{previewData.summary.new}</div>
                <div className="text-gray-400 text-sm">New</div>
              </div>
              <div className="bg-blue-900 rounded p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{previewData.summary.update}</div>
                <div className="text-gray-400 text-sm">Update</div>
              </div>
              <div className="bg-gray-700 rounded p-4 text-center">
                <div className="text-2xl font-bold text-gray-400">{previewData.summary.no_change}</div>
                <div className="text-gray-400 text-sm">No Change</div>
              </div>
              <div className="bg-red-900 rounded p-4 text-center">
                <div className="text-2xl font-bold text-red">{previewData.summary.error}</div>
                <div className="text-gray-400 text-sm">Errors</div>
              </div>
            </div>

            {/* Preview Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="p-2 text-gray-300">Row</th>
                    <th className="p-2 text-gray-300">Status</th>
                    <th className="p-2 text-gray-300">Player</th>
                    <th className="p-2 text-gray-300">Team</th>
                    <th className="p-2 text-gray-300">Parent</th>
                    <th className="p-2 text-gray-300">Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.preview.map((row) => (
                    <tr
                      key={row.rowNumber}
                      className="border-b border-gray-700 hover:bg-gray-700"
                    >
                      <td className="p-2 text-gray-300">{row.rowNumber}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            row.status === "new"
                              ? "bg-green-900 text-green-400"
                              : row.status === "update"
                              ? "bg-blue-900 text-blue-400"
                              : row.status === "error"
                              ? "bg-red-900 text-red"
                              : "bg-gray-700 text-gray-400"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="p-2 text-gray-300">
                        {row.player?.proposed?.name || "N/A"}
                      </td>
                      <td className="p-2 text-gray-300">
                        {row.team?.proposed?.name || "N/A"}
                      </td>
                      <td className="p-2 text-gray-300">
                        {row.parent1?.proposed?.email || "N/A"}
                      </td>
                      <td className="p-2 text-red text-sm">
                        {row.errors?.join(", ") || ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Import Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleImport}
                disabled={isLoading || previewData.summary.error > 0}
                className="bg-red hover:bg-red-700 text-white px-6 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Importing..." : "Import All Rows"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Complete */}
        {currentStep === "complete" && importResults && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bebas text-white mb-6">Import Complete</h2>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-700 rounded p-4">
                <div className="text-2xl font-bold text-white">{importResults.summary.total}</div>
                <div className="text-gray-400 text-sm">Total Processed</div>
              </div>
              <div className="bg-green-900 rounded p-4">
                <div className="text-2xl font-bold text-green-400">{importResults.summary.success}</div>
                <div className="text-gray-400 text-sm">Successful</div>
              </div>
              <div className="bg-red-900 rounded p-4">
                <div className="text-2xl font-bold text-red">{importResults.summary.errors}</div>
                <div className="text-gray-400 text-sm">Errors</div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-white font-semibold mb-2">Created</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-gray-300">
                  Players: <span className="text-white font-bold">{importResults.summary.created.players}</span>
                </div>
                <div className="text-gray-300">
                  Parents: <span className="text-white font-bold">{importResults.summary.created.parents}</span>
                </div>
                <div className="text-gray-300">
                  Teams: <span className="text-white font-bold">{importResults.summary.created.teams}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-white font-semibold mb-2">Updated</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-gray-300">
                  Players: <span className="text-white font-bold">{importResults.summary.updated.players}</span>
                </div>
                <div className="text-gray-300">
                  Parents: <span className="text-white font-bold">{importResults.summary.updated.parents}</span>
                </div>
                <div className="text-gray-300">
                  Teams: <span className="text-white font-bold">{importResults.summary.updated.teams}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Import Another File
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

