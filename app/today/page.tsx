import { getUser } from "@/lib/supabase/session";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "../(auth)/actions";

export default async function Today() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-canvas text-ink p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Two Minutes</h1>
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </div>

        <div className="bg-line rounded p-6 text-center">
          <p className="text-muted mb-4">Welcome, {user.email}!</p>
          <p className="text-muted mb-6">
            We're building your experience. Check back soon.
          </p>
        </div>
      </div>
    </div>
  );
}
