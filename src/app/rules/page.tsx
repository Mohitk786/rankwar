export const metadata = { title: "Rules" };

const SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: "How rank works",
    body: [
      "Rank is what you pay — nothing else. Listings are sorted by cumulative dollars paid, descending. There's no relevance score, no recency boost, no manual curation.",
      "Equal amounts stay in the order they were placed — the older listing keeps the higher rank.",
    ],
  },
  {
    heading: "Minimums and increments",
    body: [
      "A brand-new listing costs at least $10. Raising an existing listing costs at least $1 more than its current total.",
      "Taking #1 specifically costs at least the current #1's amount plus $5 — a bigger jump than the general $1 increment, so flipping the top spot is always a meaningful, deliberate amount.",
      "Amounts are whole US dollars only, up to a maximum of $999,999 per listing.",
    ],
  },
  {
    heading: "Raising your own rank",
    body: [
      "Already listed? Enter the same URL or @handle again to raise your rank. You only pay the difference between your current total and your new target — not the full new amount.",
      "Someone else cannot take your rank by paying that same difference — a raise only ever applies to the listing that already owns that destination.",
    ],
  },
  {
    heading: "All-time, Today, Daily, and Category boards",
    body: [
      "All-time never resets and has no expiry. Today is a rolling 24-hour window — a payment drops off exactly 24 hours after it was made, not at a fixed clock boundary. Daily boards close at UTC midnight and freeze permanently as an archive. Every category is its own board over the same underlying payments.",
    ],
  },
  {
    heading: "What you can list",
    body: [
      "A product website or an X/Twitter handle you're authorized to represent. You're responsible for keeping the destination accurate and for not impersonating a brand or account you don't control.",
      "Not accepted: chat or invite links (Telegram, WhatsApp, Discord, Signal, Messenger), adult content, malware or phishing, or anything illegal.",
      "URLs are normalized before they're stored — tracking query strings are stripped, shortened links are resolved to their real destination, and App Store / Play Store / GitHub links are keyed by their specific app or repo path so sub-products don't collide.",
      "Categories may be suggested automatically based on your listing's content; you can request a recategorization by contacting us.",
    ],
  },
  {
    heading: "Payments",
    body: [
      "Checkout is handled by Dodo Payments. All payments are final and not refundable — appearing on the board at whatever rank your payment supports is the entire deliverable, whether or not you're later outranked.",
      "If someone else pays more while you're mid-checkout, you still land on the board — just not necessarily at the rank you were aiming for. We don't reserve ranks during checkout; the final sort order is always the source of truth.",
    ],
  },
  {
    heading: "Removal and disputes",
    body: [
      "We may remove a listing that breaches these rules or the Terms of Service, including chargebacks and disputed payments. Removal doesn't come with a refund.",
      "If you believe a listing infringes your rights or impersonates you, contact us with the listing's URL, the destination in question, and a description of the issue.",
    ],
  },
];

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 font-mono text-2xl font-bold">Rules</h1>
      <div className="space-y-8">
        {SECTIONS.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-2 font-semibold">{section.heading}</h2>
            <div className="space-y-2 text-sm text-muted">
              {section.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
