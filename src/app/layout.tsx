import "./globals.css";
import { Providers } from "@/app/providers";
import { metadata as SiteMetadata } from "@/app/metadata";

export const metadata = SiteMetadata;

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