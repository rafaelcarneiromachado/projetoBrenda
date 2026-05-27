type EmailPayload = {
  request_id?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

function onlyDigits(value: string | null | undefined) {
  return (value ?? "").replace(/\D/g, "");
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const siteUrl = Deno.env.get("SITE_URL") ?? "https://www.projetobrenda.com.br";

  if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
    return jsonResponse(
      { error: "Variáveis SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY e RESEND_API_KEY são obrigatórias." },
      500,
    );
  }

  const authHeader = request.headers.get("Authorization") ?? "";
  const payload = (await request.json()) as EmailPayload;

  if (!payload.request_id) {
    return jsonResponse({ error: "request_id é obrigatório." }, 400);
  }

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      Authorization: authHeader,
      apikey: serviceRoleKey,
    },
  });

  if (!userResponse.ok) {
    return jsonResponse({ error: "Usuário não autenticado." }, 401);
  }

  const currentUser = await userResponse.json();
  const profileResponse = await fetch(
    `${supabaseUrl}/rest/v1/profiles?id=eq.${currentUser.id}&select=role,account_status`,
    {
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
      },
    },
  );
  const [currentProfile] = await profileResponse.json();

  if (currentProfile?.role !== "admin" || currentProfile?.account_status === "blocked") {
    return jsonResponse({ error: "Apenas moderadores podem enviar alertas." }, 403);
  }

  const requestResponse = await fetch(
    `${supabaseUrl}/rest/v1/stay_requests?id=eq.${payload.request_id}&select=*`,
    {
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
      },
    },
  );
  const [stayRequest] = await requestResponse.json();

  if (!stayRequest || stayRequest.status !== "matched" || !stayRequest.lodging_id) {
    return jsonResponse({ error: "Pedido aprovado não encontrado." }, 404);
  }

  const lodgingResponse = await fetch(
    `${supabaseUrl}/rest/v1/lodgings?id=eq.${stayRequest.lodging_id}&select=*`,
    {
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
      },
    },
  );
  const [lodging] = await lodgingResponse.json();

  const profilesResponse = await fetch(
    `${supabaseUrl}/rest/v1/profiles?id=in.(${stayRequest.requester_id},${lodging.host_id})&select=id,email,full_name,phone`,
    {
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
      },
    },
  );
  const profiles = await profilesResponse.json();
  const requester = profiles.find((profile: { id: string }) => profile.id === stayRequest.requester_id);
  const host = profiles.find((profile: { id: string }) => profile.id === lodging.host_id);
  const connectionUrl = `${siteUrl}/conexoes`;
  const hostWhatsApp = onlyDigits(host?.phone);
  const familyWhatsApp = onlyDigits(stayRequest.phone ?? requester?.phone);

  const subject = `Conexão aprovada no Projeto Brenda: ${lodging.title}`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#12090d">
      <h1>Conexão aprovada</h1>
      <p>A moderação do Projeto Brenda aprovou a conexão para a hospedagem <strong>${lodging.title}</strong>.</p>
      <p><strong>Família:</strong> ${stayRequest.responsible_name}<br />
      <strong>WhatsApp:</strong> ${stayRequest.phone}<br />
      <strong>E-mail:</strong> ${requester?.email ?? "não informado"}</p>
      <p><strong>Anfitrião:</strong> ${host?.full_name ?? "Anfitrião"}<br />
      <strong>WhatsApp:</strong> ${host?.phone ?? "não informado"}<br />
      <strong>E-mail:</strong> ${host?.email ?? "não informado"}</p>
      <p><strong>Chegada:</strong> ${stayRequest.arrival_date}<br />
      <strong>Período:</strong> ${stayRequest.nights} noite(s)<br />
      <strong>Hospital:</strong> ${stayRequest.hospital_name}, ${stayRequest.hospital_city}</p>
      <p>Agora vocês podem conversar diretamente para combinar horário, chegada e detalhes finais.</p>
      <p><a href="${connectionUrl}">Abrir minhas conexões</a></p>
      ${hostWhatsApp ? `<p><a href="https://wa.me/${hostWhatsApp.startsWith("55") ? hostWhatsApp : `55${hostWhatsApp}`}">Falar com o anfitrião no WhatsApp</a></p>` : ""}
      ${familyWhatsApp ? `<p><a href="https://wa.me/${familyWhatsApp.startsWith("55") ? familyWhatsApp : `55${familyWhatsApp}`}">Falar com a família no WhatsApp</a></p>` : ""}
    </div>
  `;

  const recipients = [requester?.email, host?.email].filter(Boolean);

  if (recipients.length === 0) {
    return jsonResponse({ error: "Nenhum e-mail encontrado para envio." }, 400);
  }

  const emailResponse = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from: "Projeto Brenda <contato@projetobrenda.com.br>",
      to: recipients,
      subject,
      html,
    }),
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!emailResponse.ok) {
    return jsonResponse({ error: await emailResponse.text() }, 502);
  }

  return jsonResponse({ ok: true });
});
