export default function PrivacyPage() {
  return (
    <div className="bg-white py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl prose prose-zinc prose-sm sm:prose-base">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">Privacy Notice</h1>
        <p className="mt-4 text-sm text-zinc-500 italic">Last Updated: May 29, 2026</p>
        
        <div className="mt-10 space-y-8 text-zinc-600 leading-7">
          <section>
            <h2 className="text-xl font-bold text-zinc-900">1. Introduction</h2>
            <p>
              Project PRIS ("we", "us", or "our") is committed to protecting the privacy and security of patient data. 
              This Privacy Notice explains how we process information in compliance with the Data Privacy Act of 2012 (Republic Act No. 10173) 
              of the Philippines.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900">2. Data We Process</h2>
            <p>We process the following categories of data on behalf of healthcare providers:</p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li><strong>Patient Identity:</strong> Name, sex, date of birth, civil status.</li>
              <li><strong>Contact Information:</strong> Address, mobile number, email (Encrypted).</li>
              <li><strong>Clinical Records:</strong> Medical history, clinical notes, vitals, prescriptions (Encrypted & Immutable).</li>
              <li><strong>Government IDs:</strong> PhilHealth PIN, Discount IDs (Encrypted).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900">3. Security Measures</h2>
            <p>
              We implement strict technical and organizational measures to protect data:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>Authenticated AES-256-GCM encryption for sensitive fields.</li>
              <li>Database-level Row Level Security (RLS) for multi-tenant isolation.</li>
              <li>Immutable record-keeping to prevent unauthorized alteration of clinical data.</li>
              <li>Append-only audit logs for all data access activities.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900">4. Data Subject Rights</h2>
            <p>
              Under RA 10173, data subjects (patients) have the following rights:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>The right to be informed.</li>
              <li>The right to object.</li>
              <li>The right to access.</li>
              <li>The right to rectification.</li>
              <li>The right to erasure or blocking.</li>
              <li>The right to damages.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900">5. Contact Us</h2>
            <p>
              For any privacy-related concerns or to exercise your rights, please contact our Data Protection Officer at 
              <span className="font-semibold"> privacy@pris.ph</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
