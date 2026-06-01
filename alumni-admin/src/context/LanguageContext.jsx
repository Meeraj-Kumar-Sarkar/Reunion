import { createContext, useContext, useState } from "react";

const LanguageContext = createContext();

const translations = {
  en: {
    adminPortal: "Admin Portal",
    authenticateDesc: "Authenticate to access the dashboard",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter admin password",
    authenticateBtn: "Authenticate",
    authenticating: "Authenticating...",
    restrictedAccess: "Alumni Fund — Restricted Admin Access",
    authSuccess: "Authenticated successfully",
    errorPasswordRequired: "Password is required",
    errorAuthFailed: "Authentication failed",
    fundingPortal: "Funding Portal",
    active: "Active",
    closed: "Closed",
    addContribution: "Add Contribution",
    logout: "Logout",
    portalClosedBanner: "Funding portal is currently closed.",
    portalClosedDesc: "New contributions are blocked. Toggle the switch in the header to reopen.",
    totalContributors: "Total Contributors",
    totalAmount: "Total Amount",
    pendingVerifications: "Pending Verifications",
    verifiedContributions: "Verified Contributions",
    searchPlaceholder: "Filter by name or email...",
    allStatuses: "All Statuses",
    pending: "Pending",
    verified: "Verified",
    refresh: "Refresh",
    colName: "Name",
    colEmail: "Email",
    colAmount: "Amount",
    colExam: "Exam",
    colYear: "Year",
    colStatus: "Status",
    colDate: "Date",
    colActions: "Actions",
    btnVerify: "Verify",
    btnVerifying: "Verifying...",
    btnEdit: "Edit",
    btnDelete: "Delete",
    titleAddContributor: "Add Contributor",
    titleEditContributor: "Edit Contributor",
    titleDeleteConfirm: "Are you absolutely sure?",
    deleteConfirmDesc: "This action cannot be undone. This will permanently delete the contribution record from the servers.",
    btnCancel: "Cancel",
    btnContinue: "Continue",
    btnSaving: "Saving...",
    btnSaveContributor: "Save Contributor",
    btnSaveChanges: "Save Changes",
    btnDeleting: "Deleting...",
    showingLabel: "Showing",
    ofLabel: "of",
    entriesLabel: "entries",
    noResults: "No results found.",
  },
  bn: {
    adminPortal: "অ্যাডমিন পোর্টাল",
    authenticateDesc: "ড্যাশবোর্ড অ্যাক্সেস করতে পাসওয়ার্ড দিন",
    passwordLabel: "পাসওয়ার্ড",
    passwordPlaceholder: "অ্যাডমিন পাসওয়ার্ড লিখুন",
    authenticateBtn: "প্রবেশ করুন",
    authenticating: "যাচাই করা হচ্ছে...",
    restrictedAccess: "প্রাক্তন ছাত্র তহবিল — সীমাবদ্ধ অ্যাডমিন অ্যাক্সেস",
    authSuccess: "সফলভাবে লগইন করা হয়েছে",
    errorPasswordRequired: "পাসওয়ার্ড দেওয়া প্রয়োজন",
    errorAuthFailed: "প্রবেশাধিকার ব্যর্থ হয়েছে",
    fundingPortal: "তহবিল পোর্টাল",
    active: "সক্রিয়",
    closed: "বন্ধ",
    addContribution: "অনুদান যোগ করুন",
    logout: "লগআউট",
    portalClosedBanner: "তহবিল পোর্টালটি বর্তমানে বন্ধ আছে।",
    portalClosedDesc: "নতুন অবদান নেওয়া বন্ধ আছে। পুনরায় চালু করতে হেডার থেকে টগল করুন।",
    totalContributors: "মোট অবদানকারী",
    totalAmount: "মোট পরিমাণ",
    pendingVerifications: "অপেক্ষমান যাচাইকরণ",
    verifiedContributions: "যাচাইকৃত অনুদান",
    searchPlaceholder: "নাম বা ইমেল দ্বারা খুঁজুন...",
    allStatuses: "সব স্ট্যাটাস",
    pending: "পেন্ডিং",
    verified: "যাচাইকৃত",
    refresh: "রিফ্রেশ করুন",
    colName: "নাম",
    colEmail: "ইমেল",
    colAmount: "পরিমাণ",
    colExam: "পরীক্ষা",
    colYear: "বছর",
    colStatus: "স্ট্যাটাস",
    colDate: "তারিখ",
    colActions: "অ্যাকশন",
    btnVerify: "যাচাই করুন",
    btnVerifying: "যাচাই হচ্ছে...",
    btnEdit: "সম্পাদনা",
    btnDelete: "মুছুন",
    titleAddContributor: "অবদানকারী যোগ করুন",
    titleEditContributor: "অবদানকারী সংশোধন করুন",
    titleDeleteConfirm: "আপনি কি নিশ্চিত?",
    deleteConfirmDesc: "এই কাজটি আর ফেরত নেওয়া যাবে না। এটি স্থায়ীভাবে ডাটাবেস থেকে অবদানকারীর রেকর্ড মুছে ফেলবে।",
    btnCancel: "বাতিল",
    btnContinue: "চালিয়ে যান",
    btnSaving: "সংরক্ষণ হচ্ছে...",
    btnSaveContributor: "সংরক্ষণ করুন",
    btnSaveChanges: "পরিবর্তন সংরক্ষণ করুন",
    btnDeleting: "মুছে ফেলা হচ্ছে...",
    showingLabel: "মোট",
    ofLabel: "এর মধ্যে",
    entriesLabel: "টি দেখানো হচ্ছে",
    noResults: "কোন ফলাফল পাওয়া যায়নি।",
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("adminLanguage") || "en";
  });

  const toggleLanguage = () => {
    const nextLang = lang === "en" ? "bn" : "en";
    setLang(nextLang);
    localStorage.setItem("adminLanguage", nextLang);
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
