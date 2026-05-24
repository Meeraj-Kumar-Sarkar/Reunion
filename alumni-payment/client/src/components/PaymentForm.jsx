import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { QRCode } from "react-qr-code";
import { verifyPayment, getFundingStatus } from "../services/api";

const PaymentForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    amount: "",
    examType: "HS", // New field: HS / Madhyamik
    passoutYear: "", // New field: selected year
  });
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [fundingActive, setFundingActive] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const data = await getFundingStatus();
        setFundingActive(data.fundingActive);
      } catch (err) {
        console.error("Failed to check funding status", err);
      } finally {
        setCheckingStatus(false);
      }
    };
    checkStatus();
  }, []);

  const upiId = import.meta.env.VITE_UPI_ID || "your-upi-id@bank";
  const upiString = `upi://pay?pa=${upiId}&pn=AlumniFund&am=${formData.amount}&cu=INR`;

  // Generate year options (2000 to current year)
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = 1977; year <= currentYear; year++) {
    years.push(year);
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerateQR = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.amount) {
      return toast.error("Please fill all fields");
    }
    if (formData.amount < 1) {
      return toast.error("Amount must be at least ₹1");
    }
    if (!formData.examType) {
      return toast.error("Please select exam type");
    }
    if (!formData.passoutYear) {
      return toast.error("Please select year of passout");
    }
    setShowQR(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      toast.loading("Verifying payment...", { id: "verify" });
      // Send all formData including examType and passoutYear
      await verifyPayment({ ...formData });
      toast.success("Payment successful!", { id: "verify" });
      navigate("/success");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Payment verification failed", { id: "verify" });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "input-monochrome";
  const selectClass = "input-monochrome appearance-none bg-white"; // matching style

  if (checkingStatus) {
    return (
      <div className="max-w-md mx-auto bg-white border border-neutral-900 p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center font-mono text-sm animate-pulse">
        Checking server status...
      </div>
    );
  }

  if (!fundingActive) {
    return (
      <div className="max-w-md mx-auto bg-white border border-neutral-950 p-6 sm:p-8 relative shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-slide-up text-center overflow-hidden">
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
            >
              <rect x="3" y="11" width="18" height="11" rx="0" ry="0" border="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>
        <h2 className="text-lg font-black text-black mb-4 tracking-wider uppercase font-mono">
          Contributions Closed
        </h2>
        <p className="text-sm text-neutral-500 font-mono leading-relaxed mb-6">
          The alumni contribution portal is currently closed or paused. We appreciate your support and interest!
        </p>
        <div className="border-t border-neutral-200 pt-4 font-mono text-xs text-neutral-400">
          Please check back later or contact administration.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white border border-neutral-900 p-6 sm:p-8 relative shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-slide-up overflow-hidden">
      {/* Sleek top loader when verifying */}
      {loading && (
        <div className="absolute top-0 left-0 w-full h-0.75 bg-neutral-100 overflow-hidden">
          <div className="h-full bg-black animate-line-progress absolute"></div>
        </div>
      )}

      <h2 className="text-lg font-black text-black mb-6 text-center tracking-wider uppercase">
        Make a Contribution
      </h2>

      {!showQR ? (
        <form onSubmit={handleGenerateQR} className="space-y-4 animate-fade-in">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClass}
              placeholder="JOHN DOE"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
              placeholder="john@example.com"
              required
            />
          </div>

          {/* Year of Passout - Two Dropdowns */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
              Year of Passout
            </label>
            <div className="flex gap-3">
              {/* Exam Type Dropdown */}
              <div className="flex-1">
                <select
                  name="examType"
                  value={formData.examType}
                  onChange={handleChange}
                  className={selectClass}
                >
                  <option value="HS">HS</option>
                  <option value="Madhyamik">Madhyamik</option>
                </select>
              </div>
              {/* Year Dropdown */}
              <div className="flex-1">
                <select
                  name="passoutYear"
                  value={formData.passoutYear}
                  onChange={handleChange}
                  className={selectClass}
                >
                  <option value="" disabled>
                    Year
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
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
              Contribution Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-mono font-medium select-none">
                ₹
              </span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="1"
                className={`${inputClass} pl-8! font-mono`}
                placeholder="1000"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="btn-monochrome w-full flex items-center justify-center gap-2"
            >
              Generate QR Code
            </button>
          </div>
        </form>
      ) : (
        <form
          onSubmit={handlePaymentSubmit}
          className="space-y-5 animate-fade-in"
        >
          <div className="flex flex-col items-center p-6 bg-neutral-50 border border-neutral-200">
            <div className="p-3 bg-white border border-neutral-900">
              <QRCode
                value={upiString}
                size={180}
                level="M"
                fgColor="#000000"
                bgColor="#ffffff"
              />
            </div>
            <div className="mt-4 text-center">
              <p className="text-neutral-400 text-xs font-mono uppercase tracking-wider">
                Scan to pay
              </p>
              <p className="text-black font-mono font-bold text-2xl mt-1">
                ₹{formData.amount}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowQR(false)}
              className="w-1/3 btn-monochrome-outline py-3.5"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 btn-monochrome flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                "Ask for Verifing Payment"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PaymentForm;
