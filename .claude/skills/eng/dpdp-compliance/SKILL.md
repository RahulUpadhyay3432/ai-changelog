---
name: dpdp-compliance
description: Apply India DPDP Act 2023 compliance requirements when collecting, storing, or processing user personal data — consent, notice, data principal rights, retention limits, breach notification, and cookie consent.
---

# India DPDP Act 2023 Compliance

## Purpose

Use this skill whenever a feature touches personal data of Indian users: email collection, analytics identifiers, cookies, push notification tokens, user accounts, or any stored preference tied to an individual. The DPDP Act 2023 is India's primary data protection law, with substantive obligations phased in through 2027.

Trigger phrases: "collect email", "user accounts", "push notifications", "cookies", "analytics consent", "privacy policy", "data retention", "user data", "DPDP", "compliance India", "store user data"

---

## Key concepts

### What the DPDP Act covers

The **Digital Personal Data Protection Act, 2023** (enacted August 11, 2023) governs processing of **digital personal data** about individuals who are in India. It applies to Kapyn because:
- Kapyn serves Indian users
- PostHog collects usage data (IP, device, behavioural signals)
- Future features (email digest, accounts) will collect personal data directly

### Key parties

| Term | Meaning | Kapyn context |
|---|---|---|
| **Data Fiduciary** | Entity that determines purpose + means of processing | Kapyn (the company) |
| **Data Principal** | The individual whose data is processed | Kapyn users |
| **Data Processor** | Entity processing on behalf of a fiduciary | Supabase, PostHog, Vercel |

### Phased implementation (as of May 2026)

| Phase | Effective date | What it covers |
|---|---|---|
| Phase I | November 13, 2025 | Data Protection Board of India established |
| Phase II | November 13, 2026 | Consent Manager framework |
| Phase III | **May 13, 2027** | All substantive compliance obligations |

**Practical implication:** Full enforcement begins May 2027. Build compliant foundations now — retrofitting is costlier.

### Differences from GDPR

| Topic | GDPR | DPDP Act 2023 |
|---|---|---|
| Lawful bases | 6 bases (legitimate interest, contract, etc.) | Primarily **consent** + limited "legitimate uses" |
| Legitimate interest | Yes — broad use | No — not available as a standalone basis |
| Age threshold | 16 (varies by EU member state) | **18** — children require verifiable parental consent |
| DPO requirement | Mandatory for high-risk processing | Not yet mandated (DPDP Rules pending) |
| Cross-border transfers | Adequacy decision or SCCs | Allowed unless government restricts specific countries |
| Consent Managers | Not a concept | Must be Indian-incorporated entities |

---

## Application

### Step 1 — Data inventory (do this first)

Before building any data-touching feature, map:

```
What data?          email, device ID, usage events, IP address, push token
Why collected?      newsletter, analytics, notifications
Where stored?       Supabase (India/Singapore region?), PostHog US, Vercel
How long retained?  TODO — define per data type
Who has access?     Kapyn team, Supabase support, PostHog
```

### Step 2 — Consent capture pattern

Consent must be: **free, specific, informed, unconditional, unambiguous, via clear affirmative action**.

```tsx
// Email collection example (newsletter / digest signup)
// DO:
<form onSubmit={handleSubmit}>
  <input type="email" name="email" required placeholder="your@email.com" />
  <label>
    <input type="checkbox" name="consent" required />
    I agree to receive Kapyn's daily AI digest. I can unsubscribe anytime.{" "}
    <a href="/privacy">Privacy notice</a>
  </label>
  <button type="submit">Subscribe</button>
</form>

// DON'T: pre-ticked checkbox, bundled consent ("I agree to terms AND marketing"),
// or implied consent ("By using this site you agree to...")
```

Store consent with timestamp:
```sql
-- In Supabase, when adding email collection:
CREATE TABLE email_subscribers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text UNIQUE NOT NULL,
  consented_at timestamptz NOT NULL DEFAULT now(),
  consent_text text NOT NULL,  -- exact text shown at time of consent
  ip_hash     text,            -- hashed, not raw IP
  is_active   boolean DEFAULT true
);
```

### Step 3 — Privacy notice requirements

Must be **standalone** (not buried in Terms of Service), **clear and simple**, and must state:
1. What personal data is collected
2. The purpose of processing
3. How long it will be retained
4. Rights of the Data Principal (see Step 4)
5. Contact details for grievance redressal

Minimum privacy notice for Kapyn (current state — no accounts):
```
Kapyn collects anonymous usage data (pages visited, stories read) via PostHog
to understand how users interact with the app. No personally identifiable
information is collected unless you subscribe to our email digest.

If you subscribe: your email is stored to send the digest. We do not sell it.
You can unsubscribe at any time.

To exercise your rights or raise a grievance: privacy@kapyn.app
```

### Step 4 — Data Principal rights (must implement before May 2027)

| Right | What it means | How to implement |
|---|---|---|
| **Access** | User can request what data you hold | `/account/data-request` endpoint or email flow |
| **Correction** | User can correct inaccurate data | Allow email update in account settings |
| **Erasure** | User can request deletion of their data | Hard delete from `email_subscribers` + PostHog `delete_person` API |
| **Grievance** | User can complain to a designated officer | `privacy@kapyn.app` responds within 72h (recommended SLA) |
| **Nominate** | User can nominate someone to exercise rights on death/incapacity | Relevant only for account features |

**Minimum viable rights flow (pre-accounts):**
- Privacy page with email address for requests
- Respond to data access/deletion requests within 30 days
- Delete from PostHog using `posthog.deleteUser()` on request

### Step 5 — Cookie / analytics consent

PostHog with autocapture is analytics tracking. Under DPDP, this requires consent OR falls under "legitimate uses" if the data is de-identified. To be safe:

```tsx
// PostHog init — defer until consent given (or anonymise aggressively)
posthog.init(key, {
  persistence: "memory",           // don't write to localStorage before consent
  person_profiles: "identified_only",  // don't create profiles for anonymous users
  autocapture: false,              // explicit events only — reduces PII risk
  ip: false,                       // don't capture IP
  sanitize_properties: (props) => {
    // Remove any props that might contain PII
    delete props.$current_url; // may contain email in query string
    return props;
  },
});
```

### Step 6 — Retention limits

Define and enforce:

| Data type | Retention | Mechanism |
|---|---|---|
| `news_items` | 48 hours | Already implemented — delete on ingest |
| PostHog events | 1 year | Set in PostHog project settings |
| Email subscribers | Until unsubscribe + 30 days | Cron to hard-delete inactive rows |
| Push tokens | Until revoked or 90 days inactive | App-side cleanup |

### Step 7 — Breach notification

Under Phase III obligations:
- Notify Data Protection Board **within 72 hours** of discovering a breach
- Notify affected Data Principals without undue delay
- Keep an incident log

Minimum preparation:
1. Have `privacy@kapyn.app` monitored
2. Know where all personal data is stored (data inventory from Step 1)
3. Have Supabase and PostHog breach notification contacts ready

---

## Kapyn-specific checklist

Current state (May 2026 — pre-accounts, pre-email):

- [ ] Privacy page at `/privacy` with current data practices
- [ ] PostHog configured with `person_profiles: "identified_only"` and `ip: false`
- [ ] Grievance contact (`privacy@kapyn.app`) established
- [ ] Data inventory document created

For email digest feature (before launch):
- [ ] Explicit opt-in checkbox (not pre-ticked)
- [ ] Consent text stored with subscriber record
- [ ] Unsubscribe link in every email
- [ ] Erasure flow: DELETE from DB + PostHog delete_person API
- [ ] Privacy notice updated

For user accounts (before launch):
- [ ] Full consent notice at registration
- [ ] Data access/correction/erasure endpoints
- [ ] Age gate (18+) or parental consent flow for under-18s
- [ ] DPA with Supabase confirming data processor obligations

---

## Common pitfalls

- **Don't rely on legitimate interest** as a lawful basis — it does not exist under DPDP Act 2023
- **Don't bundle consent** — one checkbox for "terms + privacy + marketing" is invalid; each purpose needs separate consent
- **Don't assume GDPR compliance = DPDP compliance** — key differences (no legitimate interest, age threshold 18, Consent Managers must be Indian)
- **Don't ignore the 2027 deadline** — retrofitting compliance after launch is expensive and creates liability
- **Don't store raw IP addresses** — hash them or don't store them at all

---

## References

- [DPDP Act 2023 — Full Text (MeitY PDF)](https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf)
- [MeitY DPDP Rules 2025 Overview](https://www.meity.gov.in/content/digital-personal-data-protection-act-2023)
- [DPDP Rules 2025 Comprehensive Guide](https://www.dpdpa.com/dpdparules.html)
- [EY: Decoding the DPDP Act 2023](https://www.ey.com/en_in/insights/cybersecurity/decoding-the-digital-personal-data-protection-act-2023)
- [Hogan Lovells: Consent Management Rules under DPDP](https://www.hoganlovells.com/en/publications/india-publishes-consent-management-rules-under-digital-personal-data-protection-act)
- [PostHog GDPR / Privacy Compliance Docs](https://posthog.com/docs/privacy/gdpr)
