"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";
import Script from "next/script";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, getTotalCount } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India",
    },
  });

  // Helper function to get the effective price (salePrice if available, otherwise price)
  const getEffectivePrice = (product: any) => product.salePrice || product.price;

  const totalPrice = items.reduce((sum, item) => sum + getEffectivePrice(item.product) * item.quantity, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Create order
      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: formData,
          items: items,
          amount: totalPrice,
        }),
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server returned an error. Please check the console for details.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      if (!data.success || !data.order) {
        throw new Error(data.error || "Failed to create order");
      }

      // Initialize Razorpay payment
      const options = {
        key: data.order.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Pixo",
        description: `Order for ${formData.name}`,
        order_id: data.order.razorpayOrderId,
        handler: async function (response: any) {
          // Verify payment
          const verifyResponse = await fetch("/api/payments/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: data.order.id,
            }),
          });

          // Check if response is JSON
          const verifyContentType = verifyResponse.headers.get("content-type");
          if (!verifyContentType || !verifyContentType.includes("application/json")) {
            const verifyText = await verifyResponse.text();
            console.error("Non-JSON response:", verifyText);
            router.push(`/payment/failed?orderId=${data.order.id}&error=${encodeURIComponent("Payment verification error. Please contact support.")}`);
            return;
          }

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            clearCart();
            router.push(`/payment/success?orderId=${data.order.id}`);
          } else {
            router.push(`/payment/failed?orderId=${data.order.id}&error=${encodeURIComponent(verifyData.error || "Payment verification failed")}`);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          address: `${formData.address.line1}, ${formData.address.city}, ${formData.address.state} ${formData.address.zipCode}`,
        },
        theme: {
          color: "#08f7fe",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response: any) {
        router.push(`/payment/failed?orderId=${data.order.id}&error=${encodeURIComponent(response.error.description || "Payment failed")}`);
      });

      razorpay.open();
    } catch (error: any) {
      setError(error.message || "An error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6 text-center py-12">
        <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-cyan-neon">Checkout</p>
        <h1 className="font-display text-2xl sm:text-3xl">Your cart is empty.</h1>
        <p className="text-sm sm:text-base text-white/65 mb-6">Add some products to get started!</p>
        <Link href="/posters" className="cta-btn inline-block">
          Shop Posters
        </Link>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <div className="space-y-6 sm:space-y-8">
        <div>
          <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-cyan-neon">Checkout</p>
          <h1 className="font-display text-2xl sm:text-3xl mt-1">Complete Your Order</h1>
        </div>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1fr_400px]">
          <div className="glass rounded-xl sm:rounded-2xl border border-white/10 p-4 sm:p-6">
            <h2 className="font-display text-xl sm:text-2xl mb-4 sm:mb-6">Shipping Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-white/80 mb-2">
                  Full Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-cyan-neon transition-colors"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-white/80 mb-2">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-cyan-neon transition-colors"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-white/80 mb-2">
                    Phone Number *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-cyan-neon transition-colors"
                    placeholder="+91 9876543210"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address.line1" className="block text-sm font-semibold text-white/80 mb-2">
                  Address Line 1 *
                </label>
                <input
                  id="address.line1"
                  name="address.line1"
                  type="text"
                  value={formData.address.line1}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-cyan-neon transition-colors"
                  placeholder="House/Flat No., Building Name"
                  required
                />
              </div>

              <div>
                <label htmlFor="address.line2" className="block text-sm font-semibold text-white/80 mb-2">
                  Address Line 2
                </label>
                <input
                  id="address.line2"
                  name="address.line2"
                  type="text"
                  value={formData.address.line2}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-cyan-neon transition-colors"
                  placeholder="Street, Area, Landmark"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="address.city" className="block text-sm font-semibold text-white/80 mb-2">
                    City *
                  </label>
                  <input
                    id="address.city"
                    name="address.city"
                    type="text"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-cyan-neon transition-colors"
                    placeholder="Mumbai"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="address.state" className="block text-sm font-semibold text-white/80 mb-2">
                    State *
                  </label>
                  <input
                    id="address.state"
                    name="address.state"
                    type="text"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-cyan-neon transition-colors"
                    placeholder="Maharashtra"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="address.zipCode" className="block text-sm font-semibold text-white/80 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    id="address.zipCode"
                    name="address.zipCode"
                    type="text"
                    value={formData.address.zipCode}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-cyan-neon transition-colors"
                    placeholder="400001"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Link
                  href="/cart"
                  className="flex-1 rounded-full border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:border-cyan-neon hover:text-cyan-neon text-center"
                >
                  ← Back to Cart
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="cta-btn flex-1 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Processing..." : `Pay ₹${totalPrice}`}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:sticky lg:top-24 h-fit">
            <div className="glass rounded-xl sm:rounded-2xl border border-white/10 p-4 sm:p-6 space-y-4">
              <h2 className="font-display text-xl sm:text-2xl">Order Summary</h2>
              <div className="space-y-3 border-t border-white/10 pt-4">
                {items.map((item) => {
                  const effectivePrice = getEffectivePrice(item.product);
                  return (
                    <div key={`${item.product.slug}-${item.size || "no-size"}`} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <p className="text-white/90">{item.product.title}</p>
                        <p className="text-white/60 text-xs">
                          {item.quantity} × ₹{effectivePrice} {item.size && `• ${item.size}`}
                          {item.product.salePrice && (
                            <span className="text-white/40 line-through ml-1">₹{item.product.price}</span>
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        {item.product.salePrice ? (
                          <>
                            <span className="text-cyan-neon font-semibold">₹{item.product.salePrice * item.quantity}</span>
                            <span className="text-white/50 text-xs line-through">₹{item.product.price * item.quantity}</span>
                          </>
                        ) : (
                          <span className="text-cyan-neon font-semibold">₹{item.product.price * item.quantity}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-white/80">
                  <span>Subtotal</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-sm text-white/80">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between text-base sm:text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-cyan-neon">₹{totalPrice}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

