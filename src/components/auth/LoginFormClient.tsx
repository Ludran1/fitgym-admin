"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { login } from "@/app/actions/auth";
import { loginFormSchema, type LoginFormValues } from "@/lib/validations/auth-schemas";
import { AUTH_MESSAGES } from "@/lib/auth-utils";

export function LoginFormClient() {
    const [showPassword, setShowPassword] = useState(false);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: LoginFormValues) {
        startTransition(async () => {
            try {
                const formData = new FormData();
                formData.append('email', values.email);
                formData.append('password', values.password);

                const result = await login(formData);

                // Si result existe y no es exitoso, mostrar error
                if (result && !result.success) {
                    toast({
                        variant: "destructive",
                        title: AUTH_MESSAGES.LOGIN.ERROR_TITLE,
                        description: result.error || AUTH_MESSAGES.LOGIN.ERROR_DESCRIPTION,
                    });
                }
                // Si es exitoso, el Server Action hace redirect() y nunca retorna
            } catch (error: any) {
                // El redirect() lanza NEXT_REDIRECT que no debemos capturar
                if (error?.message === 'NEXT_REDIRECT') {
                    throw error;
                }

                console.error("Error en login:", error);
                toast({
                    variant: "destructive",
                    title: AUTH_MESSAGES.LOGIN.ERROR_TITLE,
                    description: error?.message || AUTH_MESSAGES.LOGIN.ERROR_DESCRIPTION,
                });
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••"
                                        autoComplete="current-password"
                                        disabled={isPending}
                                        {...field}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-2 top-1/2 -translate-y-1/2"
                                        onClick={() => setShowPassword((v) => !v)}
                                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                        aria-pressed={showPassword}
                                        tabIndex={0}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? "Iniciando sesión..." : "Iniciar sesión"}
                </Button>
            </form>
        </Form>
    );
}
