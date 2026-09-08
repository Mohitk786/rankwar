import { SuccessStatus } from "@/components/SuccessStatus";

export const metadata = { title: "Payment received" };

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="mb-4 font-mono text-2xl font-bold">Thanks!</h1>
      {session_id ? (
        <SuccessStatus sessionId={session_id} />
      ) : (
        <p className="text-muted">Missing checkout session — if you just paid, check the board directly.</p>
      )}
    </div>
  );
}
