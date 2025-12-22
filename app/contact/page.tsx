"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // In a real implementation, you would send this to your backend
    // For now, we'll just show a success message
    setTimeout(() => {
      setSubmitted(true);
      setSubmitting(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-4">
        <Link href="/" className="text-cyan-neon hover:text-cyan-neon/80 transition-colors inline-block">
          ← Back to Home
        </Link>
        <h1 className="font-display text-4xl sm:text-5xl text-cyan-neon">Contact Us</h1>
        <p className="text-white/60">Get in touch with us for any questions or support</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-2xl border border-white/10 p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Get in Touch</h2>
            <p className="text-white/80 mb-6">
              Have a question about our products, orders, or need support? We're here to help!
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-cyan-neon mb-2">Email</h3>
              <a
                href="mailto:pixo.shopoff@gmail.com"
                className="text-white/80 hover:text-cyan-neon transition-colors"
              >
                pixo.shopoff@gmail.com
              </a>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-cyan-neon mb-2">Response Time</h3>
              <p className="text-white/80">
                We typically respond within 24-48 hours during business days.
              </p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl border border-white/10 p-6 sm:p-8">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="text-cyan-neon text-4xl mb-4">✓</div>
              <h2 className="text-2xl font-semibold text-white">Message Sent!</h2>
              <p className="text-white/80">
                Thank you for contacting us. We'll get back to you soon.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="cta-btn mt-4"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-white/80 mb-2">
                  Name *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-cyan-neon transition-colors"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-white/80 mb-2">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-cyan-neon transition-colors"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-white/80 mb-2">
                  Subject *
                </label>
                <input
                  id="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-cyan-neon transition-colors"
                  placeholder="What's this about?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-white/80 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-cyan-neon transition-colors resize-none"
                  placeholder="Your message..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="cta-btn w-full text-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

