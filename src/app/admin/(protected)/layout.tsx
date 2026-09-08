import { redirect } from "next/navigation";
import Link from "next/link";
import { destroyAdminSession, isAdminAuthenticated } from "@/lib/admin-auth";

async function logoutAction() {
  "use server";
  await destroyAdminSession();
  redirect("/admin/login");
}

export default async function AdminProtectedLayout({ children }: LayoutProps<"/admin">) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-mono text-xl font-bold">Admin</h1>
        <form action={logoutAction}>
          <button type="submit" className="rounded-md border border-border px-3 py-1.5 text-sm hover:border-foreground/40">
            Log out
          </button>
        </form>
      </div>
      {children}
      <p className="mt-8 text-xs text-muted">
        <Link href="/" className="underline">
          Back to site
        </Link>
      </p>
    </div>
  );
}
