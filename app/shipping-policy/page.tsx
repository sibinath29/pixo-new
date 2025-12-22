import Link from "next/link";

export const metadata = {
  title: "Shipping Policy | Pixo",
  description: "Shipping policy for Pixo posters and polaroids",
};

export default function ShippingPolicy() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-4">
        <Link href="/" className="text-cyan-neon hover:text-cyan-neon/80 transition-colors inline-block">
          ← Back to Home
        </Link>
        <h1 className="font-display text-4xl sm:text-5xl text-cyan-neon">Shipping Policy</h1>
        <p className="text-white/60">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="glass rounded-2xl border border-white/10 p-6 sm:p-8 space-y-6 text-white/80">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Shipping Information</h2>
          <p>
            We ship our premium posters and polaroids to customers across India. All orders are carefully packaged to ensure your prints arrive in perfect condition.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Processing Time</h2>
          <p>
            Orders are typically processed within 2-3 business days after payment confirmation. During peak seasons or promotional periods, processing may take up to 5 business days.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Shipping Methods & Delivery Time</h2>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Standard Shipping:</strong> 5-7 business days</li>
            <li><strong>Express Shipping:</strong> 2-3 business days (additional charges apply)</li>
          </ul>
          <p className="mt-4">
            Delivery times are estimates and may vary based on your location and shipping carrier schedules.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Shipping Charges</h2>
          <p>
            Shipping charges are calculated at checkout based on your delivery address and selected shipping method. Free shipping may be available for orders above a certain value during promotional periods.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Tracking Your Order</h2>
          <p>
            Once your order ships, you will receive a tracking number via email. You can use this to track your package's journey to your doorstep.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">International Shipping</h2>
          <p>
            Currently, we only ship within India. International shipping options may be available in the future. Please check back for updates.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Contact Us</h2>
          <p>
            If you have any questions about shipping, please contact us at{" "}
            <a href="mailto:pixo.shopoff@gmail.com" className="text-cyan-neon hover:text-cyan-neon/80">
              pixo.shopoff@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}

