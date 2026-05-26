"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { SiteHeader } from "../components/SiteHeader";
import { TextField } from "../components/Field";

export default function EntrarPage() {
  const router = useRouter();
  const [done, setDone] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.localStorage.setItem("pb-auth", "signed-in");
    setDone(true);
    window.setTimeout(() => router.push("/buscar"), 600);
  }

  return (
    <main className="min-h-screen quiet-pattern">
      <SiteHeader current="entrar" />
      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
        <div className="max-w-2xl lg:pt-8">
          <p className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.12em] text-[var(--rose-dark)] shadow-sm">
            acesso protegido
          </p>
          <h1 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
            Login simples para proteger familias e anfitrioes.
          </h1>
          <p className="mt-5 leading-8 text-[var(--muted)]">
            Nesta versao, o login e uma simulacao local. Depois ele sera ligado
            ao Supabase Auth, com verificacao e permissoes reais.
          </p>
        </div>

        <form className="soft-shell rounded-[2rem] p-6 md:p-8" onSubmit={handleSubmit}>
          <div className="grid gap-5">
            {done ? (
              <div className="rounded-2xl border border-[#f7a7bd] bg-white px-4 py-3 text-sm font-bold text-[var(--rose-dark)]">
                Login confirmado. Redirecionando...
              </div>
            ) : null}
            <TextField label="E-mail" name="email" required type="email" />
            <TextField label="Senha" name="password" required type="password" />
            <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--brand-dark)] px-6 font-black text-white shadow-lg shadow-[#19101435] transition hover:bg-[var(--brand)]">
              Entrar
              <LogIn aria-hidden size={18} />
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
