import { AuthForm } from "@/components/AuthForm";
import { register } from "@/lib/actions/auth";

export default function RegisterPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <h1 className="text-2xl font-semibold">Create an account</h1>
        <AuthForm action={register} submitLabel="Register" altLinkHref="/login" altLinkLabel="Already have an account? Log in" />
      </div>
    </main>
  );
}
