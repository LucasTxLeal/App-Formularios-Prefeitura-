import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vigilância em Saúde do Trabalhador | Plataforma de Relatórios",
  description: "Plataforma municipal de formulários de segurança do trabalho",
  icons: {
    icon: "/favicon-256.jpg",
    shortcut: "/favicon-256.jpg",
    apple: "/favicon-256.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-brand-slate-50 text-brand-slate-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
