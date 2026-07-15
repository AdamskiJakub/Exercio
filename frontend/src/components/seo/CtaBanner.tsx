import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CtaBannerProps {
  title: string;
  description: string;
  href: string;
  buttonText: string;
}

export function CtaBanner({
  title,
  description,
  href,
  buttonText,
}: CtaBannerProps) {
  return (
    <section className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800 p-8">
      <h2 className="mb-2 text-xl font-bold text-white">{title}</h2>
      <p className="mb-6 text-sm text-slate-400">{description}</p>
      <Link href={href}>
        <Button variant="primary" size="xl">
          {buttonText}
        </Button>
      </Link>
    </section>
  );
}
