import { Shield, Lock, CheckCircle2, Info } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-zinc-600 uppercase tracking-widest font-mono">About PRIS</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Designed for Trust and Compliance.
          </p>
          <p className="mt-6 text-lg leading-8 text-zinc-600">
            PRIS (Patient Recording Information System) was built to bridge the gap between traditional medical records 
            and modern digital security requirements in the Philippines.
          </p>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-zinc-900">Our Mission</h3>
              <p className="text-lg text-zinc-600">
                Our mission is to empower healthcare providers with tools that are as reliable as they are secure. 
                We believe that data privacy is a fundamental right, especially when it comes to sensitive health information.
              </p>
              <p className="text-lg text-zinc-600">
                By leveraging modern encryption and immutable ledger patterns, we ensure that clinical records 
                remain the authoritative source of truth for both patients and doctors.
              </p>
            </div>
            <div className="bg-zinc-50 rounded-3xl p-8 ring-1 ring-zinc-200">
              <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                <Shield className="h-6 w-6 text-zinc-600" />
                Compliance Commitment
              </h3>
              <ul className="mt-6 space-y-4">
                <li className="flex gap-x-3 items-start">
                  <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-zinc-900" />
                  <div>
                    <span className="font-semibold text-zinc-900">RA 10173 (DPA 2012):</span>
                    <p className="text-sm text-zinc-600">Full adherence to the Data Privacy Act of the Philippines.</p>
                  </div>
                </li>
                <li className="flex gap-x-3 items-start">
                  <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-zinc-900" />
                  <div>
                    <span className="font-semibold text-zinc-900">AES-256-GCM:</span>
                    <p className="text-sm text-zinc-600">Authenticated encryption for all Class A and B data fields.</p>
                  </div>
                </li>
                <li className="flex gap-x-3 items-start">
                  <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-zinc-900" />
                  <div>
                    <span className="font-semibold text-zinc-900">Immutable Audit Trail:</span>
                    <p className="text-sm text-zinc-600">Append-only logging for all sensitive data access.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-24 border-t border-zinc-200 pt-16">
          <div className="flex items-center gap-4 text-zinc-500">
            <Info className="h-5 w-5" />
            <p className="text-sm italic">
              PRIS is a product of Project PRIS. Version 2.1 (Web-First Architecture).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
