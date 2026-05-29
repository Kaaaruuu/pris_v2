import { Button } from "@/components/ui/button";
import { Shield, Lock, History, Globe, Zap, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "PRIS",
    "operatingSystem": "Web",
    "applicationCategory": "HealthApplication",
    "offers": {
      "@type": "Offer",
      "price": "1499.00",
      "priceCurrency": "PHP"
    },
    "description": "Secure, multi-tenant clinical record system for modern healthcare practices in the Philippines. RA 10173 Compliant."
  };

  return (
    <div className="flex flex-col w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section */}
      <section className="relative bg-white px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-6xl">
              Modern Clinical Records <br />
              <span className="text-zinc-500">Built for Trust.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
              PRIS is a secure, multi-tenant patient recording system designed for Philippine healthcare providers. 
              Compliant with RA 10173 (Data Privacy Act), ensuring your patient data remains private and immutable.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/signup">
                <Button className="h-11 px-8 text-base">Get Started</Button>
              </Link>
              <Link href="/features">
                <Button variant="secondary" className="h-11 px-8 text-base">
                  View Features
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / Compliance Banner */}
      <section className="bg-zinc-50 py-12 border-y border-zinc-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-zinc-400" />
              <span className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">RA 10173 Compliant</span>
            </div>
            <div className="flex items-center gap-3">
              <Lock className="h-6 w-6 text-zinc-400" />
              <span className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">AES-256 Encryption</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-zinc-400" />
              <span className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">HIPAA Inspired</span>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-zinc-600 uppercase tracking-widest">Everything you need</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              Streamline your practice with confidence.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-zinc-900">
                  <Lock className="h-5 w-5 flex-none text-zinc-600" aria-hidden="true" />
                  Field-Level Encryption
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-600">
                  <p className="flex-auto">
                    Sensitive patient data is encrypted at the field level using pgsodium, ensuring that even in the database, information is protected.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-zinc-900">
                  <History className="h-5 w-5 flex-none text-zinc-600" aria-hidden="true" />
                  Immutable Records
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-600">
                  <p className="flex-auto">
                    Clinical notes and prescriptions are permanently immutable. Corrections are tracked as amendments, providing a full, unalterable audit trail.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-zinc-900">
                  <Globe className="h-5 w-5 flex-none text-zinc-600" aria-hidden="true" />
                  Secure Multi-Tenancy
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-600">
                  <p className="flex-auto">
                    Complete data isolation between clinics and practices. Your data never mixes with others, enforced at the database level.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-zinc-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to digitize your practice?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-zinc-400">
            Join other healthcare providers in building a more efficient and secure healthcare system in the Philippines.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/signup">
              <Button variant="secondary" className="h-11 px-8 text-base font-semibold">
                Start 7-Day Free Trial
              </Button>
            </Link>
            <Link href="/pricing" className="text-sm font-semibold leading-6 text-white hover:text-zinc-300">
              View Pricing <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
