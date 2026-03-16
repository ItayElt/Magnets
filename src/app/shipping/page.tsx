import Link from 'next/link';

export default function ShippingPolicyPage() {
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
          Shipping Policy
        </h1>

        <div className="space-y-8 text-stone-700 leading-relaxed text-[15px]">
          <section>
            <h2 className="text-xl font-semibold text-stone-900 font-[family-name:var(--font-playfair)] mb-3">
              Free Shipping
            </h2>
            <p>
              All Memora orders ship for free within the United States. There are
              no hidden fees or shipping charges at checkout. The price you see
              is the price you pay.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 font-[family-name:var(--font-playfair)] mb-3">
              Delivery Time
            </h2>
            <p className="mb-3">
              Orders are typically printed, packaged, and shipped within{' '}
              <strong>3-7 business days</strong> from the date your order is
              placed. Delivery times may vary based on:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Your shipping address location</li>
              <li>Current order volume</li>
              <li>Carrier delivery schedules</li>
              <li>Weather conditions and holidays</li>
            </ul>
            <p className="mt-3">
              Business days are Monday through Friday, excluding federal
              holidays.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 font-[family-name:var(--font-playfair)] mb-3">
              Shipping Coverage
            </h2>
            <p>
              We currently ship to all 50 US states and Washington, D.C.
              International shipping is not available at this time. We are
              working to expand our shipping coverage in the future.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 font-[family-name:var(--font-playfair)] mb-3">
              Carriers
            </h2>
            <p>
              Orders are shipped via USPS First-Class Mail or UPS Ground,
              depending on the order size and destination. The carrier is
              selected automatically to ensure the fastest and most reliable
              delivery for your location.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 font-[family-name:var(--font-playfair)] mb-3">
              Order Tracking
            </h2>
            <p className="mb-3">
              Once your order ships, you will receive a tracking number via email
              at the address you provided during checkout. You can also track
              your order at any time on our{' '}
              <Link
                href="/track"
                className="text-[#0066FF] hover:text-[#0052CC] underline"
              >
                order tracking page
              </Link>
              .
            </p>
            <p>
              Please allow up to 24 hours after receiving your shipping
              confirmation for the tracking information to update in the
              carrier&apos;s system.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 font-[family-name:var(--font-playfair)] mb-3">
              PO Boxes
            </h2>
            <p>
              We are unable to ship to PO Box addresses at this time. Please
              provide a physical street address for delivery. If you need
              assistance finding an alternative delivery address, please{' '}
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
              Damaged Packages
            </h2>
            <p className="mb-3">
              Your magnets are carefully packaged in rigid mailers to prevent
              damage during transit. However, if your package arrives damaged:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>
                Take a photo of the damaged package and product before
                discarding any packaging materials
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-[#0066FF] hover:text-[#0052CC] underline"
                >
                  Contact us
                </Link>{' '}
                within 14 days of delivery with your order ID and photos
              </li>
              <li>
                We will send a free replacement at no additional cost to you
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 font-[family-name:var(--font-playfair)] mb-3">
              Incorrect Address
            </h2>
            <p>
              Please double-check your shipping address before completing your
              order. If a package is returned to us due to an incorrect or
              incomplete address, we will contact you to arrange re-shipment.
              Additional shipping charges may apply for re-shipped orders.
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
