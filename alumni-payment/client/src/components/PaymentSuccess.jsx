import { useLocation, Link } from "react-router-dom";

const PaymentSuccess = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white border border-neutral-900 p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center animate-slide-up">
        {/* Success Icon */}
        <div className="w-12 h-12 mx-auto bg-black flex items-center justify-center mb-6">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="3"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h2 className="text-lg font-black text-black mb-3 tracking-wider uppercase">
          Thank You!
        </h2>
        <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
          Your contribution has been successfully processed. An email
          confirmation will be sent to you within 24 hours.
        </p>

        <Link to="/" className="btn-monochrome block w-full text-center">
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
