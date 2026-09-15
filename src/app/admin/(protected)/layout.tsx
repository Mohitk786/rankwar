import { redirect } from "next/navigation";
import Link from "next/link";
import { destroyAdminSession, isAdminAuthenticated } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/PageShell";

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
    <PageShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-xl font-semibold tracking-tight">Admin</h1>
        <form action={logoutAction}>
          <Button type="submit" variant="outline">
            Log out
          </Button>
        </form>
      </div>
      {children}
      <p className="mt-8 text-xs text-muted-foreground">
        <Link href="/" className="underline">
          Back to site
        </Link>
      </p>
    </PageShell>
  );
}
