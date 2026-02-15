"use client";

import { useEffect, useRef, Suspense, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { KeyboardShortcutsHelp } from "@/components/ui/keyboard-shortcuts-help";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import {
  FormSectionRenderer,
  FormSectionRendererRef,
} from "@/components/resume-builder/sections/FormSectionRenderer";
import { BuilderShell } from "@/components/resume-builder/layout/BuilderShell";
import { BuilderHeader } from "@/components/resume-builder/layout/BuilderHeader";
import { SectionSidebar } from "@/components/resume-builder/layout/SectionSidebar";
import { MobileBottomNav } from "@/components/resume-builder/layout/MobileBottomNav";
import { CompletionProgressBar } from "@/components/resume-builder/layout/CompletionProgressBar";
import { LivePreviewPanel } from "@/components/resume-builder/preview/LivePreviewPanel";
import { MobilePreviewSheet } from "@/components/resume-builder/preview/MobilePreviewSheet";
import { useResumeData } from "@/hooks/useResumeData";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useAutoTranslation } from "@/hooks/useAutoTranslation";
import { useDownloadPDF } from "@/hooks/useDownloadPDF";
import { useSectionCompletion } from "@/hooks/useSectionCompletion";
import toast from "react-hot-toast";

const ATSOptimization = dynamic(
  () =>
    import("@/components/resume-builder/ATSOptimization").then((mod) => ({
      default: mod.ATSOptimization,
    })),
  { ssr: false }
);

// 6 sections (down from 9)
const TOTAL_SECTIONS = 6;

function ResumeBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const { checkPermission, subscription, refreshSubscription } = useSubscription();

  // State
  const [currentSection, setCurrentSection] = useState(0);
  const [showATS, setShowATS] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("basic");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [resumeTitle, setResumeTitle] = useState("");
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [titleError, setTitleError] = useState(false);

  // Refs
  const summaryTextareaRef = useRef<HTMLTextAreaElement>(null);
  const formSectionRef = useRef<FormSectionRendererRef>(null);

  // Hooks
  const {
    formData,
    setFormData,
    updatePersonalField,
    updateSummary,
    updateSection,
  } = useResumeData();

  const { isAutoSaving, queueSave, setLastSavedData } = useAutoSave({
    resumeId,
    setResumeId,
    formData,
    selectedTemplate,
    resumeTitle,
  });

  const {
    isAutoTranslating,
    setIsAutoTranslating,
    autoTranslateToEnglish,
    hasNonEnglishContent,
  } = useAutoTranslation();

  const { downloadPDF, isDownloading } = useDownloadPDF();
  const completionStatus = useSectionCompletion(formData);

  // Set default title client-side to avoid hydration mismatch (new Date() differs server vs client)
  useEffect(() => {
    setResumeTitle((prev) =>
      prev === ""
        ? `Resume - ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`
        : prev
    );
  }, []);

  // Save wrappers
  const updatePersonalFieldWithSave = useCallback(
    (field: string, value: string) => {
      updatePersonalField(field, value);
      queueSave("personal");
    },
    [updatePersonalField, queueSave]
  );

  const updateSummaryWithSave = useCallback(
    (summary: string) => {
      updateSummary(summary);
      queueSave();
    },
    [updateSummary, queueSave]
  );

  const setSelectedTemplateWithSave = useCallback(
    (template: string) => {
      setSelectedTemplate(template);
      queueSave();
    },
    [setSelectedTemplate, queueSave]
  );

  // Manual translate
  const handleManualTranslate = useCallback(async () => {
    setIsAutoTranslating(true);
    try {
      const translatedData = await autoTranslateToEnglish(formData);
      setFormData(translatedData);
      if (resumeId) {
        await fetch(`/api/resumes/${resumeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: resumeTitle,
            template: selectedTemplate,
            formData: translatedData,
          }),
        });
      }
    } catch {
      toast.error(t("pages.resumeBuilder.messages.translationError"));
    } finally {
      setIsAutoTranslating(false);
    }
  }, [
    autoTranslateToEnglish,
    formData,
    setFormData,
    resumeId,
    resumeTitle,
    selectedTemplate,
    setIsAutoTranslating,
    t,
  ]);

  // Section navigation
  const handleSectionChange = useCallback(
    (newSection: number) => {
      if (newSection === currentSection || newSection < 0 || newSection >= TOTAL_SECTIONS) return;
      if (formSectionRef.current) {
        formSectionRef.current.triggerSectionSave();
      }
      queueSave(`section_${currentSection}`);
      setCurrentSection(newSection);
    },
    [currentSection, queueSave]
  );

  // Save handler
  const handleSave = useCallback(async () => {
    if (isSaving) return;

    if (!resumeTitle || resumeTitle.trim() === "") {
      setTitleError(true);
      toast.error(t("pages.resumeBuilder.errors.titleRequired"));
      return;
    }

    setIsSaving(true);
    try {
      if (!resumeId) {
        const response = await fetch("/api/resumes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: resumeTitle,
            template: selectedTemplate,
            formData,
          }),
        });
        if (!response.ok) throw new Error(t("pages.resumeBuilder.errors.createFailed"));
        const data = await response.json();
        setResumeId(data.resume.id);
        setLastSavedData({ ...formData });
        toast.success(t("pages.resumeBuilder.messages.resumeCreated"));
      } else {
        const response = await fetch(`/api/resumes/${resumeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: resumeTitle,
            template: selectedTemplate,
            formData,
          }),
        });
        if (!response.ok) throw new Error(t("pages.resumeBuilder.errors.saveFailed"));
        setLastSavedData({ ...formData });
        toast.success(t("pages.resumeBuilder.messages.resumeSaved"));
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("pages.resumeBuilder.errors.saveFailed")
      );
    } finally {
      setIsSaving(false);
    }
  }, [resumeId, formData, selectedTemplate, resumeTitle, isSaving, t, setLastSavedData]);

  // Load existing resume
  useEffect(() => {
    const loadResume = async () => {
      const importedData = sessionStorage.getItem("importedResumeData");
      const importedTitle = sessionStorage.getItem("importedResumeTitle");

      if (importedData && !searchParams.get("id") && !searchParams.get("resumeId")) {
        try {
          const parsedData = JSON.parse(importedData);
          const title = importedTitle || t("pages.resumeBuilder.defaults.importedTitle");
          setFormData(parsedData);
          setLastSavedData({ ...parsedData });
          setResumeTitle(title);
          sessionStorage.removeItem("importedResumeData");
          sessionStorage.removeItem("importedResumeTitle");
          toast.success(t("pages.resumeBuilder.messages.importSuccess"));
          return;
        } catch (error) {
          console.error("[ResumeBuilder] Failed to parse imported data:", error);
        }
      }

      const resumeIdParam = searchParams.get("resumeId") || searchParams.get("id");
      if (!resumeIdParam) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/resumes/${resumeIdParam}`);
        if (!response.ok) throw new Error(t("pages.resumeBuilder.errors.loadFailed"));

        const data = await response.json();
        const resume = data.resume;

        setResumeId(resume.id);
        setResumeTitle(resume.title || "");
        setSelectedTemplate(resume.template || "basic");

        let idCounter = 0;
        const generateId = () => `${Date.now()}_${++idCounter}`;

        const toArray = (val: unknown) => Array.isArray(val) ? val : [];
        const formDataWithIds = {
          ...resume.formData,
          experience: toArray(resume.formData.experience).map(
            (exp: Record<string, unknown>) => ({ ...exp, id: exp.id || generateId() })
          ),
          education: toArray(resume.formData.education).map(
            (edu: Record<string, unknown>) => ({ ...edu, id: edu.id || generateId() })
          ),
          skills: toArray(resume.formData.skills).map(
            (skill: Record<string, unknown>) => ({ ...skill, id: skill.id || generateId() })
          ),
          languages: toArray(resume.formData.languages).map(
            (lang: Record<string, unknown>) => ({ ...lang, id: lang.id || generateId() })
          ),
          projects: toArray(resume.formData.projects).map(
            (proj: Record<string, unknown>) => ({ ...proj, id: proj.id || generateId() })
          ),
          certifications: toArray(resume.formData.certifications).map(
            (cert: Record<string, unknown>) => ({ ...cert, id: cert.id || generateId() })
          ),
        };

        setFormData(formDataWithIds);
        setLastSavedData({ ...formDataWithIds });
      } catch (error) {
        console.error("[ResumeBuilder] Failed to load resume:", error);
        toast.error(t("pages.resumeBuilder.messages.loadError"));
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    loadResume();
  }, [searchParams, router, t, setFormData, setLastSavedData]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === "s") {
          event.preventDefault();
          handleSave();
        }
      } else if (event.key === "F1") {
        event.preventDefault();
        setShowKeyboardHelp(true);
      } else if (event.altKey && event.key === "ArrowLeft") {
        event.preventDefault();
        handleSectionChange(currentSection - 1);
      } else if (event.altKey && event.key === "ArrowRight") {
        event.preventDefault();
        handleSectionChange(currentSection + 1);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleSave, handleSectionChange, currentSection]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p>{t("pages.resumeBuilder.loading.resume")}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <BuilderShell
        header={
          <BuilderHeader
            resumeTitle={resumeTitle}
            onTitleChange={(title) => {
              setResumeTitle(title);
              setTitleError(false);
            }}
            titleError={titleError}
            isSaving={isSaving}
            isAutoSaving={isAutoSaving}
            onSave={handleSave}
            onShowATS={() => setShowATS(true)}
            onTranslate={handleManualTranslate}
            isTranslating={isAutoTranslating}
            showTranslate={hasNonEnglishContent(formData)}
            onDownload={() => downloadPDF(formData, selectedTemplate)}
            isDownloading={isDownloading}
            onShowKeyboardHelp={() => setShowKeyboardHelp(true)}
          />
        }
        progressBar={
          <CompletionProgressBar
            completionStatus={completionStatus}
            currentSection={currentSection}
            onSectionChange={handleSectionChange}
          />
        }
        sidebar={
          <SectionSidebar
            currentSection={currentSection}
            onSectionChange={handleSectionChange}
            completionStatus={completionStatus}
          />
        }
        form={
          <FormSectionRenderer
            ref={formSectionRef}
            currentSection={currentSection}
            onSectionChange={handleSectionChange}
            formData={formData}
            updatePersonalField={updatePersonalFieldWithSave}
            updateSummary={updateSummaryWithSave}
            updateSection={updateSection}
            setFormData={setFormData}
            summaryTextareaRef={summaryTextareaRef}
            isAutoSaving={isAutoSaving}
            queueSave={queueSave}
            checkPermission={checkPermission}
          />
        }
        preview={
          <LivePreviewPanel
            data={formData}
            templateId={selectedTemplate}
            onTemplateChange={setSelectedTemplateWithSave}
          />
        }
        mobileNav={
          <MobileBottomNav
            currentSection={currentSection}
            onSectionChange={handleSectionChange}
            completionStatus={completionStatus}
          />
        }
        mobilePreview={
          <MobilePreviewSheet
            data={formData}
            templateId={selectedTemplate}
            onTemplateChange={setSelectedTemplateWithSave}
          />
        }
      />

      {/* Modals */}
      <ATSOptimization
        isOpen={showATS}
        onClose={() => setShowATS(false)}
        resumeData={formData}
        canUseATS={checkPermission("canUseATS")}
        atsLimit={subscription?.atsUsageLimit ?? 0}
        atsUsed={subscription?.atsUsageCount ?? 0}
        onNavigateToSection={(sectionIndex) => {
          setShowATS(false);
          handleSectionChange(sectionIndex);
        }}
        onUsageUpdate={() => refreshSubscription()}
      />

      <KeyboardShortcutsHelp
        isOpen={showKeyboardHelp}
        onClose={() => setShowKeyboardHelp(false)}
      />
    </>
  );
}

function LoadingFallback() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p>{t("pages.resumeBuilder.loading.builder")}</p>
      </div>
    </div>
  );
}

export default function ResumeBuilder() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResumeBuilderContent />
    </Suspense>
  );
}
