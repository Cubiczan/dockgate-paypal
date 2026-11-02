# Devpost — PayPal AI Hackathon (DRAFT, NOT SUBMITTED) — due Nov 12, 2026, 3:00 PM ET
**Project name:** DockGate for PayPal
**Elevator pitch:** Authorize the whole purchase order with PayPal, then let an AI receiving clerk and a CFO policy release partial captures only for cases that actually arrived in good shape.
**Inspiration:** I'm a CFO. Distributors pay suppliers in full and then chase credits for short and damaged deliveries.
**What it does / How we built it:** see README (Orders v2 AUTHORIZE, partial captures with final_capture=false, void; AI clerk reads untrusted dock notes; deterministic policy; hash-chained audit).
**Differs from my other entries:** RunwayPilot = Invoicing + cash forecast; JobProof = Orders capture + Payouts on photo proof. DockGate = Authorizations API (hold → partial capture → void) for B2B receiving.
**Built with:** paypal, paypal-orders-api, paypal-payments-api, openai-compatible-llm, node.js, javascript
**Repo:** TODO (public GitHub, pending approval) · **Video:** TODO (YouTube, <3 min) · **Demo:** run locally per README
**TODO before submit:** run once against PayPal sandbox (needs sandbox app credentials) and record that run; configure an LLM so the clerk isn't heuristic in the video, or say so.
