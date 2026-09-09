export const metadata = { title: "Privacy Policy" };

const SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: "What we collect",
    body: [
      "A first-party, HttpOnly visitor cookie (random, lasting up to a year) used to attach a checkout to your browser and to de-duplicate clicks. It doesn't identify you personally and isn't linked to an account.",
      "When you visit a listing from the board, we record the listing, a timestamp, the visitor cookie, and a hashed IP address (hashed with a salt that rotates daily, so raw IPs aren't retained). This is used for rate limiting and fake-click reduction, not to profile you.",
      "When you check out, Dodo Payments collects billing information (name, email, address, payment details) directly as our merchant of record. We receive confirmation of the payment and the amount, not your full card details.",
      "Standard technical data (user agent, referrer) processed by our hosting and analytics infrastructure.",
    ],
  },
  {
    heading: "Why we collect it",
    body: [
      "To operate the leaderboard itself (recording payments and clicks), to prevent abuse (rate limiting, fake-click reduction), to process payments, and to send the optional email digest if you subscribe to it.",
    ],
  },
  {
    heading: "Who we share it with",
    body: [
      "Dodo Payments, as our merchant of record, for billing and fraud prevention. Our hosting and database providers, to operate the service. We don't sell personal data.",
    ],
  },
  {
    heading: "Retention",
    body: [
      "Click and payment records are kept for as long as needed to operate the board, prevent abuse, and meet legal/tax obligations. Hashed IPs use a daily-rotating salt, which limits how far back any single hash can be correlated.",
    ],
  },
  {
    heading: "Your rights",
    body: [
      "Depending on your location, you may have rights to access, correct, delete, or export your personal data, and to object to certain processing. Contact us using the address on the About page to exercise these rights.",
    ],
  },
  {
    heading: "Cookies",
    body: [
      "We use a single first-party cookie for the purposes described above. We don't use third-party advertising cookies.",
    ],
  },
  {
    heading: "Children",
    body: ["The service is not directed at children and we don't knowingly collect data from children."],
  },
  {
    heading: "Changes",
    body: ["We may update this policy from time to time; material changes will be reflected here with a new date."],
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 font-mono text-2xl font-bold">Privacy Policy</h1>
      <p className="mb-6 text-xs text-muted">Last updated: draft — replace with your reviewed policy before accepting real payments.</p>
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
