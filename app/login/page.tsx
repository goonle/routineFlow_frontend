import { Repeat } from "lucide-react";
import { AuthForm } from "@/components/AuthForm";
import { Card } from "@/components/ui/Card";
import { login } from "@/lib/actions/auth";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Repeat className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Log in to keep your routines on track.</p>
          </div>
        </div>
        <Card className="p-6">
          <AuthForm action={login} submitLabel="Log in" altLinkHref="/register" altLinkLabel="Need an account? Register" />
        </Card>
      </div>
    </main>
  );
}
