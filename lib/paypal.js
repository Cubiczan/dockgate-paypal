// PayPal REST (sandbox) client: Orders v2 (intent AUTHORIZE) + Payments v2 partial captures and voids.
// MOCK mode (no credentials) simulates the same responses locally and is labelled everywhere as MOCK.
const BASE = process.env.PAYPAL_BASE || "https://api-m.sandbox.paypal.com";
const ID = process.env.PAYPAL_CLIENT_ID, SECRET = process.env.PAYPAL_CLIENT_SECRET;
const MOCK = !(ID && SECRET);
let token = null, tokenExp = 0, seq = 0;
const mock = { orders: {}, auths: {} };
const rid = (p) => `${p}-MOCK-${(++seq).toString().padStart(4, "0")}`;

async function auth() {
  if (token && Date.now() < tokenExp) return token;
  const r = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: "Basic " + Buffer.from(`${ID}:${SECRET}`).toString("base64"), "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  if (!r.ok) throw new Error(`paypal oauth ${r.status}`);
  const j = await r.json(); token = j.access_token; tokenExp = Date.now() + (j.expires_in - 60) * 1000; return token;
}
async function call(method, path, body, idem) {
  const h = { Authorization: `Bearer ${await auth()}`, "Content-Type": "application/json" };
  if (idem) h["PayPal-Request-Id"] = idem;
  const r = await fetch(BASE + path, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text(); const j = t ? JSON.parse(t) : {};
  if (!r.ok) throw new Error(`paypal ${method} ${path} ${r.status} ${j.name || ""} ${j.message || ""}`);
  return j;
}

async function createOrder({ poId, amount, currency = "USD", payeeEmail, returnUrl }) {
  const unit = { reference_id: poId, description: `PO ${poId}`.slice(0, 127), amount: { currency_code: currency, value: amount.toFixed(2) } };
  if (payeeEmail) unit.payee = { email_address: payeeEmail };
  if (MOCK) {
    const id = rid("ORDER"); mock.orders[id] = { id, status: "CREATED", unit };
    return { id, status: "CREATED", approveUrl: `${returnUrl || ""}?token=${id}&mock=1` };
  }
  const o = await call("POST", "/v2/checkout/orders", {
    intent: "AUTHORIZE", purchase_units: [unit],
    payment_source: { paypal: { experience_context: { return_url: returnUrl, cancel_url: returnUrl, user_action: "CONTINUE" } } },
  }, `po-${poId}-order`);
  return { id: o.id, status: o.status, approveUrl: (o.links || []).find((l) => l.rel === "payer-action" || l.rel === "approve")?.href };
}
async function authorizeOrder(orderId) {
  if (MOCK) {
    const o = mock.orders[orderId]; if (!o) throw new Error("unknown order");
    const a = rid("AUTH"); o.status = "COMPLETED"; mock.auths[a] = { id: a, amount: +o.unit.amount.value, captured: 0, status: "CREATED" };
    return { authorizationId: a, status: "CREATED" };
  }
  const o = await call("POST", `/v2/checkout/orders/${orderId}/authorize`, {}, `auth-${orderId}`);
  const a = o.purchase_units[0].payments.authorizations[0];
  return { authorizationId: a.id, status: a.status };
}
async function capture(authorizationId, amount, { final = false, note, idem } = {}) {
  if (MOCK) {
    const a = mock.auths[authorizationId]; if (!a) throw new Error("unknown authorization");
    if (a.status === "VOIDED") throw new Error("authorization voided");
    if (a.captured + amount > a.amount + 1e-9) throw new Error("capture exceeds authorization");
    a.captured += amount; a.status = final ? "CAPTURED" : "PARTIALLY_CAPTURED";
    return { captureId: rid("CAP"), status: "COMPLETED" };
  }
  const c = await call("POST", `/v2/payments/authorizations/${authorizationId}/capture`,
    { amount: { currency_code: "USD", value: amount.toFixed(2) }, final_capture: final, note_to_payer: note?.slice(0, 255) }, idem);
  return { captureId: c.id, status: c.status };
}
async function voidAuth(authorizationId) {
  if (MOCK) { const a = mock.auths[authorizationId]; a.status = "VOIDED"; return { status: "VOIDED" }; }
  await call("POST", `/v2/payments/authorizations/${authorizationId}/void`, null, `void-${authorizationId}`);
  return { status: "VOIDED" };
}
module.exports = { MOCK, createOrder, authorizeOrder, capture, voidAuth };
