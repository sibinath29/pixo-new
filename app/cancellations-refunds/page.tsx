import Link from "next/link";

export const metadata = {
  title: "Cancellations and Refunds | Pixo",
  description: "Cancellation and refund policy for Pixo posters and polaroids",
};

export default function CancellationsRefunds() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-4">
        <Link href="/" className="text-cyan-neon hover:text-cyan-neon/80 transition-colors inline-block">
          ← Back to Home
        </Link>
        <h1 className="font-display text-4xl sm:text-5xl text-cyan-neon">Cancellations and Refunds</h1>
        <p className="text-white/60">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="glass rounded-2xl border border-white/10 p-6 sm:p-8 space-y-6 text-white/80">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Cancellation Policy</h2>
          <p>
            You may cancel your order within 24 hours of placing it, provided the order has not yet been processed for printing. Once your order enters the printing stage, cancellation may not be possible.
          </p>
          <p>
            To cancel an order, please contact us immediately at{" "}
            <a href="mailto:pixo.shopoff@gmail.com" className="text-cyan-neon hover:text-cyan-neon/80">
              pixo.shopoff@gmail.com
            </a>{" "}
            with your order number.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Refund Policy</h2>
          <p>
            We want you to be completely satisfied with your purchase. If you are not satisfied, we offer refunds under the following circumstances:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Damaged Products:</strong> If your product arrives damaged or defective, please contact us within 7 days of delivery with photos of the damage. We will provide a full refund or replacement.</li>
            <li><strong>Wrong Product:</strong> If you receive a product different from what you ordered, contact us immediately for a full refund or replacement.</li>
            <li><strong>Quality Issues:</strong> If the print quality does not meet our standards, we will provide a refund or replacement.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Refund Process</h2>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Contact us at pixo.shopoff@gmail.com with your order number and reason for refund</li>
            <li>We will review your request and respond within 2-3 business days</li>
            <li>If approved, we will process your refund within 5-7 business days</li>
            <li>Refunds will be credited to the original payment method used for the purchase</li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Non-Refundable Items</h2>
          <p>
            The following are not eligible for refund:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Custom or personalized products (unless damaged or defective)</li>
            <li>Products returned after 7 days of delivery</li>
            <li>Products that have been used, damaged by the customer, or not in original packaging</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Return Shipping</h2>
          <p>
            If a return is required due to our error (wrong product, damaged item, etc.), we will cover the return shipping costs. For returns due to customer preference, return shipping costs will be borne by the customer.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Processing Time</h2>
          <p>
            Refunds are typically processed within 5-7 business days after approval. The refund amount will appear in your account within 7-14 business days, depending on your bank or payment provider.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Contact Us</h2>
          <p>
            For any questions regarding cancellations or refunds, please contact us at{" "}
            <a href="mailto:pixo.shopoff@gmail.com" className="text-cyan-neon hover:text-cyan-neon/80">
              pixo.shopoff@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}

