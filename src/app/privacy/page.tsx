const TITLE = "Privacy Policy — RoofScout.io";
const DESCRIPTION = "How RoofScout.io collects, uses, and protects your data.";

export const metadata = {
  title: "Privacy Policy",
  description: DESCRIPTION,
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://roofscout.io/privacy",
    siteName: "RoofScout.io",
    images: [{ url: "/images/hero-neighborhood-aerial.jpg", width: 1600, height: 1066 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/images/hero-neighborhood-aerial.jpg"],
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 text-slate-700">
      <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: July 25, 2026</p>

      <div className="prose prose-slate mt-8 max-w-none space-y-6 text-sm leading-relaxed">
        <p>
          RoofScout.io is a software service published and operated by Lunchbox (&quot;Lunchbox,&quot;
          &quot;we,&quot; &quot;us&quot;) — RoofScout.io itself is not a company. This policy explains what
          information we collect through the RoofScout.io website and Android app, why we collect it, and
          how it&apos;s handled.
        </p>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">Information we collect</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>Account information:</strong> company name, email address, and password (stored as
              a salted hash, never in plain text) when you sign up. If you choose to sign up or log in
              with Google instead, we receive your name and email address from Google — we never see or
              store your Google password.
            </li>
            <li>
              <strong>Scan data:</strong> the map areas you scan, and the resulting rooftop addresses,
              coordinates, estimated roof measurements, AI-generated condition assessments, and — where
              publicly available — property owner name, phone number, and estimated value.
            </li>
            <li>
              <strong>Billing information:</strong> if you subscribe to a paid plan, payment is handled
              entirely by Stripe, our payment processor. We never see or store your card number — we
              only retain a Stripe customer/subscription reference so we know which plan you&apos;re on.
            </li>
            <li>
              <strong>Usage data:</strong> basic operational logs (e.g. request timestamps, error rates)
              used to keep the service running and diagnose problems.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">How we use this information</h2>
          <p className="mt-2">
            To operate your account, run scans on your behalf, generate lead lists, process
            subscription payments, and improve the reliability of the service. We do not sell your data
            or share it with advertisers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">Third-party services we use</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Google Maps Platform (satellite imagery, geocoding, and roof measurement data)</li>
            <li>Google Sign-In (optional login method, if you choose to use it)</li>
            <li>Anthropic (Claude AI, for analyzing satellite roof imagery)</li>
            <li>OpenStreetMap (building footprint data)</li>
            <li>Stripe (subscription billing)</li>
            <li>Neon (database hosting) and Netlify (application hosting)</li>
          </ul>
          <p className="mt-2">
            Each of these providers processes data only as needed to provide their part of the service,
            under their own privacy policies.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">Data retention and deletion</h2>
          <p className="mt-2">
            We retain scan and lead data for as long as your account is active. You can request full
            deletion of your account and all associated data at any time by emailing us — see below.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">Your rights</h2>
          <p className="mt-2">
            You can request a copy of the data we hold about you, ask us to correct it, or ask us to
            delete it, by contacting us at the email below.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">Children&apos;s privacy</h2>
          <p className="mt-2">
            RoofScout.io is a business tool intended for roofing companies and their staff. It is not
            directed at, and we do not knowingly collect information from, children under 13.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">Changes to this policy</h2>
          <p className="mt-2">
            If we make material changes to this policy, we&apos;ll update the date at the top of this
            page.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">Contact us</h2>
          <p className="mt-2">
            Questions about this policy or your data? Email{" "}
            <a href="mailto:noreply.pingldecoy@gmail.com" className="text-amber-700 underline">
              noreply.pingldecoy@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
