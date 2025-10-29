import { format, parse } from "date-fns";

/**
 * Formato estándar para almacenar fechas (yyyy-MM-dd)
 * Compatible con SQL DATE y fácil de parsear
 */
export const DATE_STORAGE_FORMAT = "yyyy-MM-dd";

/**
 * Formato estándar para mostrar fechas (dd/MM/yyyy)
 */
export const DATE_DISPLAY_FORMAT = "dd/MM/yyyy";

/**
 * Convierte un objeto Date o string ISO a formato yyyy-MM-dd
 * @param date - Date object, string ISO, o null/undefined
 * @returns String en formato yyyy-MM-dd o empty string si inválido
 */
export function formatDateToStorage(date: Date | string | null | undefined): string {
    if (!date) return "";

    try {
        if (typeof date === "string") {
            // Si ya está en formato yyyy-MM-dd, devolverlo
            if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                return date;
            }
            // Si es ISO string, parsear y formatear
            const parsed = new Date(date);
            if (!isNaN(parsed.getTime())) {
                return format(parsed, DATE_STORAGE_FORMAT);
            }
        } else if (date instanceof Date && !isNaN(date.getTime())) {
            return format(date, DATE_STORAGE_FORMAT);
        }
    } catch (error) {
        console.warn("Error formateando fecha:", date, error);
    }

    return "";
}

/**
 * Convierte una fecha en formato yyyy-MM-dd a formato dd/MM/yyyy para mostrar
 * @param dateString - String en formato yyyy-MM-dd
 * @returns String en formato dd/MM/yyyy o empty string si inválido
 */
export function formatDateToDisplay(dateString: string | null | undefined): string {
    if (!dateString || dateString.trim() === "") return "";

    try {
        const parsed = parse(dateString, DATE_STORAGE_FORMAT, new Date());
        if (!isNaN(parsed.getTime())) {
            return format(parsed, DATE_DISPLAY_FORMAT);
        }
    } catch (error) {
        console.warn("Error formateando fecha para mostrar:", dateString, error);
    }

    return "";
}

/**
 * Convierte un Date object de Prisma a string yyyy-MM-dd
 * Útil cuando se reciben datos del API
 */
export function parsePrismaDate(date: Date | null | undefined): string {
    return formatDateToStorage(date);
}

/**
 * Valida si una fecha en formato yyyy-MM-dd es válida
 */
export function isValidDateString(dateString: string | null | undefined): boolean {
    if (!dateString || dateString.trim() === "") return false;

    try {
        const parsed = parse(dateString, DATE_STORAGE_FORMAT, new Date());
        return !isNaN(parsed.getTime());
    } catch {
        return false;
    }
}
