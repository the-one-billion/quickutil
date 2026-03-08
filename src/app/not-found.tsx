import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-40 text-center px-4">
      <p className="text-7xl">🔧</p>
      <h1 className="text-3xl font-extrabold">Tool not found</h1>
      <p className="text-muted-foreground max-w-sm">
        This page doesn&apos;t exist yet. Browse our full library of free tools below.
      </p>
      <Link href="/tools">
        <Button>Browse All Tools</Button>
      </Link>
    </div>
  );
}
