"use client";

import { useEffect, useState, useCallback } from "react";
import { ResumeStatus } from "@prisma/client";
import { toast } from "react-hot-toast";
import { Loader2, Trash2, Download, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResumeFilters } from "./ResumeFilters";
import { ResumeTable } from "./ResumeTable";
import { Pagination } from "@/components/ui/Pagination";
import dynamic from "next/dynamic";
import { ResumeData } from "@/types/resume";
import { useDebounce } from "@/hooks/useDebounce";
import { useCsrfToken } from "@/hooks/useCsrfToken";
import { ADMIN_PAGINATION } from "@/lib/constants";
import { devError } from "@/lib/admin-utils";

// Dynamic import for PreviewModal to match user experience
const PreviewModal = dynamic(
  () =>
    import("@/components/resume-builder/PreviewModal").then((mod) => ({
      default: mod.PreviewModal,
    })),
  {
    ssr: false,
  }
);

interface ResumeWithUser {
  id: string;
  title: string;
  status: ResumeStatus;
  template: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  _count: {
    sections: number;
  };
}

export function ResumeManagement() {
  const { csrfFetch } = useCsrfToken();
  const [resumes, setResumes] = useState<ResumeWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ResumeStatus | "">("");
  const [template, setTemplate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [previewResumeData, setPreviewResumeData] = useState<ResumeData | null>(
    null
  );
  const [previewResumeInfo, setPreviewResumeInfo] = useState<{
    id: string;
    title: string;
    template: string;
  } | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ ids: string[] } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  const fetchResumes = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: String(ADMIN_PAGINATION.RESUMES),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(status && { status }),
        ...(template && { template }),
      });

      const response = await csrfFetch(`/api/admin/resumes?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      setResumes(data.resumes || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.total || 0);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch resumes";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status, template]);

  useEffect(() => {
    fetchResumes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, status, template]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, template]);

  // Clear checkbox selection when page or filters change
  useEffect(() => {
    setSelectedIds([]);
  }, [page, debouncedSearch, status, template]);

  const handleSelectId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.length === resumes.length
        ? []
        : resumes.map((resume) => resume.id)
    );
  };

  const handleDeleteResumes = (ids: string[]) => {
    setDeleteConfirm({ ids });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const { ids } = deleteConfirm;
    setIsDeleting(true);
    try {
      const response = await csrfFetch("/api/admin/resumes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) throw new Error("Failed to delete resumes");

      toast.success(`Deleted ${ids.length} resume(s)`);
      setSelectedIds([]);
      fetchResumes();
    } catch (error) {
      devError('[ResumeManagement] Failed to delete resumes:', error);
      toast.error("Failed to delete resumes");
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const handleViewResume = async (resume: ResumeWithUser) => {
    setIsLoadingPreview(true);
    try {
      const response = await fetch(`/api/admin/resumes/${resume.id}/preview`);
      if (!response.ok) {
        throw new Error("Failed to fetch resume data");
      }

      const data = await response.json();
      setPreviewResumeData(data);
      setPreviewResumeInfo({
        id: resume.id,
        title: resume.title,
        template: resume.template,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load resume preview";
      toast.error(message);
      // Fallback to opening in new tab
      window.open(`/resumes/${resume.id}`, "_blank");
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleExport = () => {
    const data = resumes.map((resume) => ({
      title: resume.title,
      user: resume.user.email,
      status: resume.status,
      template: resume.template,
      sections: resume._count.sections,
      created: resume.createdAt,
    }));

    const csv = [
      ["Title", "User", "Status", "Template", "Sections", "Created"],
      ...data.map((row) => Object.values(row)),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resumes-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <Card className="p-6">
        <ResumeFilters
          search={search}
          status={status}
          template={template}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onTemplateChange={setTemplate}
        />
      </Card>

      {/* Selection Actions */}
      {selectedIds.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-700 font-medium">
              {selectedIds.length} resume(s) selected
            </span>
            <Button
              onClick={() => handleDeleteResumes(selectedIds)}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          </div>
        </Card>
      )}

      {/* Actions Bar */}
      <div className="flex justify-end">
        <Button onClick={handleExport} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export CSV (This Page)
        </Button>
      </div>

      {/* Main Content Card */}
      <Card className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No resumes found</p>
            <p className="text-sm text-gray-400 mt-2">
              {search || status || template
                ? "Try adjusting your search filters"
                : "Resumes will appear here once users create them"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <ResumeTable
              resumes={resumes}
              selectedIds={selectedIds}
              onSelectId={handleSelectId}
              onSelectAll={handleSelectAll}
              onViewResume={handleViewResume}
              onDeleteResume={(id) => handleDeleteResumes([id])}
            />

            <div className="flex flex-col items-center gap-2">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages} — {totalCount} resume{totalCount !== 1 ? 's' : ''} total
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Preview Modal - Same as user preview experience */}
      {previewResumeData && previewResumeInfo && (
        <PreviewModal
          isOpen={true}
          onClose={() => {
            setPreviewResumeData(null);
            setPreviewResumeInfo(null);
          }}
          data={previewResumeData}
          template={previewResumeInfo.template}
        />
      )}

      {/* Loading overlay for preview */}
      {isLoadingPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-700">Loading resume preview...</p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm resume deletion"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) {
              setDeleteConfirm(null);
            }
          }}
        >
          <Card className="w-full max-w-md p-6 mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Delete {deleteConfirm.ids.length} Resume{deleteConfirm.ids.length !== 1 ? 's' : ''}?
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              This action cannot be undone. {deleteConfirm.ids.length === 1
                ? 'This resume and all its sections will be permanently deleted.'
                : `These ${deleteConfirm.ids.length} resumes and all their sections will be permanently deleted.`}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                type="button"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeleting}
                type="button"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
