"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { requestOtp, verifyOtp } from "@/lib/api/auth";
import { getApiError, readDetailNumber } from "@/lib/api/errors";

type Step = "identify" | "verify";
type VerifyState = "idle" | "invalid" | "expired" | "network";
type ResendMode = "hidden" | "cooldown";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_PATTERN = /^\d{6}$/;

const COOLDOWN_CODES = new Set([
  "OTP_COOLDOWN",
  "OTP_LIMIT_REACHED",
  "RATE_LIMITED",
]);

function describeIdentifyError(error: unknown): string {
  const payload = getApiError(error);
  if (!payload) {
    return "Something went wrong. Check your connection and try again.";
  }

  switch (payload.code) {
    case "VALIDATION_ERROR":
      return payload.message || "Please check the details you entered.";
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

function describeVerifyError(error: unknown): {
  message: string;
  state: VerifyState;
} {
  const payload = getApiError(error);
  if (!payload) {
    return {
      message: "We couldn't verify your code. Check your connection and try again.",
      state: "network",
    };
  }

  switch (payload.code) {
    case "OTP_INVALID":
      return {
        message: "Incorrect code. Use the code in your latest email.",
        state: "invalid",
      };
    case "OTP_EXPIRED":
      return {
        message: "Code expired. Request a new code.",
        state: "expired",
      };
    case "OTP_ATTEMPTS_EXCEEDED":
      return {
        message: "Too many incorrect attempts. Request a new code.",
        state: "expired",
      };
    case "VALIDATION_ERROR":
      return {
        message: "Enter the 6-digit code.",
        state: "invalid",
      };
    default:
      return {
        message: payload.message || "We couldn't verify your code. Check your connection and try again.",
        state: "network",
      };
  }
}

export default function SignInPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("identify");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyState, setVerifyState] = useState<VerifyState>("idle");
  const [cooldown, setCooldown] = useState(0);
  const [resendMode, setResendMode] = useState<ResendMode>("hidden");
  const [toast, setToast] = useState<string | null>(null);

  const codeRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = useMemo(
    () => Array.from({ length: 6 }, (_, index) => code[index] ?? ""),
    [code]
  );

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const id = setInterval(() => {
      setCooldown((seconds) => (seconds <= 1 ? 0 : seconds - 1));
    }, 1000);

    return () => clearInterval(id);
  }, [cooldown]);

  useEffect(() => {
    if (step === "verify") {
      const nextIndex = Math.min(code.length, 5);
      codeRefs.current[nextIndex]?.focus();
    }
  }, [code.length, step]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const id = window.setTimeout(() => {
      setToast(null);
    }, 2600);

    return () => window.clearTimeout(id);
  }, [toast]);

  function resetVerifyFeedback() {
    setError(null);
    setVerifyState("idle");
  }

  function applyCode(nextCode: string) {
    setCode(nextCode.replace(/\D/g, "").slice(0, 6));
  }

  function setDigitAt(index: number, nextValue: string) {
    const sanitized = nextValue.replace(/\D/g, "");
    if (sanitized.length > 1) {
      const merged = `${code.slice(0, index)}${sanitized}${code.slice(index)}`;
      const clipped = merged.slice(0, 6);
      setCode(clipped);
      codeRefs.current[Math.min(index + sanitized.length, 5)]?.focus();
      return;
    }

    const nextDigits = [...digits];
    nextDigits[index] = sanitized;

    if (!sanitized) {
      let lastFilled = nextDigits.length;
      while (lastFilled > 0 && nextDigits[lastFilled - 1] === "") {
        lastFilled -= 1;
      }
      setCode(nextDigits.slice(0, lastFilled).join(""));
      return;
    }

    let joined = nextDigits.join("");
    while (joined.endsWith(" ")) {
      joined = joined.slice(0, -1);
    }

    setCode(joined);
    codeRefs.current[Math.min(index + 1, 5)]?.focus();
  }

  function handleCodePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text");
    const sanitized = pasted.replace(/\D/g, "").slice(0, 6);
    if (!sanitized) {
      return;
    }

    event.preventDefault();
    applyCode(sanitized);
    codeRefs.current[Math.min(sanitized.length, 6) - 1]?.focus();
    resetVerifyFeedback();
  }

  async function sendOtp(
    targetEmail: string,
    options: { advanceToVerify: boolean; revealCooldown: boolean; showToast: boolean }
  ) {
    setError(null);
    setLoading(true);

    try {
      const response = await requestOtp({ email: targetEmail });
      setCode("");
      resetVerifyFeedback();

      if (options.advanceToVerify) {
        setStep("verify");
      }
      setCooldown(response.data.resendAfterSeconds);
      setResendMode(options.revealCooldown ? "cooldown" : "hidden");
      if (options.showToast) {
        setToast("Code sent");
      }
    } catch (err) {
      setError(describeIdentifyError(err));
      const payload = getApiError(err);
      if (payload && COOLDOWN_CODES.has(payload.code)) {
        const retry = readDetailNumber(payload.details, "retryAfterSeconds");
        if (retry !== null) {
          setCooldown(retry);
          setResendMode("cooldown");
        }
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
    void sendOtp(trimmed, {
      advanceToVerify: true,
      revealCooldown: false,
      showToast: false,
    });
  }

  function handleResend() {
    if (loading) {
      return;
    }

    if (cooldown > 0) {
      setResendMode("cooldown");
      return;
    }

    void sendOtp(email, {
      advanceToVerify: false,
      revealCooldown: true,
      showToast: true,
    });
  }

  async function handleVerifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) {
      return;
    }

    if (verifyState === "expired") {
      void sendOtp(email, {
        advanceToVerify: false,
        revealCooldown: true,
        showToast: true,
      });
      return;
    }

    resetVerifyFeedback();
    if (!CODE_PATTERN.test(code)) {
      setError("Enter the 6-digit code.");
      setVerifyState("invalid");
      return;
    }

    setLoading(true);

    try {
      const result = await verifyOtp({ email, code });
      router.push(result.data.isNewUser ? "/onboarding" : "/dashboard");
    } catch (err) {
      const nextError = describeVerifyError(err);
      setError(nextError.message);
      setVerifyState(nextError.state);
    } finally {
      setLoading(false);
    }
  }

  function changeEmail() {
    setStep("identify");
    setCode("");
    setCooldown(0);
    setResendMode("hidden");
    setToast(null);
    resetVerifyFeedback();
  }

  return (
    <>
      <section className="w-full">
        <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.02] tracking-tight text-[#1A0B2E]">
          {step === "identify"
            ? "Let's get you started!"
            : "Check your email"}
        </h1>
        <p className="mt-4 max-w-[34rem] text-base font-medium text-[#726E77] sm:text-lg">
          {step === "identify"
            ? "Sign in to mark interest or book events."
            : `Enter the 6-digit code sent to ${email}.`}
        </p>

        <div aria-live="polite" className="min-h-8">
          {error && (
            <p role="alert" className="mt-6 text-sm font-semibold text-[#B32929]">
              {error}
            </p>
          )}
        </div>

        {step === "identify" ? (
          <form onSubmit={handleRequestOtp} className="mt-2 flex flex-col gap-6" noValidate>
            <div className="flex flex-col gap-2.5">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-[#1D1725]"
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
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError(null);
                }}
                placeholder="you@example.com"
                className="h-14 rounded-[20px] border border-[#DAD3E1] bg-white px-5 text-base font-medium text-[#1A0B2E] outline-none transition placeholder:text-[#726E77] focus:border-[#5B35F5]"
              />
              <p className="text-sm font-medium text-[#726E77]">
                Sign in with an email code. No password needed.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="mt-1 flex h-14 items-center justify-center gap-3 rounded-full bg-[#5B35F5] px-6 text-base font-semibold text-white transition hover:bg-[#4B28E1] disabled:cursor-not-allowed disabled:bg-[#C9C2CF]"
            >
              {loading && (
                <span
                  aria-hidden="true"
                  className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                />
              )}
              {loading ? "Sending code..." : "Send code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="mt-2 flex flex-col gap-6" noValidate>
            <div className="flex flex-col gap-2.5">
              <label
                htmlFor="otp-0"
                className="text-sm font-semibold text-[#1D1725]"
              >
                Email code
              </label>
              <div className="flex items-center gap-2 sm:gap-3">
                {digits.map((digit, index) => {
                  const active = index === Math.min(code.length, 5) && code.length < 6;
                  const hasError = verifyState !== "idle";

                  return (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      ref={(node) => {
                        codeRefs.current[index] = node;
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      enterKeyHint="done"
                      maxLength={6}
                      value={digit}
                      aria-label={`Code digit ${index + 1}`}
                      onChange={(event) => {
                        setDigitAt(index, event.target.value);
                        resetVerifyFeedback();
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Backspace" && !digits[index] && index > 0) {
                          event.preventDefault();
                          codeRefs.current[index - 1]?.focus();
                          setDigitAt(index - 1, "");
                          resetVerifyFeedback();
                        }

                        if (event.key === "ArrowLeft" && index > 0) {
                          event.preventDefault();
                          codeRefs.current[index - 1]?.focus();
                        }

                        if (event.key === "ArrowRight" && index < 5) {
                          event.preventDefault();
                          codeRefs.current[index + 1]?.focus();
                        }
                      }}
                      onPaste={handleCodePaste}
                      className={`h-14 min-w-0 flex-1 rounded-[18px] border text-center text-[1.55rem] font-semibold text-[#1D1725] outline-none transition sm:h-16 sm:text-[1.8rem] ${
                        hasError
                          ? "border-[#B32929] bg-white"
                          : active
                            ? "border-[#5B35F5] bg-white"
                            : "border-[#DAD3E1] bg-white"
                      }`}
                    />
                  );
                })}
              </div>
              <p className="text-sm font-medium text-[#726E77]">
                You can paste the full code.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className={`flex h-14 items-center justify-center gap-3 rounded-full px-6 text-base font-semibold text-white transition ${
                verifyState === "expired"
                  ? "bg-[#5B35F5] hover:bg-[#4B28E1]"
                  : "bg-[#5B35F5] hover:bg-[#4B28E1]"
              } disabled:cursor-not-allowed disabled:bg-[#C9C2CF]`}
            >
              {loading && (
                <span
                  aria-hidden="true"
                  className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                />
              )}
              {loading
                ? verifyState === "expired"
                  ? "Sending..."
                  : "Verifying..."
                : verifyState === "expired"
                  ? "Send a new code"
                  : "Verify code"}
            </button>
            <div className="flex flex-col items-end gap-4 text-sm font-semibold">
              {verifyState !== "expired" && (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-[#1A0B2E] transition hover:text-[#5B35F5] disabled:cursor-not-allowed disabled:text-[#726E77]"
                >
                  {resendMode === "cooldown" && cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : "Resend code"}
                </button>
              )}
              <button
                type="button"
                onClick={changeEmail}
                className="text-[#1A0B2E] transition hover:text-[#5B35F5]"
              >
                Change email
              </button>
            </div>
          </form>
        )}
      </section>

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex justify-center px-6">
          <div className="rounded-full bg-[#1D1725] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_-18px_rgba(26,11,46,0.55)]">
            {toast}
          </div>
        </div>
      )}
    </>
  );
}
