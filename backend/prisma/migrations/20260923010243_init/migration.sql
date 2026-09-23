-- CreateEnum
CREATE TYPE "SystemStatus" AS ENUM ('active', 'coming_soon');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('draft', 'generated');

-- CreateEnum
CREATE TYPE "RuleType" AS ENUM ('hard', 'soft');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "systems" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "SystemStatus" NOT NULL,

    CONSTRAINT "systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_systems" (
    "userId" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_systems_pkey" PRIMARY KEY ("userId","systemId")
);

-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "logoUrl" TEXT,
    "unitsCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "period" TEXT,
    "academicYear" TEXT,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teachers" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "cpf" TEXT,
    "birthDate" TIMESTAMP(3),
    "unit" TEXT NOT NULL,
    "subjects" TEXT[],
    "contractType" TEXT,
    "maxWeeklyClasses" INTEGER NOT NULL DEFAULT 20,
    "preferredShift" TEXT NOT NULL DEFAULT 'Manhã',
    "twinClasses" BOOLEAN NOT NULL DEFAULT false,
    "avoidGaps" BOOLEAN NOT NULL DEFAULT false,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shift" TEXT NOT NULL DEFAULT 'Manhã',
    "studentsCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weeklyHours" INTEGER NOT NULL DEFAULT 2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_slots" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rules" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "RuleType" NOT NULL DEFAULT 'soft',
    "weight" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_availability_slots" (
    "teacherId" TEXT NOT NULL,
    "timeSlotId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "teacher_availability_slots_pkey" PRIMARY KEY ("teacherId","timeSlotId","day")
);

-- CreateTable
CREATE TABLE "class_availability_slots" (
    "classId" TEXT NOT NULL,
    "timeSlotId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "class_availability_slots_pkey" PRIMARY KEY ("classId","timeSlotId","day")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "systems_key_key" ON "systems"("key");

-- CreateIndex
CREATE INDEX "user_systems_systemId_idx" ON "user_systems"("systemId");

-- CreateIndex
CREATE INDEX "schools_ownerId_idx" ON "schools"("ownerId");

-- CreateIndex
CREATE INDEX "schedules_schoolId_idx" ON "schedules"("schoolId");

-- CreateIndex
CREATE INDEX "teachers_schoolId_idx" ON "teachers"("schoolId");

-- CreateIndex
CREATE INDEX "classes_schoolId_idx" ON "classes"("schoolId");

-- CreateIndex
CREATE INDEX "subjects_schoolId_idx" ON "subjects"("schoolId");

-- CreateIndex
CREATE INDEX "rooms_schoolId_idx" ON "rooms"("schoolId");

-- CreateIndex
CREATE INDEX "time_slots_schoolId_idx" ON "time_slots"("schoolId");

-- CreateIndex
CREATE INDEX "rules_schoolId_idx" ON "rules"("schoolId");

-- CreateIndex
CREATE INDEX "teacher_availability_slots_timeSlotId_idx" ON "teacher_availability_slots"("timeSlotId");

-- CreateIndex
CREATE INDEX "class_availability_slots_timeSlotId_idx" ON "class_availability_slots"("timeSlotId");

-- AddForeignKey
ALTER TABLE "user_systems" ADD CONSTRAINT "user_systems_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_systems" ADD CONSTRAINT "user_systems_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "systems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_slots" ADD CONSTRAINT "time_slots_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rules" ADD CONSTRAINT "rules_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_availability_slots" ADD CONSTRAINT "teacher_availability_slots_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_availability_slots" ADD CONSTRAINT "teacher_availability_slots_timeSlotId_fkey" FOREIGN KEY ("timeSlotId") REFERENCES "time_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_availability_slots" ADD CONSTRAINT "class_availability_slots_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_availability_slots" ADD CONSTRAINT "class_availability_slots_timeSlotId_fkey" FOREIGN KEY ("timeSlotId") REFERENCES "time_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
