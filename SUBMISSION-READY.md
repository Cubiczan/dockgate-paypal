# SUBMISSION-READY — PayPal AI Hackathon (Devpost) — DockGate for PayPal

**Prepared / updated:** Thu Nov 5, 2026 ~8:05 AM ET  
**Entrant:** Shyam Desigan (CFO)  
**Ready to submit in browser?** **ALMOST** — needs YouTube upload of the local demo mp4  
**Deadline:** Thu Nov 12, 2026 **3:00 PM ET**  
**Submit URL:** https://paypalaihackathon.devpost.com/  
**Manage:** https://devpost.com/submit-to/31302-paypal-ai-hackathon/manage/submissions

---

## Final links

| | |
|---|---|
| **Public repo** | https://github.com/Cubiczan/dockgate-paypal (**public**, NEW — did **not** touch `Cubiczan/dockgate`) |
| **Demo video (local mp4)** | `/workspace/contests/paypal-ai/dockgate-paypal/docs/video/dockgate-paypal-demo.mp4` (~31s; also `paypal-ai/dockgate-paypal-demo.mp4`) |
| **YouTube** | **NOT uploaded yet** — required by Devpost |
| **Hosted demo** | None — run locally per README (`npm start` → http://localhost:8787) |

**Secret scan:** no `.env` in tree; `.env.example` placeholders only. Nothing removed.

**Verified this run:** `npm test` 9/9; live MOCK authorize → partial capture → freeze on injection → void; screenshots burned into captioned mp4.

---

## Paste-ready Devpost fields

**Project name:** DockGate for PayPal  
**Tagline:** Authorize the whole purchase order with PayPal, then let an AI receiving clerk and a CFO policy release partial captures only for cases that actually arrived in good shape.  
**Built with:** paypal, paypal-orders-api, paypal-payments-api, openai-compatible-llm, node.js, javascript  
**Repo:** https://github.com/Cubiczan/dockgate-paypal  
**Demo / testing:**  
```
node -v && npm test && npm start   # http://localhost:8787  MOCK without credentials
```
**Video:** (YouTube URL after uploading `docs/video/dockgate-paypal-demo.mp4`)  
**Images:** `docs/screenshots/01_partial_capture.png` … `04_voided.png`

**Inspiration / What it does / How built / Differs from RunwayPilot & JobProof:** see README + prior draft in this folder. Screenshots and video are **MOCK mode** unless a sandbox run is recorded later.

---

## Still blocked

1. **Upload demo mp4 to YouTube** and paste public URL (Devpost requirement).  
2. Browser Enter Submission on Devpost.  
3. Optional: PayPal sandbox credentials for a live (non-MOCK) recording.
