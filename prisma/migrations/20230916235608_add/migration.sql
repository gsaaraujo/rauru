/*
  Warnings:

  - You are about to drop the column `createdAt` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `doctorId` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `patientId` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `schedules` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `schedules` table. All the data in the column will be lost.
  - You are about to drop the column `doctorId` on the `schedules` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `schedules` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `schedules` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `tokenized_payments` table. All the data in the column will be lost.
  - You are about to drop the column `creditCardToken` on the `tokenized_payments` table. All the data in the column will be lost.
  - You are about to drop the column `patientId` on the `tokenized_payments` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `tokenized_payments` table. All the data in the column will be lost.
  - Added the required column `doctor_id` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patient_id` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `doctor_id` to the `schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `credit_card_token` to the `tokenized_payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patient_id` to the `tokenized_payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `tokenized_payments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TimeSlotStatus" AS ENUM ('AVAILABLE', 'UNAVAILABLE');

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "createdAt",
DROP COLUMN "doctorId",
DROP COLUMN "patientId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "doctor_id" UUID NOT NULL,
ADD COLUMN     "patient_id" UUID NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "schedules" DROP COLUMN "createdAt",
DROP COLUMN "date",
DROP COLUMN "doctorId",
DROP COLUMN "status",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "doctor_id" UUID NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "tokenized_payments" DROP COLUMN "createdAt",
DROP COLUMN "creditCardToken",
DROP COLUMN "patientId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "credit_card_token" TEXT NOT NULL,
ADD COLUMN     "patient_id" UUID NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- DropEnum
DROP TYPE "ScheduleStatus";

-- CreateTable
CREATE TABLE "patients" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctors" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_slots" (
    "id" UUID NOT NULL,
    "schedule_id" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "TimeSlotStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_slots_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_slots" ADD CONSTRAINT "time_slots_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokenized_payments" ADD CONSTRAINT "tokenized_payments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
