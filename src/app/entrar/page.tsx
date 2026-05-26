"use client";

import { useState } from "react";
import { Apple } from "lucide-react";
import { SiteHeader } from "../components/SiteHeader";
import { supabase } from "../lib/supabase";

export default function EntrarPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadingProvider, setLoadingProvider] = useState<"google" | "apple" | "">("");

  async function handleOAuth(provider: "google" | "apple") {
    setError("");
    setMessage("");
    setLoadingProvider(provider);

    if (!supabase) {
      setError("Supabase não está configurado neste ambiente.");
      setLoadingProvider("");
      return;
    }

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/perfil`,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoadingProvider("");
    }
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
            Entre com uma conta verificada.
          </h1>
          <p className="mt-5 leading-8 text-[var(--muted)]">
            Para simplificar o acesso e reduzir cadastros falsos, o Projeto
            Brenda usa login com provedores confiáveis. Depois do login, você
            pode solicitar acolhimento ou cadastrar um espaço.
          </p>
        </div>

        <section className="soft-shell rounded-[2rem] p-6 md:p-8">
          <div className="grid gap-5">
            {message ? (
              <div className="rounded-2xl border border-[#f7a7bd] bg-white px-4 py-3 text-sm font-bold text-[var(--rose-dark)]">
                {message}
              </div>
            ) : null}
            {error ? (
              <div className="rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm font-bold text-[#be123c]">
                {error}
              </div>
            ) : null}

            <div className="grid gap-3">
              <button
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-[var(--brand-dark)] bg-white px-5 font-black"
                disabled={Boolean(loadingProvider)}
                onClick={() => handleOAuth("google")}
                type="button"
              >
                <span className="text-lg">G</span>
                {loadingProvider === "google" ? "Conectando..." : "Entrar com Google"}
              </button>
              <button
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-[var(--brand-dark)] bg-white px-5 font-black"
                disabled={Boolean(loadingProvider)}
                onClick={() => handleOAuth("apple")}
                type="button"
              >
                <Apple aria-hidden size={18} />
                {loadingProvider === "apple" ? "Conectando..." : "Entrar com Apple"}
              </button>
            </div>

            <p className="text-center text-sm leading-6 text-[var(--muted)]">
              Se for seu primeiro acesso, a conta será criada automaticamente
              pelo provedor escolhido.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
