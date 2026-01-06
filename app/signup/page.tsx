"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/contexts/UserContext";
import { validatePassword } from "@/lib/passwordValidation";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"form" | "verify">("form");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { register } = useUser();

  const handleSendOTP = async () => {
    setError("");

    // Basic validation
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSendingOtp(true);

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpSent(true);
        setStep("verify");
      } else {
        setError(data.error || "Failed to send verification code.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation - check if form data exists
    if (!name || !email || !password || !confirmPassword) {
      const missingFields = [];
      if (!name) missingFields.push("Full Name");
      if (!email) missingFields.push("Email");
      if (!password) missingFields.push("Password");
      if (!confirmPassword) missingFields.push("Confirm Password");
      
      setError(`Please fill in all fields: ${missingFields.join(", ")}. Click &quot;Back&quot; to return to the form.`);
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors.join(". "));
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      // First verify OTP
      const verifyResponse = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code: otp }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        setError(verifyData.error || "Invalid verification code.");
        setLoading(false);
        return;
      }

      // If OTP is verified, proceed with registration (include OTP in registration)
      // Note: We need to update the register function to accept OTP
      // For now, we'll register after OTP verification
      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, otpCode: otp }),
      });

      const registerData = await registerResponse.json();

      if (registerResponse.ok && registerData.token) {
        localStorage.setItem("pixo-auth-token", registerData.token);
        router.push("/");
        router.refresh();
      } else {
        setError(registerData.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12">
      <div className="glass rounded-2xl sm:rounded-3xl border border-white/10 p-6 sm:p-8 md:p-10 max-w-md w-full">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <Link href="/">
              <Image
                src="/Pixo_logopng.png"
                alt="Pixo Logo"
                width={100}
                height={40}
                className="h-10 sm:h-12 w-auto"
                priority
                style={{ objectFit: "contain" }}
              />
            </Link>
          </div>

          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl sm:text-4xl text-cyan-neon">Create Account</h1>
            <p className="text-white/60 text-sm">Join Pixo and start shopping</p>
          </div>

          {step === "form" ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-white/80 mb-2">
                  Email
                </label>
                <div className="flex gap-2">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-cyan-neon transition-colors"
                    placeholder="your@email.com"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={sendingOtp || !email}
                    className="cta-btn px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {sendingOtp ? "Sending..." : "Verify Email"}
                  </button>
                </div>
                <p className="mt-1 text-xs text-white/50">
                  We&apos;ll send a verification code to your email
                </p>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-white/80 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-cyan-neon transition-colors"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-white/80 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 pr-12 text-white placeholder-white/40 focus:outline-none focus:border-cyan-neon transition-colors"
                    placeholder="Min 8 chars: 1 uppercase, 1 lowercase, 1 number, 1 symbol"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-cyan-neon transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0L12 12m-5.71-5.71L12 12m0 0l3.29 3.29M12 12l3.29 3.29m0 0L21 21m-5.71-5.71L12 12" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-white/50">
                  Must include: uppercase, lowercase, number, and symbol
                </p>

              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white/80 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 pr-12 text-white placeholder-white/40 focus:outline-none focus:border-cyan-neon transition-colors"
                    placeholder="Confirm your password"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-cyan-neon transition-colors focus:outline-none"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0L12 12m-5.71-5.71L12 12m0 0l3.29 3.29M12 12l3.29 3.29m0 0L21 21m-5.71-5.71L12 12" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {otpSent && (
                <div className="rounded-lg border border-cyan-neon/50 bg-cyan-neon/10 px-4 py-3 text-sm text-cyan-neon">
                  Verification code sent! Check your email and click &quot;Continue&quot; below.
                </div>
              )}

              {otpSent && (
                <button
                  type="button"
                  onClick={() => {
                    // Validate form before proceeding
                    if (!name || !password || !confirmPassword) {
                      setError("Please fill in all fields before continuing.");
                      return;
                    }
                    setStep("verify");
                  }}
                  className="cta-btn w-full text-center"
                >
                  Continue to Verification
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleVerifyAndRegister} className="space-y-4">
              <div className="space-y-4">
                <input type="hidden" name="name" value={name} />
                <input type="hidden" name="email" value={email} />
                <input type="hidden" name="password" value={password} />
                <input type="hidden" name="confirmPassword" value={confirmPassword} />

                <div className="rounded-lg border border-cyan-neon/50 bg-cyan-neon/10 px-4 py-3 text-sm text-cyan-neon">
                  Verification code sent to <strong>{email}</strong>
                </div>

                <div>
                  <label htmlFor="otp" className="block text-sm font-semibold text-white/80 mb-2">
                    Enter Verification Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-center text-2xl tracking-widest font-mono text-white placeholder-white/40 focus:outline-none focus:border-cyan-neon transition-colors"
                    placeholder="000000"
                    maxLength={6}
                    required
                    autoFocus
                  />
                  <p className="mt-1 text-xs text-white/50 text-center">
                    Enter the 6-digit code from your email
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("form");
                      setOtp("");
                    }}
                    className="flex-1 rounded-full border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:border-cyan-neon hover:text-cyan-neon"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={sendingOtp}
                    className="flex-1 rounded-full border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:border-cyan-neon hover:text-cyan-neon disabled:opacity-50"
                  >
                    {sendingOtp ? "Sending..." : "Resend Code"}
                  </button>
                </div>

                {error && (
                  <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="cta-btn w-full text-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating account..." : "Verify & Sign Up"}
                </button>
              </div>
            </form>
          )}


          <div className="text-center space-y-3">
            <p className="text-sm text-white/60">
              Already have an account?{" "}
              <Link href="/login" className="text-cyan-neon hover:text-cyan-neon/80 transition-colors font-semibold">
                Sign in
              </Link>
            </p>
            <Link href="/" className="block text-sm text-white/60 hover:text-cyan-neon transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

