"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/contexts/AdminContext";
import Link from "next/link";

export default function AdminLogin() {
  const [step, setStep] = useState<"password" | "otp">("password");
  const [password, setPassword] = useState("");
  const [verifiedPassword, setVerifiedPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const { login, verifyOTP } = useAdmin();
  const router = useRouter();

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const isValid = await login(password);
      if (isValid) {
        setOtpSent(true);
        setVerifiedPassword(password);
        setStep("otp");
        setPassword("");
      } else {
        setError("Incorrect password. Please try again.");
        setPassword("");
      }
    } catch (error: any) {
      setError("An error occurred. Please try again.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const isValid = await verifyOTP(otp);
      if (isValid) {
        router.push("/admin/dashboard");
      } else {
        setError("Invalid OTP. Please check your email and try again.");
        setOtp("");
      }
    } catch (error: any) {
      setError("An error occurred. Please try again.");
      console.error("OTP verification error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: verifiedPassword }),
      });

      const data = await response.json();

      if (data.success) {
        setError("");
        setOtpSent(true);
        alert("OTP has been resent to pixo.shopoff@gmail.com");
      } else {
        setError(data.error || "Failed to resend OTP. Please try again.");
      }
    } catch (error: any) {
      setError("An error occurred. Please try again.");
      console.error("Resend OTP error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="glass rounded-2xl border border-white/10 p-8 sm:p-10 max-w-md w-full">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl sm:text-4xl text-cyan-neon">Admin Login</h1>
            <p className="text-white/60 text-sm">
              {step === "password" 
                ? "Enter your password to continue" 
                : "Enter the OTP sent to your email"}
            </p>
          </div>

          {step === "password" ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-white/80 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-cyan-neon transition-colors"
                  placeholder="Enter admin password"
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="cta-btn w-full text-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending OTP..." : "Continue"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOTPSubmit} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-semibold text-white/80 mb-2">
                  OTP Code
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-cyan-neon transition-colors text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                  maxLength={6}
                  required
                  autoFocus
                />
                <p className="mt-2 text-xs text-white/50 text-center">
                  OTP sent to pixo.shopoff@gmail.com
                </p>
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="cta-btn w-full text-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("password");
                      setOtp("");
                      setError("");
                    }}
                    className="flex-1 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-neon hover:text-cyan-neon"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="flex-1 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-neon hover:text-cyan-neon disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="text-center">
            <Link href="/" className="text-sm text-white/60 hover:text-cyan-neon transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


