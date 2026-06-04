import { createContext, useContext, useState } from "react";

const LanguageContext = createContext();

const translations = {
  en: {
    navbarTitle: "BNGHS GOLDEN JUBILEE",
    navbarSubtitle: "CELEBRATION",
    supportLegacy: "Support Our Legacy",
    heroDesc:
      "Join hands with fellow alumni to empower the next generation. Your contribution helps us build a stronger future.",
    zeroFeeUpi: "Zero-Fee UPI Payments",
    makeContribution: "Make a Contribution",
    fullName: "Full Name",
    emailAddress: "Email Address",
    yearPassout: "Year of Passout",
    examType: "Exam Type",
    year: "Year",
    amountLabel: "Contribution Amount (₹)",
    proceedPayment: "Proceed to Payment",
    processingPayment: "Processing Payment...",
    checkingServer: "Checking server status...",
    contributionsClosed: "Contributions Closed",
    contributionsClosedDesc:
      "The alumni contribution portal is currently closed or paused. We appreciate your support and interest!",
    checkBackLater: "Please check back later or contact administration.",
    thankYou: "Thank You!",
    successDesc:
      "Your contribution has been successfully processed. An email confirmation will be sent to you within 24 hours.",
    returnHome: "Return Home",
    copyright: "BNGHS GOLDEN JUBILEE CELEBRATION. All rights reserved.",
    errorFillAll: "Please fill all fields",
    errorMinAmount: "Amount must be at least ₹1",
    errorExamType: "Please select exam type",
    errorPassoutYear: "Please select year of passout",
    initiateGateway: "Initiating payment secure gateway...",
    verifySignature: "Verifying transaction signature...",
    paySuccess: "Payment successful! Thank you.",
    gatewayFail: "Failed to initiate payment gateway",
    verifyFail: "Payment verification failed",
    payBtn: "Pay",
    ivePaid: "I've Paid",
    openingUpiApp: "Opening UPI App...",
    upiAppInstruction: "Please complete the payment in your UPI app and return here.",
    upiFallbackInstruction: "If your UPI app didn't open automatically, you can scan the QR code below using any UPI app to pay.",

    // Simulator strings
    simulatorTitle: "Secure Payment Gateway",
    simulatorSubtitle: "Test Mode — Simulation Only",
    cardTab: "Card",
    upiTab: "UPI",
    netbankingTab: "Netbanking",
    cardNumber: "Card Number",
    cardExpiry: "Expiry (MM/YY)",
    cardCvv: "CVV",
    upiIdLabel: "UPI ID (e.g. user@okaxis)",
    simulateSuccess: "Simulate Success",
    simulateFailure: "Simulate Failure",
    cancelBtn: "Cancel",
  },
  bn: {
    navbarTitle: "BNGHS GOLDEN JUBILEE",
    navbarSubtitle: "CELEBRATION",
    supportLegacy: "আমাদের ঐতিহ্যকে সমর্থন করুন",
    heroDesc:
      "পরবর্তী প্রজন্মকে ক্ষমতায়ন করতে সহকর্মী প্রাক্তন শিক্ষার্থীদের সাথে হাত মেলান। আপনার অবদান আমাদের একটি শক্তিশালী ভবিষ্যত গড়ে তুলতে সাহায্য করে।",
    zeroFeeUpi: "বিনামূল্যে ইউপিআই পেমেন্ট",
    makeContribution: "অনুদানের ফর্ম",
    fullName: "পুরো নাম",
    emailAddress: "ইমেল ঠিকানা",
    yearPassout: "উত্তীর্ণ হওয়ার বছর",
    examType: "পরীক্ষার ধরন",
    year: "বছর",
    amountLabel: "অনুদানের পরিমাণ (₹)",
    proceedPayment: "পেমেন্ট করতে এগিয়ে যান",
    processingPayment: "পেমেন্ট প্রক্রিয়াধীন...",
    checkingServer: "সার্ভার স্ট্যাটাস পরীক্ষা করা হচ্ছে...",
    contributionsClosed: "অনুদান বন্ধ",
    contributionsClosedDesc:
      "প্রাক্তন ছাত্রদের অবদান পোর্টাল বর্তমানে বন্ধ বা স্থগিত রয়েছে। আমরা আপনার সমর্থন এবং আগ্রহের প্রশংসা করি!",
    checkBackLater:
      "অনুগ্রহ করে পরে আবার পরীক্ষা করুন বা প্রশাসনের সাথে যোগাযোগ করুন।",
    thankYou: "ধন্যবাদ!",
    successDesc:
      "আপনার অবদান সফলভাবে সম্পন্ন হয়েছে। ২৪ ঘণ্টার মধ্যে একটি ইমেল নিশ্চিতকরণ আপনার কাছে পাঠানো হবে।",
    returnHome: "হোম পেজে ফিরে যান",
    copyright: "বিএনজিএইচএস সুবর্ণ জয়ন্তী উদযাপন। সর্বস্বত্ব সংরক্ষিত।",
    errorFillAll: "অনুগ্রহ করে সব ঘর পূরণ করুন",
    errorMinAmount: "অনুদানের পরিমাণ কমপক্ষে ₹১ হতে হবে",
    errorExamType: "অনুগ্রহ করে পরীক্ষার ধরন নির্বাচন করুন",
    errorPassoutYear: "অনুগ্রহ করে উত্তীর্ণ হওয়ার বছর নির্বাচন করুন",
    initiateGateway: "নিরাপদ পেমেন্ট গেটওয়ে শুরু হচ্ছে...",
    verifySignature: "লেনদেনের স্বাক্ষর যাচাই করা হচ্ছে...",
    paySuccess: "পেমেন্ট সফল হয়েছে! ধন্যবাদ।",
    gatewayFail: "পেমেন্ট গেটওয়ে শুরু করতে ব্যর্থ হয়েছে",
    verifyFail: "পেমেন্ট যাচাইকরণ ব্যর্থ হয়েছে",
    payBtn: "পেমেন্ট করুন",
    ivePaid: "আমি পেমেন্ট করেছি",
    openingUpiApp: "ইউপিআই অ্যাপ খোলা হচ্ছে...",
    upiAppInstruction: "অনুগ্রহ করে আপনার ইউপিআই অ্যাপে পেমেন্ট সম্পন্ন করে এখানে ফিরে আসুন।",
    upiFallbackInstruction: "যদি আপনার ইউপিআই অ্যাপটি স্বয়ংক্রিয়ভাবে না খোলে, তবে পেমেন্ট করতে যেকোনো ইউপিআই অ্যাপ ব্যবহার করে নিচের কিউআর কোডটি স্ক্যান করতে পারেন।",

    // Simulator strings
    simulatorTitle: "নিরাপদ পেমেন্ট গেটওয়ে",
    simulatorSubtitle: "টেস্ট মোড — শুধুমাত্র সিমুলেশন",
    cardTab: "কার্ড",
    upiTab: "ইউপিআই",
    netbankingTab: "নেটব্যাঙ্কিং",
    cardNumber: "কার্ড নম্বর",
    cardExpiry: "মেয়াদ (MM/YY)",
    cardCvv: "সিভিভি",
    upiIdLabel: "ইউপিআই আইডি (যেমন: user@okaxis)",
    simulateSuccess: "সফল পেমেন্ট সিমুলেশন",
    simulateFailure: "ব্যর্থ পেমেন্ট সিমুলেশন",
    cancelBtn: "বাতিল",
  },
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("alumniLanguage") || "en";
  });

  const toggleLanguage = () => {
    const nextLang = lang === "en" ? "bn" : "en";
    setLang(nextLang);
    localStorage.setItem("alumniLanguage", nextLang);
  };

  const t = (key) => {
    return translations[lang][key] || translations["en"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
