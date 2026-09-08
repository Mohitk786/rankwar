export const metadata = { title: "Terms of Service" };

const SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: "1. Acceptance",
    body: [
      "By submitting a listing or making a payment on RankWar, you agree to these Terms of Service, the Rules, and the Privacy Policy. If you don't agree, don't use the service.",
    ],
  },
  {
    heading: "2. What you're buying",
    body: [
      "A payment buys placement on the public leaderboard at a rank determined by cumulative amount paid, for as long as that amount keeps you above the applicable threshold on the board(s) it applies to. It is not a guarantee of traffic, conversions, or any particular outcome, and it is not an endorsement of the listed product by RankWar.",
    ],
  },
  {
    heading: "3. Payments and refunds",
    body: [
      "Checkout is processed by Stripe. All payments are final and not refundable, including if you are later outranked, if a listing is removed for a rules breach, or in the event of service downtime.",
      "Where a jurisdiction's mandatory consumer-protection law grants a withdrawal or refund right that cannot be lawfully waived, we honor that right to the extent required by law.",
      "Chargebacks and payment disputes are a breach of these Terms and grounds for listing removal and a ban from future use, independent of the outcome of the dispute itself.",
    ],
  },
  {
    heading: "4. Your responsibilities",
    body: [
      "You represent that you own or are authorized to list the destination URL or account you submit, that the information you provide is accurate, and that you'll keep the destination content lawful and consistent with the Rules.",
      "You may not submit listings for chat/invite links, adult content, malware, phishing, or anything illegal; impersonate a brand or account you don't control; or scrape the board to build a competing ranking product.",
    ],
  },
  {
    heading: "5. Trademarks and third-party content",
    body: [
      "Product names, logos, and descriptions displayed on listings may be trademarks of their respective owners, used here in a nominative, referential sense to identify the listed product — not as an endorsement or affiliation claim.",
      "If you believe a listing infringes your trademark or other rights, send us the listing's URL, the destination in question, a description of the right at issue, and your contact information, and we'll review it.",
    ],
  },
  {
    heading: "6. No warranty",
    body: [
      "The service is provided \"as is,\" without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.",
    ],
  },
  {
    heading: "7. Limitation of liability",
    body: [
      "To the maximum extent permitted by law, RankWar's total liability for any claim arising from your use of the service is limited to the amount you paid in the 12 months before the claim arose.",
    ],
  },
  {
    heading: "8. Changes",
    body: [
      "We may update these Terms from time to time. Continued use of the service after a change constitutes acceptance of the updated Terms.",
    ],
  },
  {
    heading: "9. Contact",
    body: ["Questions about these Terms can be sent to the contact address listed on the About page."],
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 font-mono text-2xl font-bold">Terms of Service</h1>
      <p className="mb-6 text-xs text-muted">Last updated: draft — replace with your reviewed terms before accepting real payments.</p>
      <div className="space-y-6">
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
