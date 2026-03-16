import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
          Privacy Policy
        </h1>

        <div className="space-y-8 text-stone-700 leading-relaxed text-[15px]">
          <section>
            <h2 className="text-xl font-semibold text-stone-900 font-[family-name:var(--font-playfair)] mb-3">
              1. Data We Collect
            </h2>
            <p className="mb-3">
              We collect the minimum amount of information necessary to fulfill
              your order and provide a great experience. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>
                <strong>Email address</strong> &mdash; used for order
                confirmation, shipping updates, and customer support
              </li>
              <li>
                <strong>Shipping addresses</strong> &mdash; used to deliver your
                magnets to you or your recipients
              </li>
              <li>
                <strong>Photos</strong> &mdash; the images you upload to create
                your custom magnets
              </li>
              <li>
                <strong>Payment information</strong> &mdash; processed securely
                by Stripe; we never store your credit card details
              </li>
              <li>
                <strong>Contact form submissions</strong> &mdash; your name,
                email, and message when you reach out for support
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 font-[family-name:var(--font-playfair)] mb-3">
              2. How We Use Your Data
            </h2>
            <p className="mb-3">Your information is used for:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>
                <strong>Order fulfillment</strong> &mdash; printing your magnets
                and shipping them to the correct address
              </li>
              <li>
                <strong>Communication</strong> &mdash; sending order
                confirmations, shipping notifications, and tracking information
              </li>
              <li>
                <strong>Customer support</strong> &mdash; responding to your
                inquiries and resolving any issues
              </li>
              <li>
                <strong>Service improvement</strong> &mdash; understanding usage
                patterns to make Memora better
              </li>
            </ul>
            <p className="mt-3">
              We will never sell your personal information to third parties or
              use your photos for marketing purposes without your explicit
              consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 font-[family-name:var(--font-playfair)] mb-3">
              3. Data Sharing
            </h2>
            <p className="mb-3">
              We share your information only with trusted service providers
              necessary to fulfill your order:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>
                <strong>Print shop partner</strong> &mdash; receives your photo
                and shipping address to print and ship your magnets
              </li>
              <li>
                <strong>Stripe</strong> &mdash; processes payments securely. See{' '}
                <a
                  href="https://stripe.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0066FF] hover:text-[#0052CC] underline"
                >
                  Stripe&apos;s Privacy Policy
                </a>
              </li>
              <li>
                <strong>Shipping carriers</strong> (USPS/UPS) &mdash; receive
                shipping addresses to deliver your order
              </li>
            </ul>
            <p className="mt-3">
              We do not share your data with any other third parties for
              marketing or advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 font-[family-name:var(--font-playfair)] mb-3">
              4. Data Retention
            </h2>
            <p className="mb-3">
              We retain your personal information only as long as necessary to
              fulfill the purposes outlined in this policy:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>
                <strong>Order data</strong> &mdash; retained for up to 2 years
                for order history and customer support
              </li>
              <li>
                <strong>Photos</strong> &mdash; stored securely during order
                fulfillment and deleted within 90 days after delivery
              </li>
              <li>
                <strong>Contact submissions</strong> &mdash; retained for up to
                1 year
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 font-[family-name:var(--font-playfair)] mb-3">
              5. Cookies
            </h2>
            <p>
              Memora uses essential cookies to maintain your session and order
              state as you navigate through the site. We do not use advertising
              or tracking cookies. No third-party analytics tools are used to
              track your behavior across other websites.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 font-[family-name:var(--font-playfair)] mb-3">
              6. Your Rights
            </h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>
                <strong>Access</strong> &mdash; request a copy of the personal
                data we hold about you
              </li>
              <li>
                <strong>Correct</strong> &mdash; request correction of
                inaccurate personal data
              </li>
              <li>
                <strong>Delete</strong> &mdash; request deletion of your
                personal data, subject to legal retention requirements
              </li>
              <li>
                <strong>Data portability</strong> &mdash; receive your data in a
                structured, machine-readable format
              </li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please{' '}
              <Link
                href="/contact"
                className="text-[#0066FF] hover:text-[#0052CC] underline"
              >
                contact us
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 font-[family-name:var(--font-playfair)] mb-3">
              7. Contact
            </h2>
            <p>
              If you have any questions or concerns about this Privacy Policy or
              how we handle your data, please{' '}
              <Link
                href="/contact"
                className="text-[#0066FF] hover:text-[#0052CC] underline"
              >
                contact us
              </Link>
              . We take your privacy seriously and will respond to all inquiries
              promptly.
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
