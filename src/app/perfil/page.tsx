"use client";

import { FormEvent, useEffect, useState } from "react";
import { Save, UserCircle } from "lucide-react";
import { AuthGate } from "../components/AuthGate";
import { TextAreaField, TextField } from "../components/Field";
import { SiteHeader } from "../components/SiteHeader";
import { supabase } from "../lib/supabase";

type Profile = {
  full_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  family_info: string;
  bio: string;
  avatar_url: string;
};

const emptyProfile: Profile = {
  full_name: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  family_info: "",
  bio: "",
  avatar_url: "",
};

export default function PerfilPage() {
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted || !user) {
        setLoading(false);
        return;
      }

      setEmail(user.email ?? "");

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("full_name,phone,address,city,state,family_info,bio,avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) {
        return;
      }

      if (profileError) {
        setError(profileError.message);
      } else if (data) {
        setProfile({
          full_name: data.full_name ?? "",
          phone: data.phone ?? "",
          address: data.address ?? "",
          city: data.city ?? "",
          state: data.state ?? "",
          family_info: data.family_info ?? "",
          bio: data.bio ?? "",
          avatar_url: data.avatar_url ?? "",
        });
      }

      setLoading(false);
    }

    window.setTimeout(loadProfile, 0);

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    if (!supabase) {
      setError("Supabase nao esta configurado neste ambiente.");
      setSaving(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Entre novamente para salvar seu perfil.");
      setSaving(false);
      return;
    }

    const form = new FormData(event.currentTarget);
    const nextProfile = {
      id: user.id,
      full_name: String(form.get("full_name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      address: String(form.get("address") ?? ""),
      city: String(form.get("city") ?? ""),
      state: String(form.get("state") ?? ""),
      family_info: String(form.get("family_info") ?? ""),
      bio: String(form.get("bio") ?? ""),
      avatar_url: String(form.get("avatar_url") ?? ""),
    };

    const { error: saveError } = await supabase.from("profiles").upsert(nextProfile);

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }

    setProfile(nextProfile);
    setMessage("Perfil salvo.");
    setSaving(false);
  }

  return (
    <main className="min-h-screen quiet-pattern">
      <SiteHeader current="perfil" />
      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:px-12">
        <aside className="lg:pt-8">
          <p className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.12em] text-[var(--rose-dark)] shadow-sm">
            minha conta
          </p>
          <h1 className="mt-5 text-3xl font-black leading-tight md:text-5xl">
            Seus dados de contato e acolhimento.
          </h1>
          <p className="mt-5 leading-8 text-[var(--muted)]">
            Essas informacoes ajudam a moderacao a entender quem voce e, sua
            familia e como entrar em contato com seguranca.
          </p>
          <div className="soft-shell mt-8 rounded-[1.5rem] p-5">
            <div className="flex items-center gap-3">
              <UserCircle aria-hidden size={32} />
              <div>
                <p className="font-black">{email || "Usuario autenticado"}</p>
                <p className="text-sm font-bold text-[var(--muted)]">
                  Sessao ativa
                </p>
              </div>
            </div>
          </div>
        </aside>

        <AuthGate message="Entre para visualizar e editar seu perfil.">
          <form className="soft-shell rounded-[2rem] p-5 md:p-7" onSubmit={handleSubmit}>
            <div className="grid gap-5">
              {loading ? (
                <p className="font-bold text-[var(--muted)]">Carregando perfil...</p>
              ) : null}
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

              <div className="grid gap-5 md:grid-cols-2">
                <TextField
                  defaultValue={profile.full_name}
                  label="Nome completo"
                  name="full_name"
                />
                <TextField
                  defaultValue={profile.phone}
                  label="Telefone com WhatsApp"
                  name="phone"
                />
              </div>

              <TextField
                defaultValue={profile.avatar_url}
                hint="Por enquanto use uma URL de imagem. Depois vamos trocar por upload de foto."
                label="Foto de perfil"
                name="avatar_url"
                placeholder="https://..."
                type="url"
              />

              <div className="grid gap-5 md:grid-cols-[1.4fr_0.8fr_0.5fr]">
                <TextField
                  defaultValue={profile.address}
                  label="Endereco"
                  name="address"
                />
                <TextField defaultValue={profile.city} label="Cidade" name="city" />
                <TextField defaultValue={profile.state} label="UF" name="state" />
              </div>

              <TextAreaField
                defaultValue={profile.family_info}
                hint="Ex.: familiar em tratamento, relacao com a crianca, cidade de origem. Evite detalhes medicos sensiveis."
                label="Familiares e contexto"
                name="family_info"
              />

              <TextAreaField
                defaultValue={profile.bio}
                hint="Uma breve apresentacao para a equipe de moderacao."
                label="Bio"
                name="bio"
              />

              <button
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--brand-dark)] px-6 font-black text-white shadow-lg shadow-[#19101435] transition hover:bg-[var(--brand)] disabled:opacity-60"
                disabled={saving}
              >
                {saving ? "Salvando..." : "Salvar perfil"}
                <Save aria-hidden size={18} />
              </button>
            </div>
          </form>
        </AuthGate>
      </section>
    </main>
  );
}
