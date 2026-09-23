-- CreateEnum
CREATE TYPE "SolutionStatus" AS ENUM ('success', 'infeasible', 'error');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ScheduleStatus" ADD VALUE 'generating';
ALTER TYPE "ScheduleStatus" ADD VALUE 'failed';

-- AlterTable
ALTER TABLE "subjects" ADD COLUMN     "preference" INTEGER NOT NULL DEFAULT 5;

-- AlterTable
ALTER TABLE "teachers" ADD COLUMN     "preference" INTEGER NOT NULL DEFAULT 5;

-- CreateTable
CREATE TABLE "schedule_solutions" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "status" "SolutionStatus" NOT NULL,
    "messages" JSONB,
    "visualizacaoEscola" JSONB,
    "visualizacaoProfessores" JSONB,
    "visualizacaoJanelas" JSONB,
    "resumoJanelas" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_solutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "weeklyMinClasses" INTEGER NOT NULL DEFAULT 2,
    "dailyMaxClasses" INTEGER NOT NULL DEFAULT 2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "schedule_solutions_scheduleId_idx" ON "schedule_solutions"("scheduleId");

-- CreateIndex
CREATE INDEX "assignments_schoolId_idx" ON "assignments"("schoolId");

-- CreateIndex
CREATE INDEX "assignments_teacherId_idx" ON "assignments"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "assignments_classId_subjectId_key" ON "assignments"("classId", "subjectId");

-- AddForeignKey
ALTER TABLE "schedule_solutions" ADD CONSTRAINT "schedule_solutions_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
