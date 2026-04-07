import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { authService } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const OtpModal = ({
  email,
  onClose,
  onVerified,
  localOtp,
  localOtpExpiresAt,
  delivery = "email",
  warning,
}) => {
  const [digits, setDigits] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(300);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const inputRefs = useRef([]);
  const { login } = useAuth();
  const navigate = useNavigate();

  const isLocalDelivery = delivery === "local" || Boolean(localOtp);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleInput = (index, e) => {
    const value = e.target.value;
    if (value && !/^\d$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newDigits.every((d) => d !== "")) {
      verify(newDigits.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(data)) return;

    const newDigits = [...digits];
    data.split("").forEach((char, i) => {
      if (i < 6) newDigits[i] = char;
    });
    setDigits(newDigits);

    const nextEmpty = newDigits.findIndex((d) => d === "");
    const focusIndex = nextEmpty === -1 ? 5 : nextEmpty;
    inputRefs.current[focusIndex]?.focus();

    if (newDigits.every((d) => d !== "")) {
      verify(newDigits.join(""));
    }
  };

  const verify = async (code) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError("");

    try {
      const response = await authService.verifyOtp(email, code);
      const { access_token, user } = response.data;
      login(access_token, user);
      onVerified();
      navigate("/app/blacklists");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired code");
      setDigits(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const resend = async () => {
    try {
      await authService.resendOtp(email);
      setTimer(300);
      setDigits(Array(6).fill(""));
      setError("");
      setCopyMessage("");
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError("Failed to resend code");
    }
  };

  const handleCopyCode = async () => {
    if (!localOtp) return;

    try {
      await navigator.clipboard.writeText(localOtp);
      setCopyMessage("Code copied");
    } catch (err) {
      setCopyMessage("Copy failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[#031124]">Security Verification</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="text-center mb-8">
          <p className="text-slate-600 text-sm mb-6">
            {isLocalDelivery ? (
              <>
                Enter the 6-digit code generated for <span className="font-semibold text-[#031124]">{email}</span>
              </>
            ) : (
              <>
                Enter the 6-digit code sent to <span className="font-semibold text-[#031124]">{email}</span>
              </>
            )}
          </p>

          {isLocalDelivery && (
            <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                Local Development Mode
              </p>
              <p className="mt-1 text-xs text-amber-900">
                {warning || "Email delivery is disabled. Use this code for verification."}
              </p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] text-amber-700">OTP code</p>
                  <p className="font-mono text-lg font-bold tracking-[0.2em] text-amber-900">{localOtp || "------"}</p>
                  {localOtpExpiresAt && (
                    <p className="text-[11px] text-amber-700">Expires at: {new Date(localOtpExpiresAt).toLocaleTimeString()}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors"
                >
                  Copy Code
                </button>
              </div>
              {copyMessage && <p className="mt-2 text-[11px] font-medium text-amber-800">{copyMessage}</p>}
            </div>
          )}

          <div className="flex justify-center space-x-2 mb-6">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleInput(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-xl font-bold border-2 border-slate-200 rounded-lg focus:outline-none focus:border-[#ff6b6b] focus:ring-4 focus:ring-[#ff6b6b]/20 transition-all text-[#343a43]"
              />
            ))}
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="text-sm text-slate-500">
            Code valid for:{" "}
            <span className={`font-mono font-bold ${timer < 60 ? "text-red-500" : "text-slate-700"}`}>
              {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
            </span>
          </div>

          <button
            onClick={resend}
            className="mt-4 text-[#ff5925] font-semibold hover:underline"
          >
            Resend Code
          </button>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border-2 border-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpModal;
