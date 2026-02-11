"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Languages,
  FileText,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { TemplateThumbnail } from "@/components/resume-builder/TemplateThumbnail";

// Animated counter hook
function useCountUp(end: number, duration: number = 2000, start: number = 0) {
  const [count, setCount] = useState(start);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          const startTime = Date.now();
          const range = end - start;

          const updateCount = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(start + range * easeOutQuart));

            if (progress < 1) {
              requestAnimationFrame(updateCount);
            } else {
              setCount(end);
            }
          };
          updateCount();
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById("stats-counter");
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [end, duration, start, hasStarted]);

  return count;
}

// 3D Interactive Template Card Component
interface InteractiveTemplateCardProps {
  templateId: string;
  baseRotation: number;
  shadowColor?: string;
  isFeatured?: boolean;
}

function InteractiveTemplateCard({
  templateId,
  baseRotation,
  shadowColor = "blue-500",
  isFeatured = false,
}: InteractiveTemplateCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Calculate rotation based on mouse position (max 15 degrees)
    const maxRotation = 15;
    const newRotateY = (mouseX / (rect.width / 2)) * maxRotation;
    const newRotateX = -(mouseY / (rect.height / 2)) * maxRotation;

    setRotateX(newRotateX);
    setRotateY(newRotateY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const scale = isHovered ? 1.1 : 1;
  const shadowIntensity = isHovered ? 30 : 20;

  return (
    <div
      className="relative card-3d-container"
      style={{
        perspective: "1000px",
        perspectiveOrigin: "center center",
      }}
    >
      <div
        ref={cardRef}
        className={`
          relative w-56 md:w-64 h-72 md:h-80 
          rounded-xl shadow-2xl border
          transition-all duration-300 ease-out
          ${
            isFeatured
              ? "bg-gradient-to-br from-white to-blue-50/30 border-2 border-blue-200"
              : "bg-white border border-gray-100"
          }
        `}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `
            rotateY(${baseRotation + rotateY}deg) 
            rotateX(${rotateX}deg) 
            scale(${scale})
            translateZ(0)
          `,
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          willChange: isHovered ? 'transform' : 'auto',
          boxShadow: isHovered
            ? `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1), 0 0 50px -10px rgba(59, 130, 246, ${shadowIntensity / 100})`
            : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
      >
        <div
          className="w-full h-full p-4 rounded-xl overflow-hidden"
          style={{
            transform: "translateZ(20px)",
            transformStyle: "preserve-3d",
          }}
        >
          <TemplateThumbnail
            templateId={templateId}
            className="w-full h-full rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const { t } = useLanguage();
  const resumesCount = useCountUp(10000);
  const successRate = useCountUp(95);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Enhanced gradient mesh background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50"></div>

        {/* Animated gradient orbs - optimized with will-change */}
        <div 
          className="absolute -top-40 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 opacity-20 blur-3xl animate-pulse"
          style={{ willChange: 'opacity' }}
        ></div>
        <div
          className="absolute -bottom-40 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 opacity-20 blur-3xl animate-pulse"
          style={{ animationDelay: "1s", willChange: 'opacity' }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-400 to-pink-400 opacity-10 blur-3xl animate-pulse"
          style={{ animationDelay: "2s", willChange: 'opacity' }}
        ></div>

        {/* Animated particles - deterministic positions to avoid hydration mismatch */}
        <div className="absolute inset-0" style={{ contentVisibility: 'auto' }}>
          {[
            { l: 12, t: 8, d: 0.2, dur: 3.5 },
            { l: 85, t: 22, d: 1.1, dur: 4.8 },
            { l: 34, t: 65, d: 2.4, dur: 5.2 },
            { l: 67, t: 41, d: 0.7, dur: 3.9 },
            { l: 91, t: 78, d: 1.8, dur: 6.1 },
            { l: 23, t: 93, d: 2.9, dur: 4.3 },
            { l: 56, t: 15, d: 0.4, dur: 5.7 },
            { l: 78, t: 52, d: 1.5, dur: 3.2 },
            { l: 45, t: 87, d: 2.1, dur: 6.5 },
            { l: 8, t: 35, d: 0.9, dur: 4.6 },
          ].map((p, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-30 animate-float"
              style={{
                left: `${p.l}%`,
                top: `${p.t}%`,
                animationDelay: `${p.d}s`,
                animationDuration: `${p.dur}s`,
                willChange: 'transform',
              }}
            ></div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 animate-fade-in-up">
            {/* Main Heading with gradient text */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900">
                {t("hero.title")}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
              {t("hero.subtitle")}
            </p>

            {/* Feature highlights with better styling */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  {t("hero.features.ai")}
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  {t("hero.features.templates")}
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                <Languages className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  {t("hero.features.languages")}
                </span>
              </div>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <SignedOut>
                <SignUpButton>
                  <Button
                    size="lg"
                    className="text-base px-8 py-6 h-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-200 font-semibold"
                  >
                    {t("hero.cta.primary")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="text-base px-8 py-6 h-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-200 font-semibold"
                  >
                    {t("hero.cta.primary")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </SignedIn>
            </div>

            {/* Enhanced Social proof with animated counters */}
            <div
              id="stats-counter"
              className="mt-12 pt-8 border-t border-gray-200/50"
            >
              <p className="text-sm text-gray-500 mb-6 font-medium">
                {t("hero.socialProof.trustedBy")}
              </p>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-1">
                    {resumesCount.toLocaleString()}+
                  </div>
                  <div className="text-sm text-gray-500">
                    {t("hero.socialProof.resumesCreated")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600 mb-1">
                    {successRate}%
                  </div>
                  <div className="text-sm text-gray-500">
                    {t("hero.socialProof.successRate")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 mb-1">
                    3
                  </div>
                  <div className="text-sm text-gray-500">
                    {t("hero.socialProof.languages")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced 3D Interactive Resume Preview */}
          <div className="mt-20 max-w-6xl mx-auto" style={{ contentVisibility: 'auto' }}>
            <div className="flex flex-wrap justify-center items-center gap-6 lg:gap-8 -space-x-4 lg:-space-x-8">
              {/* Resume Card 1 - Modern Template (Left, rotated right) */}
              <div className="relative z-0 hover:z-20 transition-z duration-300">
                <InteractiveTemplateCard
                  templateId="modern"
                  baseRotation={12}
                  shadowColor="blue-500"
                />
              </div>

              {/* Resume Card 2 - Creative Template (Center, Featured) */}
              <div className="relative z-10 hover:z-30 transition-z duration-300">
                <InteractiveTemplateCard
                  templateId="creative"
                  baseRotation={0}
                  shadowColor="purple-500"
                  isFeatured={true}
                />
              </div>

              {/* Resume Card 3 - Executive Template (Right, rotated left) */}
              <div className="relative z-0 hover:z-20 transition-z duration-300">
                <InteractiveTemplateCard
                  templateId="executive"
                  baseRotation={-12}
                  shadowColor="indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-gray-400" />
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        /* Enhanced 3D card rendering */
        @supports (transform-style: preserve-3d) {
          .card-3d-container {
            transform-style: preserve-3d;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
          }
        }
      `}</style>
    </section>
  );
}
