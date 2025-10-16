
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Database } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
type Cliente = Database['public']['Tables']['clientes']['Row'];
import { format, addMonths, parse } from "date-fns";
import QRCode from "react-qr-code";
// Usamos el datepicker nativo del navegador con Input type="date"


export const formSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  email: z.string().email({ message: "Correo electrónico inválido" }),
  telefono: z.string().min(9, { message: "El teléfono debe tener al menos 9 caracteres" }),
  dni: z
    .string()
    .min(1, { message: "El DNI es requerido" })
    .refine((val) => /^\d{7,20}$/.test(val), {
      message: "El DNI debe contener entre 7 y 20 dígitos",
    }),
  fecha_nacimiento: z.string().min(1, { message: "La fecha de nacimiento es requerida" }),
  membresia_id: z.string().optional(),
  fecha_inicio: z.string().optional(),
  fecha_fin: z.string().optional(),
});

export type FormValues = z.infer<typeof formSchema>;

interface ClienteFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: FormValues) => void;
  clienteActual: Cliente | null;
  membresiasDisponibles: { id: string; nombre: string; precio: number; tipo: string; modalidad: string; duracion?: number }[];
  saveCliente?: (values: FormValues, options?: { closeDialog?: boolean }) => Promise<any>;
}

export function ClienteForm({ isOpen, onOpenChange, onSubmit, clienteActual, membresiasDisponibles, saveCliente }: ClienteFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      email: "",
      telefono: "",
      dni: "",
      fecha_nacimiento: "",
      membresia_id: "",
      fecha_inicio: format(new Date(), "yyyy-MM-dd"), // Fecha de hoy por defecto
      fecha_fin: "",
    },
  });

  // Función para calcular fecha de vencimiento
  const calcularFechaVencimiento = (membresiaId: string) => {
    const membresiaSeleccionada = membresiasDisponibles.find(m => m.id === membresiaId);
    if (membresiaSeleccionada && membresiaSeleccionada.duracion) {
      const fechaInicioStr = form.getValues("fecha_inicio") || format(new Date(), "yyyy-MM-dd");
      const fechaInicio = parse(fechaInicioStr, "yyyy-MM-dd", new Date());
      const fechaVencimiento = addMonths(fechaInicio, membresiaSeleccionada.duracion);
      return format(fechaVencimiento, "yyyy-MM-dd");
    }
    return "";
  };

  // Efecto para actualizar fecha de vencimiento cuando cambia la membresía o fecha de inicio
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "membresia_id" || name === "fecha_inicio") {
        if (value.membresia_id && value.fecha_inicio) {
          const fechaVencimiento = calcularFechaVencimiento(value.membresia_id);
          if (fechaVencimiento) {
            form.setValue("fecha_fin", fechaVencimiento);
          }
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, membresiasDisponibles]);

  useEffect(() => {
    if (clienteActual) {
      form.reset({
        nombre: clienteActual.nombre,
        email: clienteActual.email,
        telefono: clienteActual.telefono,
        dni: clienteActual.dni || "",
        fecha_nacimiento: clienteActual.fecha_nacimiento || "",
        membresia_id: clienteActual.membresia_id || "",
        fecha_inicio: clienteActual.fecha_inicio ? clienteActual.fecha_inicio.split('T')[0] : "",
        fecha_fin: clienteActual.fecha_fin ? clienteActual.fecha_fin.split('T')[0] : "",
      });
    } else {
      form.reset({
        nombre: "",
        email: "",
        telefono: "",
        fecha_nacimiento: "",
        membresia_id: "",
        fecha_inicio: format(new Date(), "yyyy-MM-dd"), // Fecha de hoy por defecto
        fecha_fin: "",
      });
    }
  }, [clienteActual, form]);


  const handleSubmit = form.handleSubmit(async (values) => {
    const dni = (values.dni || "").trim();
    if (dni) {
      let query = supabase
        .from("clientes")
        .select("id")
        .eq("dni", dni);
      if (clienteActual?.id) {
        query = query.neq("id", clienteActual.id);
      }
      const { data, error } = await query;
      if (error) {
        form.setError("dni", {
          type: "manual",
          message: `Error verificando DNI: ${error.message}`,
        });
        return;
      }
      if (data && data.length > 0) {
        form.setError("dni", {
          type: "manual",
          message: "El DNI ya está registrado",
        });
        return;
      }
    }
    onSubmit(values);
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">
            {clienteActual ? "Editar Cliente" : "Nuevo Cliente"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {clienteActual
              ? "Modifica los datos del cliente"
              : "Completa los datos para registrar un nuevo cliente"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna 1: Datos personales */}
              <div className="space-y-4 md:space-y-6">
                <p className="text-sm font-medium text-muted-foreground">Datos personales</p>
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Nombre completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Juan Pérez" className="text-sm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Email</FormLabel>
                      <FormControl>
                        <Input placeholder="email@ejemplo.com" className="text-sm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="912345678" className="text-sm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dni"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">DNI</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678" className="text-sm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fecha_nacimiento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Fecha de nacimiento</FormLabel>
                      <FormControl>
                        <Input type="date" className="text-sm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Columna 2: Membresía y fechas */}
              <div className="space-y-4 md:space-y-6">
                <p className="text-sm font-medium text-muted-foreground">Membresía y fechas</p>
                <FormField
                  control={form.control}
                  name="membresia_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Membresía</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Selecciona una membresía" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {membresiasDisponibles.map((membresia) => (
                            <SelectItem key={membresia.id} value={membresia.id}>
                              <div className="flex flex-col">
                                <div className="font-medium text-sm">{membresia.nombre}</div>
                                <div className="text-xs text-muted-foreground">
                                  {membresia.tipo.charAt(0).toUpperCase() + membresia.tipo.slice(1)} • {membresia.modalidad.charAt(0).toUpperCase() + membresia.modalidad.slice(1)} • S/ {membresia.precio}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fecha_inicio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Fecha de inicio</FormLabel>
                      <FormControl>
                        <Input type="date" className="text-sm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fecha_fin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Fecha de vencimiento</FormLabel>
                      <FormControl>
                        <Input type="date" className="text-sm" {...field} readOnly disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            {/* Sección de QR para asistencia */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">Código QR de asistencia</p>
              </div>
              {clienteActual ? (
                <div className="mt-3 flex items-center gap-4">
                  <div className="bg-white p-3 rounded-md">
                    <QRCode value={`CLIENT:${clienteActual.id}`} size={128} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Escanea este QR en la pantalla de Asistencia para registrar la entrada.
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  Guarda el cliente para generar su QR.
                </p>
              )}
            </div>
            <DialogFooter className="flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:items-center sm:justify-end">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="w-full sm:w-auto text-sm">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit" className="w-full sm:w-auto text-sm" disabled={form.formState.isSubmitting}>
                  {clienteActual ? "Actualizar" : "Guardar"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
