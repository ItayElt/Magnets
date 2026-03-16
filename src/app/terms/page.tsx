import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="font-[family-name:var(--font-playfair)] text-xl font-bold"
            style={{ color: '#0066FF' }}
          >
            Memora
          </Link>
          <Link
            href="/"
            className="text-sm text-stone-500 hover:text-stone-700 transition-colors"
          >
            &larr; Back to home
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <p className="text-sm text-stone-400 mb-6">Last updated: March 2026</p>

        <h1 className="text-3xl font-bold text-stone-900 font-[family-name:var(--font-playfair)] mb-8">
          Terms of Service
        </h1>

        <div className="space-y-8 text-stone-700 leading-relaxed text-[15px]">
          <section>
            <h2 className="text-xl font-semibold text-stone-900 font-[family-name:var(--font-playfair)] mb-3">
              1. Agreement to Terms
            </h2>
            <p>
              By accessing or using the Memora website and services, you agree to
              be bound by these Terms of Service. If you do not agree to these
              terms, please do not use our services. These terms apply to all
              visitors, users, and customers of Memora.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 font-[family-name:var(--font-playfair)] mb-3">
              2. Use of Service
            </h2>
            <p className="mb-3">
              Memora provides a platform for creating custom photo magnets. You
              may use our service for personal, non-commercial purposes. You
              agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Upload content that infringes on any third-party rights</li>
              <li>
                Use the service to create content that is illegal, offensive, or
                harmful
              </li>
              <li>
                Attempt to gain unauthorized access to our systems or other
                users&apos; accounts
              </li>
              <li>
                Use automated tools to scrape, crawl, or otherwise extract data
                from our service
              </li>
              <li>Interfere with the proper functioning of the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 font-[family-name:var(--font-playfair)] mb-3">
              3. Orders &amp; Payment
            </h2>
            <p className="mb-3">
              When you place an order through Memora, you agree to provide
              accurate and complete information. All prices are listed in US
              dollars and include applicable taxes unless otherwise stated.
            </p>
            <p className="mb-3">
              Payment is processed securely through Stripe. We do not store your
              credit card information on our servers. By submitting an order, you
              authorize us to charge the total amount to your selected payment
              method.
            </p>
            <p>
              We reserve the right to refuse or cancel any order at our
              discretion, including orders that appear fraudulent or contain
              inappropriate content. If we cancel your order, you will receive a
              full refund.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 font-[family-name:var(--font-playfair)] mb-3">
              4. Shipping
            </h2>
            <p className="mb-3">
              We offer free shipping on all orders within the United States.
              Orders are typically processed and shipped within 3-7 business
              days. Delivery times may vary based on your location and carrier
              availability.
            </p>
            <p>
              Risk of loss and title for items pass to you upon delivery to the
              carrier. We are not responsible for delays caused by the shipping
              carrier, weather, or other circumstances beyond our control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 font-[family-name:var(--font-playfair)] mb-3">
              5. Intellectual Property
            </h2>
            <p className="mb-3">
              You retain full ownership of any photos you upload to Memora. By
              uploading a photo, you grant us a limited, non-exclusive license to
              use that photo solely for the purpose of fulfilling your order
              (printing and shipping your magnets).
            </p>
            <p className="mb-3">
              You represent and warrant that you own or have the necessary rights
              to use any photos you upload, and that your photos do not infringe
              on any third-party intellectual property rights.
            </p>
            <p>
              The Memora name, logo, website design, and all related content are
              the property of Memora and are protected by copyright and trademark
              laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 font-[family-name:var(--font-playfair)] mb-3">
              6. Limitation of Liability
            </h2>
            <p className="mb-3">
              Memora is provided &quot;as is&quot; and &quot;as available&quot;
              without warranties of any kind, either express or implied. We do
              not guarantee that the service will be uninterrupted, error-free, or
              secure.
            </p>
            <p>
              To the fullest extent permitted by law, Memora shall not be liable
              for any indirect, incidental, special, consequential, or punitive
              damages arising from your use of or inability to use the service.
              Our total liability for any claim shall not exceed the amount you
              paid for the specific order giving rise to the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 font-[family-name:var(--font-playfair)] mb-3">
              7. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms of Service at any time.
              Changes will be posted on this page with an updated &quot;Last
              updated&quot; date. Your continued use of Memora after any changes
              constitutes acceptance of the new terms. We encourage you to review
              these terms periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 font-[family-name:var(--font-playfair)] mb-3">
              8. Contact
            </h2>
            <p>
              If you have any questions about these Terms of Service, please{' '}
              <Link
                href="/contact"
                className="text-[#0066FF] hover:text-[#0052CC] underline"
              >
                contact us
              </Link>
              . We are happy to help clarify any of our policies.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-stone-200">
          <Link
            href="/"
            className="text-sm text-[#0066FF] hover:text-[#0052CC]"
          >
            &larr; Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
