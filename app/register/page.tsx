import { Repeat } from "lucide-react";
import { AuthForm } from "@/components/AuthForm";
import { Card } from "@/components/ui/Card";
import { register } from "@/lib/actions/auth";

export default function RegisterPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Repeat className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Create your account</h1>
            <p className="text-sm text-muted-foreground">Start tracking your goals and daily routines.</p>
          </div>
        </div>
        <Card className="p-6">
          <AuthForm
            action={register}
            submitLabel="Register"
            altLinkHref="/login"
            altLinkLabel="Already have an account? Log in"
          />
        </Card>
      </div>
    </main>
  );
}
