---
name: NutriGo API boundary
description: Constraints of the Render-hosted API when the NutriGo web app calls it.
---

The Render API rejects browser requests from the Replit app origin, so web requests must stay behind the same-origin API proxy. Cart ownership is keyed by email; the proxy must derive that email from the authenticated Clerk user and verify item ownership rather than trust client-supplied identity.

**Why:** Direct browser calls fail CORS preflight, and the external cart API does not authenticate ownership itself.

**How to apply:** Preserve the authenticated proxy boundary when adding NutriGo endpoints; keep user identity and cart-item checks server-side.
