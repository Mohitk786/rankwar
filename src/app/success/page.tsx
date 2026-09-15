import { SuccessStatus } from "@/components/SuccessStatus";

export const metadata = { title: "Payment received" };

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ checkoutId?: string }> }) {
  const { checkoutId } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="mb-4 font-serif text-2xl font-semibold tracking-tight">Thanks!</h1>
      {checkoutId ? (
        <SuccessStatus checkoutId={checkoutId} />
      ) : (
        <p className="text-muted-foreground">Missing checkout session — if you just paid, check the board directly.</p>
      )}
    </div>
  );
}
