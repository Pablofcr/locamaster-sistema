import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "@/lib/notifications";
import { AuthProvider } from "@/components/providers/auth-provider";

export const metadata: Metadata = {
  title: "LocaMaster Pro V2",
  description: "Sistema completo de gestão para locadoras de equipamentos",
  keywords: ["locação", "equipamentos", "gestão", "contratos", "faturamento"],
  authors: [{ name: "LocaMaster Pro Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <AuthProvider>
          {children}
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
}
