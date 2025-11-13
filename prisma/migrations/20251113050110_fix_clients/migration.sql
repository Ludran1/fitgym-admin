/*
  Warnings:

  - You are about to drop the column `nombre_membresia` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `tipo_membresia` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `tarjetas_acceso` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `tarjetas_acceso` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."tarjetas_acceso" DROP CONSTRAINT "tarjetas_acceso_cliente_id_fkey";

-- AlterTable
ALTER TABLE "asistencias" ADD COLUMN     "duracion_minutos" INTEGER,
ADD COLUMN     "hora_entrada" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "hora_salida" TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "clientes" DROP COLUMN "nombre_membresia",
DROP COLUMN "tipo_membresia";

-- AlterTable
ALTER TABLE "tarjetas_acceso" DROP COLUMN "created_at",
DROP COLUMN "updated_at";

-- CreateTable
CREATE TABLE "configuracion_gym" (
    "id" UUID NOT NULL,
    "capacidad_maxima" INTEGER NOT NULL DEFAULT 50,
    "tiempo_permanencia_promedio" INTEGER NOT NULL DEFAULT 90,
    "alerta_aforo_porcentaje" INTEGER NOT NULL DEFAULT 80,
    "horario_apertura" VARCHAR(5) NOT NULL DEFAULT '06:00',
    "horario_cierre" VARCHAR(5) NOT NULL DEFAULT '22:00',
    "dias_operacion" TEXT[] DEFAULT ARRAY['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']::TEXT[],
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "configuracion_gym_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "asistencias_fecha_asistencia_idx" ON "asistencias"("fecha_asistencia");

-- CreateIndex
CREATE INDEX "asistencias_hora_salida_idx" ON "asistencias"("hora_salida");

-- AddForeignKey
ALTER TABLE "tarjetas_acceso" ADD CONSTRAINT "tarjetas_acceso_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
