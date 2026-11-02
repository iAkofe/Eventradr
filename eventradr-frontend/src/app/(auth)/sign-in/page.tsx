"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { requestOtp, verifyOtp } from "@/lib/api/auth";
import { getApiError, readDetailNumber } from "@/lib/api/errors";

type Step = "identify" | "verify";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Documented OTP pattern: ^\d{6}$ (VerifyOtpBody.code)
const CODE_PATTERN = /^\d{6}$/;

const COOLDOWN_CODES = new Set([
  "OTP_COOLDOWN",
  "OTP_LIMIT_REACHED",
  "RATE_LIMITED",
]);

function describeError(error: unknown): string {
  const payload = getApiError(error);
  if (!payload) {
    return "Something went wrong. Check your connection and try again.";
  }

  switch (payload.code) {
    case "VALIDATION_ERROR":
      return payload.message || "Please check the details you entered.";
    case "OTP_INVALID": {
      const remaining = readDetailNumber(payload.details, "attemptsRemaining");
      return remaining === null
        ? "That code is not correct."
        : `That code is not correct. ${remaining} attempt(s) remaining.`;
    }
    case "OTP_EXPIRED":
      return "That code has expired. Request a new one.";
    case "OTP_ATTEMPTS_EXCEEDED":
      return "Too many incorrect attempts. Request a new code.";
    case "OTP_COOLDOWN":
    case "OTP_LIMIT_REACHED":
    case "RATE_LIMITED": {
      const retry = readDetailNumber(payload.details, "retryAfterSeconds");
      return retry === null
        ? "Too many requests. Please wait and try again."
        : `Too many requests. Try again in ${retry}s.`;
    }
    case "EMAIL_UNAVAILABLE":
      return "We couldn't send a code right now. Please try again shortly.";
    default:
      return payload.message || "Something went wrong. Please try again.";
  }
}

export default function SignInPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("identify");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const codeRef = useRef<HTMLInputElement>(null);

  // Resend cooldown, driven by the documented resendAfterSeconds.
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => {
      setCooldown((seconds) => (seconds <= 1 ? 0 : seconds - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  useEffect(() => {
    if (step === "verify") {
      codeRef.current?.focus();
    }
  }, [step]);

  /** POST /api/v1/auth/otp for `targetEmail`; optionally advance to the verify step. */
  async function sendOtp(targetEmail: string, advanceToVerify: boolean) {
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      const response = await requestOtp({ email: targetEmail });
      setCode("");
      if (advanceToVerify) {
        setStep("verify");
      }
      setNotice(
        `We sent a 6-digit code to ${targetEmail}. It expires in ${Math.round(
          response.data.expiresInSeconds / 60
        )} minute(s).`
      );
      setCooldown(response.data.resendAfterSeconds);
    } catch (err) {
      setError(describeError(err));
      const payload = getApiError(err);
      if (payload && COOLDOWN_CODES.has(payload.code)) {
        const retry = readDetailNumber(payload.details, "retryAfterSeconds");
        if (retry !== null) setCooldown(retry);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleRequestOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }

    setEmail(trimmed);
    void sendOtp(trimmed, true);
  }

  function handleResend() {
    if (loading || cooldown > 0) return;
    void sendOtp(email, false);
  }

  async function handleVerifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setError(null);
    if (!CODE_PATTERN.test(code)) {
      setError("Enter the 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      await verifyOtp({ email, code });
      router.push("/dashboard");
    } catch (err) {
      setError(describeError(err));
      setCode("");
    } finally {
      setLoading(false);
    }
  }

  function changeEmail() {
    setStep("identify");
    setCode("");
    setError(null);
    setNotice(null);
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-black">
      <div className="w-full max-w-sm rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.145] dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Sign in
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {step === "identify"
            ? "We'll email you a 6-digit code. No password needed."
            : "Enter the code we emailed you."}
        </p>

        <div aria-live="polite">
          {notice && (
            <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              {notice}
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-300"
            >
              {error}
            </p>
          )}
        </div>

        {step === "identify" ? (
          <form onSubmit={handleRequestOtp} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-11 rounded-lg border border-black/[.12] bg-white px-3 text-base text-black outline-none focus:border-black/[.4] dark:border-white/[.16] dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-white/[.4]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="flex h-11 items-center justify-center gap-2 rounded-full bg-black px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {loading && (
                <span
                  aria-hidden="true"
                  className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                />
              )}
              {loading ? "Sending code…" : "Send code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="code"
                className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
              >
                6-digit code
              </label>
              <input
                id="code"
                name="code"
                ref={codeRef}
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{6}"
                maxLength={6}
                required
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                className="h-11 rounded-lg border border-black/[.12] bg-white px-3 text-base tracking-[0.3em] text-black outline-none focus:border-black/[.4] dark:border-white/[.16] dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-white/[.4]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="flex h-11 items-center justify-center gap-2 rounded-full bg-black px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {loading && (
                <span
                  aria-hidden="true"
                  className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                />
              )}
              {loading ? "Verifying…" : "Verify code"}
            </button>
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={changeEmail}
                className="text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-400"
              >
                Change email
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={loading || cooldown > 0}
                className="text-zinc-600 underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50 dark:text-zinc-400"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
