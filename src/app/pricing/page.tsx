import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

const tiers = [
  {
    name: "Standard",
    id: "tier-standard",
    href: "/signup",
    priceMonthly: "₱1,499",
    description: "Perfect for individual practitioners starting their digital journey.",
    features: [
      "1 Doctor Account",
      "Up to 2 Staff Accounts",
      "Unlimited Patient Records",
      "RA 10173 Compliance",
      "AES-256 Encryption",
      "Immutable Clinical Notes",
    ],
    mostPopular: false,
  },
  {
    name: "Professional",
    id: "tier-professional",
    href: "/signup",
    priceMonthly: "₱2,999",
    description: "Ideal for small clinics with multiple doctors.",
    features: [
      "Up to 5 Doctor Accounts",
      "Unlimited Staff Accounts",
      "Unlimited Patient Records",
      "Advanced Audit Logs",
      "Custom Branding (Coming Soon)",
      "Priority Support",
    ],
    mostPopular: true,
  },
];

export default function PricingPage() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-zinc-600 uppercase tracking-widest font-mono">Pricing</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Simple, transparent pricing.
          </p>
          <p className="mt-6 text-lg leading-8 text-zinc-600">
            Choose the plan that best fits your practice. All plans start with a 7-day free trial.
          </p>
        </div>
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:gap-x-8 xl:gap-x-12">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-3xl p-8 ring-1 ring-zinc-200 xl:p-10 ${
                tier.mostPopular ? "bg-zinc-50 ring-zinc-900 shadow-lg" : "bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-x-4">
                <h3 id={tier.id} className="text-lg font-semibold leading-8 text-zinc-900">
                  {tier.name}
                </h3>
                {tier.mostPopular ? (
                  <p className="rounded-full bg-zinc-900 px-2.5 py-1 text-xs font-semibold leading-5 text-white">
                    Most Popular
                  </p>
                ) : null}
              </div>
              <p className="mt-4 text-sm leading-6 text-zinc-600">{tier.description}</p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-zinc-900">{tier.priceMonthly}</span>
                <span className="text-sm font-semibold leading-6 text-zinc-600">/month</span>
              </p>
              <Link href={tier.href}>
                <Button
                  variant={tier.mostPopular ? "primary" : "secondary"}
                  className="mt-6 w-full h-11 text-base font-semibold"
                >
                  Start free trial
                </Button>
              </Link>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-zinc-600">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <Check className="h-6 w-5 flex-none text-zinc-900" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
