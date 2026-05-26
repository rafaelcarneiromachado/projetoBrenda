import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";

type FormShellProps = {
  current: "familias" | "anfitrioes" | "admin";
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function FormShell({
  current,
  eyebrow,
  title,
  description,
  children,
}: FormShellProps) {
  return (
    <main className="min-h-screen quiet-pattern">
      <SiteHeader current={current} />
      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:px-10 lg:grid-cols-[0.88fr_1.12fr] lg:px-12">
        <aside className="lg:pt-8">
          <p className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.12em] text-[var(--rose)] shadow-sm">
            {eyebrow}
          </p>
          <h1 className="mt-5 text-3xl font-black leading-tight md:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-[var(--muted)]">
            {description}
          </p>
          <div className="soft-shell mt-8 rounded-[1.5rem] p-5">
            <h2 className="text-base font-black">Nesta fase piloto</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Nenhum pedido ou oferta sera confirmado automaticamente. A
              moderacao do Projeto Brenda revisa as informacoes antes de
              aproximar familia e anfitriao.
            </p>
          </div>
        </aside>
        {children}
      </section>
    </main>
  );
}
