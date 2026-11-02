// DockGate for PayPal — pay suppliers only for what the dock actually received.
const http = require("http"), fs = require("fs"), path = require("path"), crypto = require("crypto");
const pp = require("./lib/paypal"), { readNote } = require("./lib/agent"), { decide } = require("./lib/policy");
const PORT = +process.env.PORT || 8787;
const PO = { poId: "PO-2026-11-0417", supplier: "Lakeview Beverage Co.", sku: "LBC-SPARK-12PK", units: 2400,
  amount: 28800.0, trancheCap: 12000, buyer: "Harbor Grocers Inc.", payeeEmail: process.env.PAYEE_EMAIL || undefined };
let S; const reset = () => (S = { order: null, auth: null, captured: 0, good: 0, received: 0, frozen: false, freezeReason: "", log: [], prev: "GENESIS" });
reset();
function audit(event, data) {
  const e = { t: new Date().toISOString(), event, data, prev: S.prev };
  e.hash = crypto.createHash("sha256").update(JSON.stringify(e)).digest("hex").slice(0, 16); S.prev = e.hash; S.log.push(e); return e;
}
const view = () => ({ mode: pp.MOCK ? "MOCK (no PayPal credentials set)" : "PayPal SANDBOX", po: PO, ...S });
async function route(req, body) {
  const u = new URL(req.url, "http://x");
  if (u.pathname === "/api/state") return view();
  if (u.pathname === "/api/reset") { reset(); return view(); }
  if (u.pathname === "/api/order") {
    const o = await pp.createOrder({ poId: PO.poId, amount: PO.amount, payeeEmail: PO.payeeEmail, returnUrl: `http://localhost:${PORT}/return` });
    S.order = o; audit("order_created", { id: o.id, amount: PO.amount, intent: "AUTHORIZE" }); return { ...view(), approveUrl: o.approveUrl };
  }
  if (u.pathname === "/api/authorize") {
    const a = await pp.authorizeOrder(S.order.id); S.auth = a.authorizationId;
    audit("authorized", { authorizationId: a.authorizationId, amount: PO.amount }); return view();
  }
  if (u.pathname === "/api/receive") {
    const note = String(body.note || "").slice(0, 2000);
    const reading = await readNote(note); audit("ai_reading", { note, reading });
    const d = decide(PO, reading, S); audit("policy_decision", d);
    if (d.action === "CAPTURE" || d.action === "NONE") { if (d.good !== undefined) { S.good = d.good; S.received = d.received; } }
    if (d.action === "CAPTURE") {
      const c = await pp.capture(S.auth, d.amount, { final: false, note: `${PO.poId}: ${d.reason}`, idem: `cap-${S.prev}` });
      S.captured = +(S.captured + d.amount).toFixed(2); audit("captured", { ...c, amount: d.amount, total: S.captured });
    } else if (d.action === "FREEZE") { S.frozen = true; S.freezeReason = d.reason; audit("frozen", { reason: d.reason }); }
    return { ...view(), reading, decision: d };
  }
  if (u.pathname === "/api/void") { const r = await pp.voidAuth(S.auth); audit("voided", { remaining: +(PO.amount - S.captured).toFixed(2), ...r }); S.frozen = true; return view(); }
  return null;
}
http.createServer(async (req, res) => {
  let raw = ""; req.on("data", (c) => (raw += c)); req.on("end", async () => {
    try {
      if (req.url.startsWith("/api/")) {
        const out = await route(req, raw ? JSON.parse(raw) : {});
        res.writeHead(out ? 200 : 404, { "Content-Type": "application/json" }); return res.end(JSON.stringify(out || { error: "not found" }));
      }
      if (req.url.startsWith("/return")) { res.writeHead(302, { Location: "/" }); return res.end(); }
      res.writeHead(200, { "Content-Type": "text/html" }); res.end(fs.readFileSync(path.join(__dirname, "public/index.html")));
    } catch (e) { res.writeHead(400, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: e.message })); }
  });
}).listen(PORT, () => console.log(`DockGate for PayPal on http://localhost:${PORT} mode=${pp.MOCK ? "MOCK" : "SANDBOX"}`));
