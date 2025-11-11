import { Badge } from "@/components/ui/badge";

export const estadoStyle = {
    activa: "bg-green-500",
    vencida: "bg-red-500",
    pendiente: "bg-yellow-500",
};

// Estado de membresía (verde/rojo) como en Acceso
export const getStatus = (fechaFin: string | Date | null): 'activa' | 'por_vencer' | 'vencida' => {
    if (!fechaFin) return 'activa';
    const today = new Date();
    const end = typeof fechaFin === 'string' ? new Date(fechaFin) : fechaFin;
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const diffDays = Math.ceil((startOfEnd.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'vencida';
    if (diffDays <= 3) return 'por_vencer';
    return 'activa';
};

export const getStatusBadge = (fechaFin: string | Date | null) => {
    const status = getStatus(fechaFin);
    const text = status === 'activa' ? 'ACTIVO' : status === 'por_vencer' ? 'POR VENCER' : 'VENCIDO';
    const variant = status === 'vencida' ? 'destructive' : 'secondary';
    const extraClass = status === 'por_vencer' ? 'text-orange-500' : status === 'activa' ? 'text-gym-green' : '';
    return <Badge variant={variant} className={`text-xs ${extraClass}`}>{text}</Badge>;
};
