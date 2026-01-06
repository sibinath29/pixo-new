"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import { getEffectivePriceForSize, getPriceForSize, getSalePriceForSize } from "@/utils/pricing";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getTotalCount, clearCart } = useCart();
  const cartCount = getTotalCount();

  const totalPrice = items.reduce((sum, item) => sum + getEffectivePriceForSize(item.product, item.size) * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6 text-center py-12">
        <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-cyan-neon">Cart</p>
        <h1 className="font-display text-2xl sm:text-3xl">Your cart is empty.</h1>
        <p className="text-sm sm:text-base text-white/65 mb-6">Add some products to get started!</p>
        <Link href="/posters" className="cta-btn inline-block">
          Shop Posters
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-cyan-neon">Cart</p>
          <h1 className="font-display text-2xl sm:text-3xl mt-1">Your cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})</h1>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs sm:text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Clear Cart
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={`${item.product.slug}-${item.size || 'no-size'}`}
              className="glass rounded-xl sm:rounded-2xl border border-white/10 p-4 sm:p-6"
            >
              <div className="flex gap-4 sm:gap-6">
                <Link href={`/product/${item.product.slug}`} className="flex-shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-white/10">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full"
                        style={{
                          background: `linear-gradient(135deg, ${item.product.accent || "#08f7fe"}, #00141a 70%)`,
                        }}
                      />
                    )}
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.product.slug}`}>
                    <h3 className="font-display text-base sm:text-lg text-white hover:text-cyan-neon transition-colors">
                      {item.product.title}
                    </h3>
                  </Link>
                  <p className="text-xs sm:text-sm text-white/60 mt-1">
                    {item.product.type} {item.size && `• ${item.size}`}
                  </p>
                  <div className="flex items-center justify-between mt-3 sm:mt-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.slug, item.quantity - 1, item.size)}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/20 text-white hover:border-cyan-neon hover:text-cyan-neon transition-colors flex items-center justify-center text-sm"
                      >
                        −
                      </button>
                      <span className="text-sm sm:text-base font-semibold text-white w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.slug, item.quantity + 1, item.size)}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/20 text-white hover:border-cyan-neon hover:text-cyan-neon transition-colors flex items-center justify-center text-sm"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end">
                        {(() => {
                          // Debug: Log product prices
                          console.log(`Cart Item - ${item.product.title} (${item.size}):`, {
                            price: item.product.price,
                            priceA3: item.product.priceA3,
                            priceA4: item.product.priceA4,
                            size: item.size,
                            calculatedPrice: getPriceForSize(item.product, item.size),
                          });
                          
                          const itemPrice = getPriceForSize(item.product, item.size);
                          const itemSalePrice = getSalePriceForSize(item.product, item.size);
                          return itemSalePrice && itemSalePrice > 0 ? (
                            <>
                              <span className="text-base sm:text-lg font-semibold text-cyan-neon">
                                ₹{itemSalePrice * item.quantity}
                              </span>
                              <span className="text-xs sm:text-sm text-white/50 line-through">
                                ₹{itemPrice * item.quantity}
                              </span>
                            </>
                          ) : (
                            <span className="text-base sm:text-lg font-semibold text-cyan-neon">
                              ₹{itemPrice * item.quantity}
                            </span>
                          );
                        })()}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.slug, item.size)}
                        className="text-red-400 hover:text-red-300 transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-24 h-fit">
          <div className="glass rounded-xl sm:rounded-2xl border border-white/10 p-4 sm:p-6 space-y-4">
            <h2 className="font-display text-xl sm:text-2xl">Order Summary</h2>
            <div className="space-y-2 border-t border-white/10 pt-4">
              <div className="flex justify-between text-sm text-white/80">
                <span>Subtotal</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="flex justify-between text-sm text-white/80">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between text-base sm:text-lg font-semibold">
                <span>Total</span>
                <span className="text-cyan-neon">₹{totalPrice}</span>
              </div>
            </div>
            <Link href="/checkout" className="cta-btn w-full text-center block">
              Proceed to Checkout
            </Link>
            <Link
              href="/posters"
              className="block text-center text-sm text-white/60 hover:text-cyan-neon transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

