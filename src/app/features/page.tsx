import { Button } from "@/components/ui/button";
import { Lock, History, Globe, Shield, Zap, Search, Users, Database } from "lucide-react";
import Link from "next/link";

const features = [
  {
    name: "RA 10173 Compliance",
    description: "Built from the ground up to meet the requirements of the Philippine Data Privacy Act of 2012.",
    icon: Shield,
  },
  {
    name: "AES-256 Encryption",
    description: "Your patient's sensitive data is encrypted at rest using industry-standard AES-256-GCM encryption.",
    icon: Lock,
  },
  {
    name: "Immutable History",
    description: "Every clinical entry is permanent. Any changes are recorded as amendments with a full audit trail.",
    icon: History,
  },
  {
    name: "Instant Search",
    description: "Find patients and records instantly with our optimized trigram search engine.",
    icon: Search,
  },
  {
    name: "Multi-Practice Isolation",
    description: "Secure data isolation ensures your patient data is never visible to other clinics.",
    icon: Globe,
  },
  {
    name: "Staff Management",
    description: "Granular roles for owners, doctors, and staff to control access to sensitive information.",
    icon: Users,
  },
];

export default function FeaturesPage() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-zinc-600 uppercase tracking-widest font-mono">Features</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Everything you need to manage a modern practice.
          </p>
          <p className="mt-6 text-lg leading-8 text-zinc-600">
            PRIS provides a robust set of tools designed specifically for the needs of Philippine healthcare providers, 
            prioritizing security, compliance, and ease of use.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-zinc-900">
                  <feature.icon className="h-5 w-5 flex-none text-zinc-600" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="mt-16 text-center">
          <Link href="/signup">
            <Button className="h-11 px-8 text-base font-semibold">
              Get Started Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
