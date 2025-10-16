import "./globals.css";
import { Providers } from "@/app/providers";
export const metadata = {
  title: "FitGym",
  description: "Administración de gimnasio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}