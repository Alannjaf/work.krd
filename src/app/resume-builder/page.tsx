"use client";

import { useEffect, useRef, Suspense, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppHeader } from "@/components/shared/AppHeader";
import {
  ArrowLeft,
  Save,
  Eye,
  Keyboard,
  ArrowRight,
  Target,
  Languages,
} from "lucide-react";
import dynamic from "next/dynamic";
import { NavigationIndicator } from "@/components/ui/navigation-indicator";
import { KeyboardShortcutsHelp } from "@/components/ui/keyboard-shortcuts-help";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import {
  FormSectionRenderer,
  FormSectionRendererRef,
} from "@/components/resume-builder/sections/FormSectionRenderer";
import { SectionTabs } from "@/components/resume-builder/SectionTabs";
import { LivePreviewPanel } from "@/components/resume-builder/LivePreviewPanel";
import { MobilePreviewSheet } from "@/components/resume-builder/MobilePreviewSheet";
import { useResumeData } from "@/hooks/useResumeData";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useAutoTranslation } from "@/hooks/useAutoTranslation";
import { scrollToTopForSectionChange } from "@/lib/scrollUtils";
import toast from "react-hot-toast";

const ATSOptimization = dynamic(
  () =>
    import("@/components/resume-builder/ATSOptimization").then((mod) => ({
      default: mod.ATSOptimization,
    })),
  {
    ssr: false,
  }
);

// Form sections configuration
const getFormSections = (t: (key: string) => string) => [
  {
    id: "personal",
    title: t("pages.resumeBuilder.sections.personalInfo"),
    icon: "👤",
  },
  {
    id: "summary",
    title: t("pages.resumeBuilder.sections.professionalSummary"),
    icon: "📝",
  },
  {
    id: "experience",
    title: t("pages.resumeBuilder.sections.workExperience"),
    icon: "💼",
  },
  {
    id: "education",
    title: t("pages.resumeBuilder.sections.education"),
    icon: "🎓",
  },
  { id: "skills", title: t("pages.resumeBuilder.sections.skills"), icon: "⚡" },
  {
    id: "languages",
    title: t("pages.resumeBuilder.sections.languages"),
    icon: "🌐",
  },
  {
    id: "projects",
    title: t("pages.resumeBuilder.sections.projects"),
    icon: "💻",
  },
  {
    id: "certifications",
    title: t("pages.resumeBuilder.sections.certifications"),
    icon: "🏆",
  },
  {
    id: "template",
    title: t("pages.resumeBuilder.sections.chooseTemplate"),
    icon: "🎨",
  },
];

function ResumeBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const { checkPermission, subscription } = useSubscription();

  // State management
  const [currentSection, setCurrentSection] = useState(0);
  const [showATS, setShowATS] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [resumeTitle, setResumeTitle] = useState(
    `Resume - ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`
  );
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [titleError, setTitleError] = useState(false);

  // Refs
  const summaryTextareaRef = useRef<HTMLTextAreaElement>(null);
  const formSectionRef = useRef<FormSectionRendererRef>(null);
  const formScrollRef = useRef<HTMLDivElement>(null);

  // Custom hooks
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

  // Form sections
  const formSections = getFormSections(t);

  // Wrapper functions for auto-save on each step
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

  // Manual translate handler
  const handleManualTranslate = useCallback(async () => {
    setIsAutoTranslating(true);
    try {
      const translatedData = await autoTranslateToEnglish(formData);
      setFormData(translatedData);

      // Force save the translated data immediately
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

  // Navigation handlers
  const handleNext = useCallback(async () => {
    if (currentSection < formSections.length - 1) {
      const nextSection = currentSection + 1;

      if (formSectionRef.current) {
        formSectionRef.current.triggerSectionSave();
      }

      queueSave(`section_${currentSection}`);
      setCurrentSection(nextSection);

      // Scroll form panel to top
      if (formScrollRef.current) {
        formScrollRef.current.scrollTop = 0;
      }
      await scrollToTopForSectionChange();
      queueSave();
    }
  }, [currentSection, formSections.length, queueSave]);

  const handlePrevious = useCallback(async () => {
    if (currentSection > 0) {
      if (formSectionRef.current) {
        formSectionRef.current.triggerSectionSave();
      }

      queueSave(`section_${currentSection}`);
      setCurrentSection(currentSection - 1);

      if (formScrollRef.current) {
        formScrollRef.current.scrollTop = 0;
      }
      await scrollToTopForSectionChange();
    }
  }, [currentSection, queueSave]);

  const handleSectionChange = useCallback(
    async (newSection: number) => {
      if (newSection === currentSection) return;

      if (formSectionRef.current) {
        formSectionRef.current.triggerSectionSave();
      }

      queueSave(`section_${currentSection}`);
      setCurrentSection(newSection);

      if (formScrollRef.current) {
        formScrollRef.current.scrollTop = 0;
      }
      await scrollToTopForSectionChange();
      queueSave();
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

        if (!response.ok) {
          throw new Error(t("pages.resumeBuilder.errors.createFailed"));
        }

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

        if (!response.ok) {
          throw new Error(t("pages.resumeBuilder.errors.saveFailed"));
        }

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
  }, [
    resumeId,
    formData,
    selectedTemplate,
    resumeTitle,
    isSaving,
    t,
    setLastSavedData,
    setTitleError,
  ]);

  // Load existing resume on mount
  useEffect(() => {
    const loadResume = async () => {
      const importedData = sessionStorage.getItem("importedResumeData");
      const importedTitle = sessionStorage.getItem("importedResumeTitle");

      if (
        importedData &&
        !searchParams.get("id") &&
        !searchParams.get("resumeId")
      ) {
        try {
          const parsedData = JSON.parse(importedData);
          const title =
            importedTitle || t("pages.resumeBuilder.defaults.importedTitle");
          setFormData(parsedData);
          setLastSavedData({ ...parsedData });
          setResumeTitle(title);

          sessionStorage.removeItem("importedResumeData");
          sessionStorage.removeItem("importedResumeTitle");

          toast.success(t("pages.resumeBuilder.messages.importSuccess"));
          return;
        } catch (error) {
          console.error('[ResumeBuilder] Failed to parse imported data:', error);
        }
      }

      const resumeIdParam =
        searchParams.get("resumeId") || searchParams.get("id");
      if (!resumeIdParam) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/resumes/${resumeIdParam}`);
        if (!response.ok) {
          throw new Error(t("pages.resumeBuilder.errors.loadFailed"));
        }

        const data = await response.json();
        const resume = data.resume;

        setResumeId(resume.id);
        setResumeTitle(resume.title || "");
        setSelectedTemplate(resume.template || "modern");

        let idCounter = 0;
        const generateId = () => `${Date.now()}_${++idCounter}`;

        const formDataWithIds = {
          ...resume.formData,
          experience: (resume.formData.experience || []).map(
            (exp: Record<string, unknown>) => ({
              ...exp,
              id: exp.id || generateId(),
            })
          ),
          education: (resume.formData.education || []).map(
            (edu: Record<string, unknown>) => ({
              ...edu,
              id: edu.id || generateId(),
            })
          ),
          skills: (resume.formData.skills || []).map(
            (skill: Record<string, unknown>) => ({
              ...skill,
              id: skill.id || generateId(),
            })
          ),
          languages: (resume.formData.languages || []).map(
            (lang: Record<string, unknown>) => ({
              ...lang,
              id: lang.id || generateId(),
            })
          ),
          projects: (resume.formData.projects || []).map(
            (proj: Record<string, unknown>) => ({
              ...proj,
              id: proj.id || generateId(),
            })
          ),
          certifications: (resume.formData.certifications || []).map(
            (cert: Record<string, unknown>) => ({
              ...cert,
              id: cert.id || generateId(),
            })
          ),
        };

        setFormData(formDataWithIds);
        setLastSavedData({ ...formDataWithIds });
      } catch (error) {
        console.error('[ResumeBuilder] Failed to load resume:', error);
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
        switch (event.key) {
          case "s":
            event.preventDefault();
            handleSave();
            break;
        }
      } else {
        switch (event.key) {
          case "F1":
            event.preventDefault();
            setShowKeyboardHelp(true);
            break;
          case "ArrowLeft":
            if (event.altKey) {
              event.preventDefault();
              handlePrevious();
            }
            break;
          case "ArrowRight":
            if (event.altKey) {
              event.preventDefault();
              handleNext();
            }
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleSave, handlePrevious, handleNext]);

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader
        title={t("pages.resumeBuilder.title")}
        showBackButton={true}
        backButtonText={t("pages.resumeBuilder.backToDashboard")}
        backButtonHref="/dashboard"
      />

      {/* Resume Controls Section */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-full mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Resume Title */}
            <div className="flex flex-col">
              <label
                htmlFor="resume-title"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                {t("pages.resumeBuilder.resumeTitle")}
              </label>
              <input
                id="resume-title"
                type="text"
                value={resumeTitle}
                onChange={(e) => {
                  setResumeTitle(e.target.value);
                  setTitleError(false);
                }}
                className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  titleError ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={t("pages.resumeBuilder.resumeTitlePlaceholder")}
              />
              {titleError && (
                <p className="mt-1 text-sm text-red-600">
                  {t("pages.resumeBuilder.errors.titleRequired")}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowKeyboardHelp(true)}
                title="Keyboard Shortcuts (F1)"
                className="h-8 px-2 sm:px-3"
              >
                <Keyboard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowATS(true)}
                title={t("pages.resumeBuilder.actions.atsOptimization")}
                className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
              >
                <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {t("pages.resumeBuilder.actions.ats")}
              </Button>
              {hasNonEnglishContent(formData) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualTranslate}
                  disabled={isAutoTranslating}
                  className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
                >
                  {isAutoTranslating ? (
                    <>
                      <div className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 border-2 border-gray-500 border-t-transparent rounded-full" />
                      {t("pages.resumeBuilder.actions.translating")}
                    </>
                  ) : (
                    <>
                      <Languages className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      {t("pages.resumeBuilder.actions.translateToEnglish")}
                    </>
                  )}
                </Button>
              )}
              {/* Preview button - mobile only since desktop has inline preview */}
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden h-8 px-2 sm:px-3 text-xs sm:text-sm"
                onClick={() => {
                  // The MobilePreviewSheet FAB handles this, but this is an additional entry point
                  const fab = document.querySelector('[aria-label="Preview resume"]') as HTMLButtonElement;
                  fab?.click();
                }}
              >
                <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {t("pages.resumeBuilder.actions.preview")}
              </Button>
              <Button
                onClick={() => handleSave()}
                size="sm"
                disabled={isSaving || isAutoSaving}
                className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 border-2 border-white border-t-transparent rounded-full" />
                    {t("pages.resumeBuilder.actions.saving")}
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    {t("pages.resumeBuilder.actions.save")}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area - side by side */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
        {/* Left panel - Form */}
        <div className="w-full lg:w-1/2 flex flex-col overflow-hidden">
          <SectionTabs
            sections={formSections}
            currentSection={currentSection}
            onSectionChange={handleSectionChange}
          />
          <div ref={formScrollRef} className="flex-1 overflow-auto p-4 sm:p-6">
            <Card className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    {formSections[currentSection].title}
                  </h2>
                  <NavigationIndicator
                    currentSection={currentSection}
                    totalSections={formSections.length}
                    className="mt-2"
                  />
                </div>
                {isAutoSaving && (
                  <div className="flex items-center text-xs text-gray-500">
                    <div className="animate-spin h-3 w-3 mr-1 border-2 border-gray-400 border-t-transparent rounded-full" />
                    {t("pages.resumeBuilder.actions.saving")}
                  </div>
                )}
              </div>

              <FormSectionRenderer
                ref={formSectionRef}
                currentSection={currentSection}
                formData={formData}
                updatePersonalField={updatePersonalFieldWithSave}
                updateSummary={updateSummaryWithSave}
                updateSection={updateSection}
                setFormData={setFormData}
                selectedTemplate={selectedTemplate}
                setSelectedTemplate={setSelectedTemplateWithSave}
                onPreviewTemplate={(templateId) => {
                  setSelectedTemplateWithSave(templateId);
                }}
                summaryTextareaRef={summaryTextareaRef}
                formSections={formSections}
                isAutoSaving={isAutoSaving}
                queueSave={queueSave}
                checkPermission={checkPermission}
              />

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentSection === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("pages.resumeBuilder.actions.previous")}
                </Button>
                {currentSection === formSections.length - 1 ? (
                  <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {t("pages.resumeBuilder.actions.save")}
                  </Button>
                ) : (
                  <Button onClick={handleNext}>
                    {t("pages.resumeBuilder.actions.next")}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Right panel - Live Preview (desktop only) */}
        <div className="hidden lg:block lg:w-1/2 border-l">
          <LivePreviewPanel data={formData} templateId={selectedTemplate} />
        </div>
      </div>

      {/* Mobile preview sheet */}
      <MobilePreviewSheet data={formData} templateId={selectedTemplate} />

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
      />

      <KeyboardShortcutsHelp
        isOpen={showKeyboardHelp}
        onClose={() => setShowKeyboardHelp(false)}
      />
    </div>
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
