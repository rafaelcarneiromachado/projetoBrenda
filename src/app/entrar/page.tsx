"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Apple, LogIn, UserPlus } from "lucide-react";
import { SiteHeader } from "../components/SiteHeader";
import { TextField } from "../components/Field";
import { supabase } from "../lib/supabase";

type Mode = "signin" | "signup";

export default function EntrarPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function ensureProfile(userId: string, fullName: string, phone: string) {
    if (!supabase) {
      return;
    }

    await supabase.from("profiles").upsert({
      id: userId,
      full_name: fullName || null,
      phone: phone || null,
      role: "family",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (!supabase) {
      setError("Supabase não está configurado neste ambiente.");
      setLoading(false);
      return;
    }

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const fullName = String(form.get("fullName") ?? "");
    const phone = String(form.get("phone") ?? "");

    let result;

    try {
      result =
        mode === "signup"
          ? await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  full_name: fullName,
                  phone,
                },
              },
            })
          : await supabase.auth.signInWithPassword({ email, password });
    } catch {
      setError(
        "Não foi possível conectar ao Supabase. Verifique a Project URL e sua conexão.",
      );
      setLoading(false);
      return;
    }

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    if (result.data.user) {
      await ensureProfile(result.data.user.id, fullName, phone);
    }

    if (mode === "signup") {
      if (result.data.session) {
        setMessage("Conta criada e login realizado. Redirecionando...");
        window.setTimeout(() => router.push("/buscar"), 1200);
      } else {
        setMessage(
          "Conta criada. Verifique seu e-mail para confirmar o cadastro e depois entre com sua senha.",
        );
        setMode("signin");
      }

      setLoading(false);
      return;
    }

    setMessage("Login confirmado. Redirecionando...");
    window.setTimeout(() => router.push("/buscar"), 900);
    setLoading(false);
  }

  async function handleOAuth(provider: "google" | "apple") {
    setError("");
    setMessage("");

    if (!supabase) {
      setError("Supabase não está configurado neste ambiente.");
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
            Entre para solicitar ou oferecer hospedagem.
          </h1>
          <p className="mt-5 leading-8 text-[var(--muted)]">
            O acesso ajuda a proteger famílias, anfitriões e informações
            sensíveis. Depois do login, você pode solicitar acolhimento ou
            cadastrar um espaço.
          </p>
        </div>

        <form className="soft-shell rounded-[2rem] p-6 md:p-8" onSubmit={handleSubmit}>
          <div className="mb-6 grid grid-cols-2 rounded-full bg-white p-1 text-sm font-black">
            <button
              className={`rounded-full px-4 py-3 transition ${
                mode === "signin" ? "bg-[var(--brand-dark)] text-white" : ""
              }`}
              onClick={() => setMode("signin")}
              type="button"
            >
              Entrar
            </button>
            <button
              className={`rounded-full px-4 py-3 transition ${
                mode === "signup" ? "bg-[var(--brand-dark)] text-white" : ""
              }`}
              onClick={() => setMode("signup")}
              type="button"
            >
              Criar conta
            </button>
          </div>

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

            {mode === "signup" ? (
              <div className="grid gap-5 md:grid-cols-2">
                <TextField label="Nome completo" name="fullName" required />
                <TextField label="Telefone com WhatsApp" name="phone" required />
              </div>
            ) : null}

            <TextField label="E-mail" name="email" required type="email" />
            <TextField
              hint={mode === "signup" ? "Use no mínimo 6 caracteres." : undefined}
              label="Senha"
              minLength={6}
              name="password"
              required
              type="password"
            />

            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--brand-dark)] px-6 font-black text-white shadow-lg shadow-[#19101435] transition hover:bg-[var(--brand)] disabled:opacity-60"
              disabled={loading}
            >
              {mode === "signup" ? "Criar conta" : "Entrar"}
              {mode === "signup" ? (
                <UserPlus aria-hidden size={18} />
              ) : (
                <LogIn aria-hidden size={18} />
              )}
            </button>

            <div className="relative py-2 text-center text-sm font-bold text-[var(--muted)]">
              <span className="bg-[#fff9fb] px-3">ou continue com</span>
            </div>

            <div className="grid gap-3">
              <button
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-[var(--brand-dark)] bg-white px-5 font-black"
                onClick={() => handleOAuth("google")}
                type="button"
              >
                <span className="text-lg">G</span>
                Entrar com Google
              </button>
              <button
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-[var(--brand-dark)] bg-white px-5 font-black"
                onClick={() => handleOAuth("apple")}
                type="button"
              >
                <Apple aria-hidden size={18} />
                Entrar com Apple
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}
