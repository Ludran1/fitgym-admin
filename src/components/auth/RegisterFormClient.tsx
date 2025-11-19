"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { signup } from "@/app/actions/auth";
import { registroFormSchema, type RegistroFormValues } from "@/lib/validations/auth-schemas";
import { AUTH_MESSAGES } from "@/lib/auth-utils";

export function RegisterFormClient() {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<RegistroFormValues>({
        resolver: zodResolver(registroFormSchema),
        defaultValues: {
            nombre: "",
            email: "",
            password: "",
            confirmarPassword: "",
        },
    });

    async function onSubmit(values: RegistroFormValues) {
        startTransition(async () => {
            try {
                const formData = new FormData();
                formData.append('email', values.email);
                formData.append('password', values.password);
                formData.append('nombre', values.nombre);

                const result = await signup(formData);

                if (!result.success) {
                    toast({
                        variant: "destructive",
                        title: AUTH_MESSAGES.REGISTER.ERROR_TITLE,
                        description: result.error || AUTH_MESSAGES.REGISTER.ERROR_DESCRIPTION,
                    });
                } else {
                    toast({
                        title: AUTH_MESSAGES.REGISTER.SUCCESS_TITLE,
                        description: result.message || AUTH_MESSAGES.REGISTER.SUCCESS_DESCRIPTION,
                    });

                    // Resetear el formulario
                    form.reset();

                    // Recargar la página para mostrar el formulario de login
                    router.refresh();
                }
            } catch (error: any) {
                console.error("Error en registro:", error);
                toast({
                    variant: "destructive",
                    title: AUTH_MESSAGES.REGISTER.ERROR_TITLE,
                    description: error?.message || AUTH_MESSAGES.REGISTER.ERROR_DESCRIPTION,
                });
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre completo</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Tu nombre"
                                    autoComplete="name"
                                    disabled={isPending}
                                    {...field}
                                />
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
                            <FormLabel>Correo electrónico</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="correo@ejemplo.com"
                                    type="email"
                                    autoComplete="email"
                                    disabled={isPending}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contraseña</FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    autoComplete="new-password"
                                    disabled={isPending}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmarPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirmar contraseña</FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder="Repite la contraseña"
                                    autoComplete="new-password"
                                    disabled={isPending}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? "Creando administrador..." : "Crear administrador"}
                </Button>
            </form>
        </Form>
    );
}
