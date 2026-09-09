export const metadata = { title: "FAQ" };

const FAQ: { q: string; a: string }[] = [
  {
    q: "Do I need an account?",
    a: "No. There's no signup and no login. A first-party cookie identifies your browser for checkout and click de-duplication, but it's not tied to an account.",
  },
  {
    q: "How do I raise my rank later?",
    a: "Enter the same URL or @handle again from the homepage. If it's already listed, you'll be charged only the difference between your current total and your new target amount.",
  },
  {
    q: "What happens if I get outranked?",
    a: "Nothing changes about your listing — it stays exactly where your paid amount puts it. You just may no longer be #1, or #1 in your category, or on Today's board once 24 hours pass. There's no notification unless you've subscribed to the email digest.",
  },
  {
    q: "Can I get a refund?",
    a: "No — all payments are final. Where a jurisdiction's consumer law grants a right that legally can't be waived, we honor that right; otherwise appearance on the board at whatever rank your payment supports is the complete deliverable.",
  },
  {
    q: "What if someone else pays while I'm at checkout?",
    a: "You still land on the board — just not necessarily at the rank you were aiming for. We don't reserve ranks during checkout; the amount you paid is fixed, but rank is always determined by the live sort order.",
  },
  {
    q: "Can anyone list my product?",
    a: "Technically, yes — there's no domain-ownership verification at signup. This is a deliberate trade-off for zero-friction listing. If someone lists your product without authorization, contact us and we'll review it.",
  },
  {
    q: "How is my click count calculated?",
    a: "Each visit through a listing's outbound link is recorded with a visitor cookie and a hashed IP, used only for rate-limiting and fake-click reduction — never to build a profile of you. Repeated clicks from the same visitor in a short window aren't counted twice toward the public number.",
  },
  {
    q: "What data do you collect?",
    a: "See the Privacy Policy for the full breakdown — in short: a first-party visitor cookie, hashed IPs on clicks, and whatever Dodo Payments collects for billing. We don't sell data.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 font-mono text-2xl font-bold">FAQ</h1>
      <div className="space-y-6">
        {FAQ.map((item) => (
          <div key={item.q}>
            <h2 className="mb-1 font-medium">{item.q}</h2>
            <p className="text-sm text-muted">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
