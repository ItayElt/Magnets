import Link from 'next/link';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="font-[family-name:var(--font-playfair)] text-xl font-bold text-stone-900"
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
          Refund Policy
        </h1>

        <div className="space-y-8 text-stone-700 leading-relaxed text-[15px]">
          <section>
            <h2 className="text-xl font-semibold text-stone-900 font-[family-name:var(--font-playfair)] mb-3">
              Custom Products
            </h2>
            <p>
              Because every Memora magnet is custom-made with your personal
              photo, we are unable to accept returns or issue refunds for
              products that are not defective. Each magnet is printed
              specifically for you and cannot be resold or reused.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 font-[family-name:var(--font-playfair)] mb-3">
              Damaged or Defective Products
            </h2>
            <p className="mb-3">
              We take great care in producing and packaging your magnets.
              However, if your order arrives damaged or defective, we will make
              it right. To qualify for a free replacement:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>
                Contact us within <strong>14 days</strong> of receiving your
                order
              </li>
              <li>
                Provide your order ID and a photo of the damaged or defective
                product
              </li>
              <li>
                We will send a free replacement at no additional cost to you
              </li>
            </ul>
            <p className="mt-3">
              Defective products include those with printing errors, color
              issues, material defects, or damage that occurred during shipping.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 font-[family-name:var(--font-playfair)] mb-3">
              Order Cancellation
            </h2>
            <p className="mb-3">
              You may cancel your order for a full refund within{' '}
              <strong>24 hours</strong> of placing it, provided that production
              has not yet begun. To cancel:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>
                <Link
                  href="/contact"
                  className="text-amber-700 hover:text-amber-800 underline"
                >
                  Contact us
                </Link>{' '}
                with your order ID as soon as possible
              </li>
              <li>
                If your order has not yet been sent to our print shop, we will
                cancel it and issue a full refund
              </li>
              <li>
                Refunds are processed back to your original payment method
                within 5-10 business days
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 font-[family-name:var(--font-playfair)] mb-3">
              After Production Begins
            </h2>
            <p>
              Once your order has been sent to our print shop, we are unable to
              cancel it or issue a refund. Custom products are printed on demand
              and cannot be reversed once production has started. If you have
              concerns about your order, please{' '}
              <Link
                href="/contact"
                className="text-amber-700 hover:text-amber-800 underline"
              >
                contact us
              </Link>{' '}
              and we will do our best to help.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 font-[family-name:var(--font-playfair)] mb-3">
              How to Request a Refund or Replacement
            </h2>
            <p className="mb-3">
              For all refund or replacement requests, please{' '}
              <Link
                href="/contact"
                className="text-amber-700 hover:text-amber-800 underline"
              >
                contact us
              </Link>{' '}
              with:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Your order ID (e.g., MEM-12345)</li>
              <li>The email address used for your order</li>
              <li>
                A description of the issue and photos if the product is damaged
              </li>
            </ul>
            <p className="mt-3">
              We aim to respond to all requests within 24 hours and will work
              with you to resolve the issue as quickly as possible.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-stone-200">
          <Link
            href="/"
            className="text-sm text-amber-700 hover:text-amber-800"
          >
            &larr; Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
