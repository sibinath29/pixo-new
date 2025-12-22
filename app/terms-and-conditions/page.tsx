import Link from "next/link";

export const metadata = {
  title: "Terms and Conditions | Pixo",
  description: "Terms and conditions for Pixo posters and polaroids",
};

export default function TermsAndConditions() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-4">
        <Link href="/" className="text-cyan-neon hover:text-cyan-neon/80 transition-colors inline-block">
          ← Back to Home
        </Link>
        <h1 className="font-display text-4xl sm:text-5xl text-cyan-neon">Terms and Conditions</h1>
        <p className="text-white/60">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="glass rounded-2xl border border-white/10 p-6 sm:p-8 space-y-6 text-white/80">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Agreement to Terms</h2>
          <p>
            By accessing and using the Pixo website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Use License</h2>
          <p>
            Permission is granted to temporarily access the materials on Pixo's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to decompile or reverse engineer any software contained on the website</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Product Information</h2>
          <p>
            We strive to provide accurate product descriptions and images. However, we do not warrant that product descriptions or other content on this site is accurate, complete, reliable, current, or error-free.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Pricing</h2>
          <p>
            All prices are listed in Indian Rupees (₹). We reserve the right to change prices at any time without prior notice. However, you will be charged the price displayed at the time you place your order.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Payment</h2>
          <p>
            Payment must be made at the time of order placement. We accept payments through Razorpay, which supports various payment methods including credit cards, debit cards, UPI, and net banking.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Account Registration</h2>
          <p>
            You may be required to create an account to make purchases. You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Limitation of Liability</h2>
          <p>
            In no event shall Pixo or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Pixo's website.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Revisions</h2>
          <p>
            Pixo may revise these terms of service at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Contact Information</h2>
          <p>
            If you have any questions about these Terms and Conditions, please contact us at{" "}
            <a href="mailto:pixo.shopoff@gmail.com" className="text-cyan-neon hover:text-cyan-neon/80">
              pixo.shopoff@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}

