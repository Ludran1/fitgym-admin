/*
  Warnings:

  - You are about to drop the `ejercicios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rutina_ejercicios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rutina_template_ejercicios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rutina_templates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rutinas` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "rutina_ejercicios" DROP CONSTRAINT "rutina_ejercicios_rutina_id_fkey";

-- DropForeignKey
ALTER TABLE "rutina_template_ejercicios" DROP CONSTRAINT "rutina_template_ejercicios_template_id_fkey";

-- DropForeignKey
ALTER TABLE "rutinas" DROP CONSTRAINT "rutinas_cliente_id_fkey";

-- DropTable
DROP TABLE "ejercicios";

-- DropTable
DROP TABLE "rutina_ejercicios";

-- DropTable
DROP TABLE "rutina_template_ejercicios";

-- DropTable
DROP TABLE "rutina_templates";

-- DropTable
DROP TABLE "rutinas";

-- DropEnum
DROP TYPE "EstadoRutina";
