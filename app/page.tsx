import { getUser } from "@/lib/supabase/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const user = await getUser();

  if (user) {
    redirect("/today");
  }

  return (
    <div className="min-h-screen bg-canvas text-ink flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4">Two Minutes</h1>
        <p className="text-muted text-lg mb-8">
          An AI accountability partner for ambitious students who start things
          but never finish them.
        </p>

        <div className="space-y-3">
          <Link href="/login" className="block">
            <Button className="w-full">Sign in</Button>
          </Link>
          <Link href="/signup" className="block">
            <Button variant="secondary" className="w-full">
              Create account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
