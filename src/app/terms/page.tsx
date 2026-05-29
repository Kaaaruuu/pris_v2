export default function TermsPage() {
  return (
    <div className="bg-white py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl prose prose-zinc prose-sm sm:prose-base">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">Terms of Service</h1>
        <p className="mt-4 text-sm text-zinc-500 italic">Last Updated: May 29, 2026</p>
        
        <div className="mt-10 space-y-8 text-zinc-600 leading-7">
          <section>
            <h2 className="text-xl font-bold text-zinc-900">1. Acceptance of Terms</h2>
            <p>
              By accessing or using PRIS, you agree to be bound by these Terms of Service. If you are using the service 
              on behalf of a clinic or practice, you represent that you have the authority to bind that entity to these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900">2. Professional Responsibility</h2>
            <p>
              PRIS is a clinical recording tool. It does not provide medical advice or diagnosis. 
              Healthcare providers are solely responsible for the accuracy and completeness of the records they maintain 
              within the system.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900">3. Data Stewardship</h2>
            <p>
              You retain ownership of all data you input into PRIS. However, you grant us the right to process this data 
              strictly for the purpose of providing the service and ensuring compliance with Philippine law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900">4. Immutability & Amendments</h2>
            <p>
              You acknowledge that clinical records in PRIS are designed to be immutable. Once an entry is finalized, 
              it cannot be deleted or modified. Necessary corrections must be made through the provided amendment system.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900">5. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, PRIS shall not be liable for any indirect, incidental, or 
              consequential damages arising out of your use of the service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
