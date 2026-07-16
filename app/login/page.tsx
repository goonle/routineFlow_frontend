import { AuthForm } from "@/components/AuthForm";
import { login } from "@/lib/actions/auth";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <h1 className="text-2xl font-semibold">Log in</h1>
        <AuthForm action={login} submitLabel="Log in" altLinkHref="/register" altLinkLabel="Need an account? Register" />
      </div>
    </main>
  );
}
