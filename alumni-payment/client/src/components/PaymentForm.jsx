import { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { QRCode } from "react-qr-code";
import { verifyPayment, getFundingStatus } from "../services/api";
import { useLanguage } from "../context/LanguageContext";

/**
 * Custom hook to detect if the current device is mobile.
 * Uses window.navigator.userAgent and matchMedia queries.
 */
function useDeviceType() {
  const [isMobile, setIsMobile] = useState(false);
  const [os, setOs] = useState("generic");

  useEffect(() => {
    const checkDevice = () => {
      const ua = (navigator.userAgent || navigator.vendor || window.opera).toLowerCase();
      const isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
      const isTouchMedia = window.matchMedia("(pointer: coarse)").matches;
      
      setIsMobile(isMobileUA || isTouchMedia || window.innerWidth <= 768);

      if (/iphone|ipad|ipod/i.test(ua)) {
        setOs("ios");
      } else if (/android/i.test(ua)) {
        setOs("android");
      } else {
        setOs("generic");
      }
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    window.addEventListener("orientationchange", checkDevice);
    return () => {
      window.removeEventListener("resize", checkDevice);
      window.removeEventListener("orientationchange", checkDevice);
    };
  }, []);

  return { isMobile, os };
}

/**
 * Helper to validate email addresses using RFC 5322 regex.
 */
function validateEmail(email) {
  const regex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return regex.test(email);
}

const PaymentForm = () => {
  const { t } = useLanguage();
  const { isMobile, os } = useDeviceType();
  const navigate = useNavigate();

  // Reference for accessibility management (focus routing)
  const headerRef = useRef(null);

  // States
  const [step, setStep] = useState(1); // 1 = Form, 2 = Payment details / QR
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    amount: "",
    examType: "HS",
    passoutYear: "",
  });

  const [loading, setLoading] = useState(false);
  const [fundingActive, setFundingActive] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [submissionInitiated, setSubmissionInitiated] = useState(false);

  // Load configuration from env variables
  const upiId = import.meta.env.VITE_UPI_ID || "your-upi-id@bank";

  // Generate unique transaction reference per session initialization
  const transactionRef = useMemo(() => `ALUMNI-${Date.now()}`, [step]);

  // Format amount cleanly to 2 decimal places
  const formattedAmount = useMemo(() => {
    const parsed = Number(formData.amount);
    return isNaN(parsed) || parsed <= 0 ? "0.00" : parsed.toFixed(2);
  }, [formData.amount]);

  // Memoized UPI Deep Link with URI Encoded elements
  const upiString = useMemo(() => {
    const pa = encodeURIComponent(upiId);
    const pn = encodeURIComponent("AlumniFund");
    const am = encodeURIComponent(formattedAmount);
    const tn = encodeURIComponent(transactionRef);
    return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}`;
  }, [upiId, formattedAmount, transactionRef]);

  // App-specific deep links (Google Pay, PhonePe, Paytm)
  const appDeepLinks = useMemo(() => {
    const baseParams = `pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent("AlumniFund")}&am=${encodeURIComponent(formattedAmount)}&cu=INR&tn=${encodeURIComponent(transactionRef)}`;
    
    // Custom schemes for Android & iOS redirections
    return {
      generic: `upi://pay?${baseParams}`,
      gpay: os === "ios" ? `gpay://upi/pay?${baseParams}` : `intent://pay?${baseParams}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`,
      phonepe: os === "ios" ? `phonepe://pay?${baseParams}` : `intent://pay?${baseParams}#Intent;scheme=upi;package=com.phonepe.app;end`,
      paytm: os === "ios" ? `paytmmp://pay?${baseParams}` : `intent://pay?${baseParams}#Intent;scheme=upi;package=net.one97.paytm;end`,
    };
  }, [upiId, formattedAmount, transactionRef, os]);

  // Dropdown list initialization
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const list = [];
    for (let year = 1977; year <= currentYear; year++) {
      list.push(year);
    }
    return list;
  }, []);

  // Fetch application configuration status
  useEffect(() => {
    let active = true;
    const checkStatus = async () => {
      try {
        const data = await getFundingStatus();
        if (active) {
          setFundingActive(data.fundingActive);
        }
      } catch (err) {
        console.error("Failed to check funding status", err);
      } finally {
        if (active) {
          setCheckingStatus(false);
        }
      }
    };
    checkStatus();
    return () => {
      active = false;
    };
  }, []);

  // Set focus to the step header on step change for better accessibility
  useEffect(() => {
    if (headerRef.current) {
      headerRef.current.focus();
    }
  }, [step]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Action: Proceed to payment details screen after input validation
   */
  const handleProceedToPayment = (e) => {
    e.preventDefault();

    // Input Validation
    const cleanName = formData.name.trim();
    if (!cleanName) {
      return toast.error(t("errorFillAll") || "Name is required");
    }

    if (!formData.email || !validateEmail(formData.email.trim())) {
      return toast.error(
        t("invalidEmail") || "Please enter a valid email address",
      );
    }

    if (!formData.examType) {
      return toast.error(t("errorExamType") || "Please select exam type");
    }

    if (!formData.passoutYear) {
      return toast.error(
        t("errorPassoutYear") || "Please select year of passout",
      );
    }

    const amt = Number(formData.amount);
    if (isNaN(amt) || amt <= 0) {
      return toast.error(
        t("errorMinAmount") || "Amount must be a valid positive number",
      );
    }

    setFormData((prev) => ({
      ...prev,
      name: cleanName,
      email: formData.email.trim(),
    }));
    setStep(2);
  };

  /**
   * Action: Submit payment verification details to database
   */
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (submissionInitiated) return;

    // Save loading toast id to dismiss it properly
    const toastId = toast.loading(t("initiateGateway") || "Verifying transaction...");

    try {
      setLoading(true);
      setSubmissionInitiated(true);

      await verifyPayment({
        ...formData,
        amount: Number(formData.amount),
        transactionRef,
      });

      toast.success(
        t("paySuccess") || "Payment verification details submitted successfully!",
        { id: toastId }
      );
      
      // Reset form data and return to blank first step
      setTimeout(() => {
        setFormData({
          name: "",
          email: "",
          amount: "",
          examType: "HS",
          passoutYear: "",
        });
        setSubmissionInitiated(false);
        setStep(1);
        navigate("/success", { state: { transactionRef } });
      }, 800);
    } catch (err) {
      console.error(err);
      setSubmissionInitiated(false);
      toast.error(
        err.response?.data?.message ||
          t("verifyFail") ||
          "Payment verification failed",
        {
          id: toastId,
        },
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchUpi = (appKey = "generic") => {
    window.location.href = appDeepLinks[appKey];
  };

  const inputClass =
    "input-monochrome focus:ring-2 focus:ring-black focus:outline-none";
  const selectClass =
    "input-monochrome appearance-none bg-white focus:ring-2 focus:ring-black focus:outline-none";

  if (checkingStatus) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="max-w-md mx-auto bg-white border border-neutral-900 p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center font-mono text-sm animate-pulse"
      >
        {t("checkingServer")}
      </div>
    );
  }

  if (!fundingActive) {
    return (
      <div
        role="alert"
        className="max-w-md mx-auto bg-white border border-neutral-950 p-6 sm:p-8 relative shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-slide-up text-center overflow-hidden"
      >
        <div className="flex justify-center mb-6">
          <div className="border border-black p-4 bg-amber-50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="square"
              strokeLinejoin="miter"
              className="text-black"
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="11" rx="0" ry="0" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>
        <h2 className="text-lg font-black text-black mb-4 tracking-wider uppercase font-mono">
          {t("contributionsClosed")}
        </h2>
        <p className="text-sm text-neutral-500 font-mono leading-relaxed mb-6">
          {t("contributionsClosedDesc")}
        </p>
        <div className="border-t border-neutral-200 pt-4 font-mono text-xs text-neutral-400">
          {t("checkBackLater")}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white border border-neutral-900 p-6 sm:p-8 relative shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-slide-up overflow-hidden">
      {loading && (
        <div
          className="absolute top-0 left-0 w-full h-0.75 bg-neutral-100 overflow-hidden"
          aria-hidden="true"
        >
          <div className="h-full bg-black animate-line-progress absolute w-full"></div>
        </div>
      )}

      {step === 1 ? (
        // Step 1: Form details input
        <form
          onSubmit={handleProceedToPayment}
          className="space-y-4 animate-fade-in"
          noValidate
        >
          <h2
            ref={headerRef}
            tabIndex="-1"
            className="text-lg font-black text-black mb-6 text-center tracking-wider uppercase outline-none"
          >
            {t("makeContribution")}
          </h2>

          <div>
            <label
              className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5"
              htmlFor="name"
            >
              {t("fullName")} *
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClass}
              placeholder="JOHN DOE"
              required
              disabled={loading}
              aria-required="true"
            />
          </div>

          <div>
            <label
              className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5"
              htmlFor="email"
            >
              {t("emailAddress")} *
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
              placeholder="john@example.com"
              required
              disabled={loading}
              aria-required="true"
            />
          </div>

          <div>
            <label
              className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5"
              htmlFor="examType"
            >
              {t("yearPassout")} *
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <select
                  id="examType"
                  name="examType"
                  value={formData.examType}
                  onChange={handleChange}
                  className={selectClass}
                  disabled={loading}
                  aria-required="true"
                >
                  <option value="HS">HS</option>
                  <option value="Madhyamik">Madhyamik</option>
                </select>
              </div>
              <div className="flex-1">
                <select
                  id="passoutYear"
                  name="passoutYear"
                  value={formData.passoutYear}
                  onChange={handleChange}
                  className={selectClass}
                  disabled={loading}
                  aria-label="Passout Year"
                  aria-required="true"
                >
                  <option value="" disabled>
                    {t("year")}
                  </option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label
              className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5"
              htmlFor="amount"
            >
              {t("amountLabel")} *
            </label>
            <div className="relative">
              <span
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-mono font-medium select-none"
                aria-hidden="true"
              >
                ₹
              </span>
              <input
                id="amount"
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="1"
                step="0.01"
                className={`${inputClass} pl-8! font-mono`}
                placeholder="1000.00"
                required
                disabled={loading}
                aria-required="true"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-monochrome w-full flex items-center justify-center gap-2 cursor-pointer focus:ring-2 focus:ring-offset-2 focus:ring-black focus:outline-none"
            >
              {t("proceedPayment") || "Proceed to Payment"}
            </button>
          </div>
        </form>
      ) : (
        // Step 2: Custom payment instructions page
        <form
          onSubmit={handlePaymentSubmit}
          className="space-y-5 animate-fade-in"
        >
          <h2
            ref={headerRef}
            tabIndex="-1"
            className="text-lg font-black text-black mb-4 text-center tracking-wider uppercase outline-none"
          >
            {t("verifySignature") || "Complete Contribution"}
          </h2>

          <div className="border border-neutral-200 p-4 space-y-2 bg-neutral-50 font-mono text-xs text-neutral-600 rounded">
            <div className="flex justify-between">
              <span>CONTRIBUTOR:</span>
              <span className="font-bold text-neutral-900">
                {formData.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span>EMAIL:</span>
              <span className="font-bold text-neutral-900 truncate max-w-50">
                {formData.email}
              </span>
            </div>
            <div className="flex justify-between">
              <span>REF NO:</span>
              <span className="font-bold text-neutral-900">
                {transactionRef}
              </span>
            </div>
            <div className="flex justify-between border-t border-neutral-200 pt-2 text-sm">
              <span className="font-bold text-neutral-900">AMOUNT DUE:</span>
              <span className="font-bold text-black">₹{formattedAmount}</span>
            </div>
          </div>

          {/* Desktop Users view QR code first */}
          {!isMobile && (
            <div className="flex flex-col items-center p-6 bg-neutral-50 border border-neutral-200 rounded">
              <div className="p-3 bg-white border border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <QRCode
                  value={upiString}
                  size={180}
                  level="M"
                  fgColor="#000000"
                  bgColor="#ffffff"
                  title="UPI QR Code for scan payment"
                />
              </div>
              <div className="mt-4 text-center">
                <p className="text-neutral-400 text-xs font-mono uppercase tracking-wider">
                  {t("scanToPay") || "SCAN TO PAY"}
                </p>
                <p className="text-neutral-500 text-xs font-mono mt-1">
                  UPI ID:{" "}
                  <span className="text-neutral-800 font-bold select-all">
                    {upiId}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Mobile Specific Selection List */}
          <div className="text-center font-mono space-y-3">
            {isMobile ? (
              <div className="space-y-4 px-2">
                <p className="text-xs text-neutral-500 font-bold tracking-wider uppercase">
                  Select a UPI App to Pay
                </p>
                
                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleLaunchUpi("gpay")}
                    className="w-full py-3 px-4 border border-neutral-900 font-bold bg-white text-black text-sm hover:bg-neutral-50 cursor-pointer flex items-center justify-between"
                  >
                    <span>Google Pay</span>
                    <span>→</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLaunchUpi("phonepe")}
                    className="w-full py-3 px-4 border border-neutral-900 font-bold bg-white text-black text-sm hover:bg-neutral-50 cursor-pointer flex items-center justify-between"
                  >
                    <span>PhonePe</span>
                    <span>→</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLaunchUpi("paytm")}
                    className="w-full py-3 px-4 border border-neutral-900 font-bold bg-white text-black text-sm hover:bg-neutral-50 cursor-pointer flex items-center justify-between"
                  >
                    <span>Paytm</span>
                    <span>→</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLaunchUpi("generic")}
                    className="w-full py-3 px-4 bg-neutral-900 text-white font-bold text-sm hover:bg-neutral-950 cursor-pointer flex items-center justify-between"
                  >
                    <span>Other UPI App</span>
                    <span>→</span>
                  </button>
                </div>

                <details className="text-left bg-neutral-50 border border-neutral-200 p-2.5 rounded cursor-pointer select-none">
                  <summary className="text-xs font-bold text-neutral-700">
                    Show QR Code for Scanning
                  </summary>
                  <div className="flex flex-col items-center p-4 bg-white border border-neutral-200 mt-2">
                    <QRCode
                      value={upiString}
                      size={140}
                      level="M"
                      fgColor="#000000"
                      bgColor="#ffffff"
                    />
                    <p className="text-[10px] text-neutral-400 mt-2">UPI ID: {upiId}</p>
                  </div>
                </details>

                <p className="text-xs text-neutral-500 leading-relaxed pt-2">
                  {t("upiAppInstruction") ||
                    "Tap any app above to make your payment, then return here to complete verification."}
                </p>
              </div>
            ) : (
              <div className="px-2">
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {t("upiFallbackInstruction") ||
                    "Scan the QR code using any UPI app (Google Pay, PhonePe, Paytm, etc.) to complete payment."}
                </p>
              </div>
            )}

            <div className="border-t border-neutral-200 pt-3">
              <p className="text-[11px] text-neutral-400 italic">
                Important: Please complete the payment in your UPI app and
                return to this page to click "I've Paid".
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={loading}
              className="w-1/3 btn-monochrome-outline py-3.5 focus:ring-2 focus:ring-offset-2 focus:ring-neutral-400 focus:outline-none cursor-pointer"
            >
              {t("back") || "Back"}
            </button>
            <button
              type="submit"
              disabled={loading || submissionInitiated}
              className="w-2/3 btn-monochrome flex items-center justify-center gap-2 focus:ring-2 focus:ring-offset-2 focus:ring-black focus:outline-none cursor-pointer"
            >
              {loading ? (
                <>
                  <span
                    className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"
                    aria-hidden="true"
                  ></span>
                  {t("processingPayment") || "Verifying..."}
                </>
              ) : (
                t("ivePaid") || "I've Paid"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PaymentForm;
