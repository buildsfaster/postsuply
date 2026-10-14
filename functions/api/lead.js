// Cloudflare Pages Function: POST /api/lead
// Receives the progressive lead form (JSON from the page, or a plain form post
// when JavaScript is off) and forwards each step to LEAD_WEBHOOK_URL.
// Set LEAD_WEBHOOK_URL in Cloudflare Pages > Settings > Environment variables
// (any endpoint that accepts a JSON POST: your CRM, Zapier, Make, Slack workflow, n8n).

const MAX = 200;
const clean = (v) => (typeof v === "string" ? v.trim().slice(0, MAX) : "");

export async function onRequestPost({ request, env }) {
  const type = request.headers.get("content-type") || "";
  const isForm = !type.includes("application/json");
  let data = {};
  try {
    if (isForm) {
      const fd = await request.formData();
      data = Object.fromEntries(fd.entries());
      data.categories = fd.getAll("categories");
      data.step = "form";
    } else {
      data = await request.json();
    }
  } catch {
    return json({ ok: false, error: "bad_request" }, 400);
  }

  const lang = data.lang === "es" ? "es" : "en";
  const done = () =>
    isForm
      ? Response.redirect(new URL(lang === "es" ? "/es/gracias/" : "/thanks/", request.url).toString(), 303)
      : json({ ok: true });

  // Honeypot: bots fill the hidden field. Pretend success.
  if (clean(data.website)) return done();

  const phone = clean(data.phone);
  const step = String(data.step || "");
  if (step === "1" || step === "form") {
    const n = phone.replace(/\D/g, "").length;
    if (n < 7 || n > 15) return json({ ok: false, error: "phone" }, 422);
  }

  const lead = {
    id: clean(data.id) || crypto.randomUUID(),
    step,
    phone,
    name: clean(data.name),
    company: clean(data.company),
    categories: Array.isArray(data.categories) ? data.categories.map(clean).slice(0, 10) : [],
    role: data.role === "supplier" ? "supplier" : "buyer",
    lang,
    page: clean(data.page),
    received_at: new Date().toISOString(),
    country: (request.cf && request.cf.country) || "",
  };

  if (!env.LEAD_WEBHOOK_URL) return json({ ok: false, error: "not_configured" }, 503);

  const r = await fetch(env.LEAD_WEBHOOK_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(lead),
  });
  if (!r.ok) return json({ ok: false, error: "upstream" }, 502);
  return done();
}

export function onRequest() {
  return json({ ok: false, error: "method" }, 405);
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
