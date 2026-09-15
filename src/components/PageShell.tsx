import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-5xl px-4 py-8", className)}>
      {children}
    </div>
  );
}

export function DocumentPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro?: string;
  sections: { heading: string; body: string[] }[];
}) {
  return (
    <PageShell>
      <h1
        className={`font-serif text-2xl font-semibold tracking-tight ${intro ? "mb-2" : "mb-6"}`}
      >
        {title}
      </h1>
      {intro ? (
        <p className="mb-6 text-xs text-muted-foreground">{intro}</p>
      ) : null}
      <div className={intro ? "space-y-6" : "space-y-8"}>
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-2 font-semibold">{section.heading}</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              {section.body.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
