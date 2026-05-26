import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "./components/SiteFooter";

export const metadata: Metadata = {
  title: "Projeto Brenda",
  description:
    "Hospedagem solidária para familiares de pessoas em tratamento ou acompanhamento hospitalar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
