import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/db";
import { signIn } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/getLocale";
import Logo from "@/components/Logo";

export const metadata = { title: "Sign up — RoofScout" };

const signupSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

async function signupAction(formData: FormData) {
  "use server";

  const parsed = signupSchema.safeParse({
    companyName: formData.get("companyName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    redirect(`/signup?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid input")}`);
  }
  const { companyName, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect("/signup?error=" + encodeURIComponent("An account with that email already exists"));
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({ data: { name: companyName } });
    const user = await tx.user.create({ data: { email, passwordHash } });
    await tx.membership.create({ data: { userId: user.id, orgId: org.id, role: "Owner" } });
  });

  try {
    await signIn("credentials", { email, password, redirectTo: "/app" });
  } catch (error) {
    if (error instanceof AuthError) {
      // Account was created successfully; login failing right after would be
      // a bug in the sign-in flow itself, not a user input problem.
      redirect("/login?error=invalid");
    }
    throw error;
  }
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { t } = await getDictionary();

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-slate-950 px-4 py-16 text-white">
      <Link href="/" className="mb-8 flex items-center gap-2 text-lg font-semibold">
        <Logo />
        RoofScout
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h1 className="text-2xl font-black tracking-tight">{t.signup.title}</h1>
        <p className="mt-1 text-sm text-slate-400">{t.signup.sub}</p>

        {error && (
          <p className="mt-4 rounded-lg border border-red-900 bg-red-950 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <form action={signupAction} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
              {t.signup.companyName}
            </label>
            <input
              type="text"
              name="companyName"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
              {t.signup.email}
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
              {t.signup.password}
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400"
          >
            {t.signup.cta}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-400">
          {t.signup.haveAccount}{" "}
          <Link href="/login" className="font-medium text-amber-400 hover:text-amber-300">
            {t.signup.login}
          </Link>
        </p>
      </div>
    </div>
  );
}
