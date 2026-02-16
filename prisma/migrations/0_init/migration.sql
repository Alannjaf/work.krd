-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ResumeStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SectionType" AS ENUM ('WORK_EXPERIENCE', 'EDUCATION', 'SKILLS', 'LANGUAGES', 'CERTIFICATIONS', 'PROJECTS', 'ACHIEVEMENTS', 'REFERENCES', 'CUSTOM');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PRO');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "template" TEXT NOT NULL DEFAULT 'modern',
    "status" "ResumeStatus" NOT NULL DEFAULT 'DRAFT',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "publicSlug" TEXT,
    "personalInfo" JSONB,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeSection" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "type" "SectionType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "order" INTEGER NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "paymentMethod" TEXT,
    "paymentId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "resumeCount" INTEGER NOT NULL DEFAULT 0,
    "aiUsageCount" INTEGER NOT NULL DEFAULT 0,
    "exportCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "importCount" INTEGER NOT NULL DEFAULT 0,
    "atsUsageCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" SERIAL NOT NULL,
    "maxFreeResumes" INTEGER NOT NULL DEFAULT 10,
    "maxFreeAIUsage" INTEGER NOT NULL DEFAULT 100,
    "maxFreeExports" INTEGER NOT NULL DEFAULT 20,
    "maxFreeImports" INTEGER NOT NULL DEFAULT 1,
    "maxFreeATSChecks" INTEGER NOT NULL DEFAULT 0,
    "maxProResumes" INTEGER NOT NULL DEFAULT -1,
    "maxProAIUsage" INTEGER NOT NULL DEFAULT -1,
    "maxProExports" INTEGER NOT NULL DEFAULT -1,
    "maxProImports" INTEGER NOT NULL DEFAULT -1,
    "maxProATSChecks" INTEGER NOT NULL DEFAULT -1,
    "proPlanPrice" INTEGER NOT NULL DEFAULT 5000,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "freeTemplates" JSONB NOT NULL DEFAULT '["modern"]',
    "proTemplates" JSONB NOT NULL DEFAULT '["modern"]',
    "photoUploadPlans" JSONB NOT NULL DEFAULT '["PRO"]',

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL,
    "amount" INTEGER NOT NULL,
    "screenshotData" BYTEA NOT NULL,
    "screenshotType" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Resume_publicSlug_key" ON "Resume"("publicSlug");

-- CreateIndex
CREATE INDEX "Resume_userId_idx" ON "Resume"("userId");

-- CreateIndex
CREATE INDEX "Resume_publicSlug_idx" ON "Resume"("publicSlug");

-- CreateIndex
CREATE INDEX "Resume_userId_updatedAt_idx" ON "Resume"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "ResumeSection_resumeId_idx" ON "ResumeSection"("resumeId");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeSection_resumeId_order_key" ON "ResumeSection"("resumeId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeSection" ADD CONSTRAINT "ResumeSection_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

