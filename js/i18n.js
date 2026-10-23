/**
 * NuraMed - Localization & Language Engine (G-4)
 * English, Hindi (हिन्दी), and Rajasthani (राजस्थानी Roadmap note)
 */

const I18N_DATA = {
  en: {
    emergencyBanner: "In an emergency call 108 / 112 immediately",
    emergencyDial: "Call 108",
    pitch: "Reach your doctor without the journey — by app, chat, or toll-free phone call",
    rolePatient: "Patient (Ramesh, 62)",
    roleDoctor: "Doctor (Dr. Meera)",
    roleAsha: "ASHA Worker (Sunita)",
    rolePharmacy: "Pharmacy (Jan Aushadhi)",
    roleAdmin: "Admin Dashboard",
    navHome: "Home",
    navRxReview: "Rx Review",
    navDocAvail: "Doctors",
    navConnect: "Consult",
    navIVR: "IVR Phone",
    navAI: "Setu AI",
    navPharmacy: "Pharmacy",
    navAdmin: "Admin",
    navAudit: "Audit Log",
    portal1Title: "Prescription & Dosage Review",
    portal1Subtitle: "Request dosage or medicine reviews remotely. Doctors make all decisions.",
    submitReviewBtn: "Submit Review Request",
    currentMedicineLabel: "Current Prescribed Medicine",
    currentDosageLabel: "Current Dosage & Schedule",
    reasonLabel: "Reason for Review",
    sideEffectsLabel: "Check Experienced Side-Effects (Red-flags alert doctors)",
    consentLabel: "I confirm my consent to share symptoms and prescription details for clinical review.",
    doctorQueueTitle: "Doctor Clinical Review Queue",
    approveBtn: "Approve Current Dose",
    modifyBtn: "Modify Dosage",
    rejectBtn: "Reject with Reason",
    availabilityTitle: "Doctor Availability & Primary Health Centres",
    doctorOnline: "Online Now",
    doctorBusy: "Busy (In Consult)",
    doctorOffline: "Offline",
    ivrTitle: "Toll-Free Phone IVR Simulator (1800-NURAMED)",
    ivrSubtitle: "Dial 1800-687-2633 for non-smartphone users. Powered by voice menu logic.",
    ivrKey1: "1 = Talk to Doctor",
    ivrKey2: "2 = Request Prescription Review",
    ivrKey3: "3 = Check Doctor Availability",
    ivrKey0: "0 = Request Human Callback",
    aiAssistantTitle: "Setu Sahayak — Safe Health Assistant",
    aiDisclaimer: "This is general information, not medical advice. No diagnosis or dosing.",
    aiPlaceholder: "Ask about minor symptoms (fever, cold, cuts, dehydration)...",
    testRunnerBtn: "Run PRD Test Suite (All 12 Cases)"
  },
  hi: {
    emergencyBanner: "आपातकालीन स्थिति में तुरंत 108 / 112 पर कॉल करें",
    emergencyDial: "108 पर कॉल करें",
    pitch: "बिना यात्रा किए डॉक्टर तक पहुँचें — ऐप, चैट या टोल-फ्री फ़ोन कॉल द्वारा",
    rolePatient: "मरीज़ (रमेश, 62 वर्ष)",
    roleDoctor: "डॉक्टर (डॉ. मीरा)",
    roleAsha: "आशा कार्यकर्ता (सुनीता)",
    rolePharmacy: "फार्मेसी (जन औषधि केंद्र)",
    roleAdmin: "प्रशासन डैशबोर्ड",
    navHome: "होम",
    navRxReview: "दवा समीक्षा",
    navDocAvail: "डॉक्टर",
    navConnect: "परामर्श",
    navIVR: "आईवीआर फ़ोन",
    navAI: "सेतु एआई",
    navPharmacy: "फार्मेसी",
    navAdmin: "एडमिन",
    navAudit: "ऑडिट लॉग",
    portal1Title: "दवा और खुराक समीक्षा अनुरोध",
    portal1Subtitle: "घर बैठे डॉक्टर से खुराक की समीक्षा करवाएँ। सभी निर्णय केवल डॉक्टर लेते हैं।",
    submitReviewBtn: "समीक्षा अनुरोध दर्ज करें",
    currentMedicineLabel: "वर्तमान में ली जा रही दवा",
    currentDosageLabel: "वर्तमान खुराक एवं समय",
    reasonLabel: "समीक्षा का कारण",
    sideEffectsLabel: "अनुभव हो रहे दुष्प्रभाव चुनें (गंभीर लक्षण डॉक्टर को तुरंत सतर्क करते हैं)",
    consentLabel: "मैं क्लिनिकल समीक्षा हेतु अपने लक्षण एवं दवा विवरण साझा करने की सहमति देता/देती हूँ।",
    doctorQueueTitle: "डॉक्टर क्लिनिकल समीक्षा कतार",
    approveBtn: "खुराक स्वीकृत करें",
    modifyBtn: "खुराक बदलें (Modify)",
    rejectBtn: "कारण सहित अस्वीकृत करें",
    availabilityTitle: "डॉक्टर उपलब्धता एवं प्राथमिक स्वास्थ्य केंद्र (PHC)",
    doctorOnline: "उपलब्ध (Online)",
    doctorBusy: "व्यस्त (परामर्श में)",
    doctorOffline: "ऑफलाइन",
    ivrTitle: "टोल-फ्री फोन आईवीआर सिम्युलेटर (1800-NURAMED)",
    ivrSubtitle: "बिना स्मार्टफोन वाले मरीज़ों के लिए 1800-687-2633 डायल करें।",
    ivrKey1: "1 = डॉक्टर से बात करें",
    ivrKey2: "2 = दवा समीक्षा का अनुरोध करें",
    ivrKey3: "3 = डॉक्टर की उपलब्धता जानें",
    ivrKey0: "0 = कॉलबैक का अनुरोध करें",
    aiAssistantTitle: "सेतु सहायक — सुरक्षित स्वास्थ्य सहायक",
    aiDisclaimer: "यह सामान्य जानकारी है, डॉक्टरी सलाह नहीं। कोई दवा या निदान नहीं दिया जाता।",
    aiPlaceholder: "हल्के लक्षणों (बुखार, जुकाम, मामूली चोट, निर्जलीकरण) के बारे में पूछें...",
    testRunnerBtn: "पीआरडी टेस्ट चलाएँ (सभी 12 टेस्ट)"
  }
};

class I18nManager {
  constructor() {
    this.currentLang = localStorage.getItem('nuramed_lang') || 'en';
  }

  setLanguage(lang) {
    if (!I18N_DATA[lang]) return;
    this.currentLang = lang;
    localStorage.setItem('nuramed_lang', lang);
    this.apply();
  }

  t(key) {
    const langDict = I18N_DATA[this.currentLang] || I18N_DATA.en;
    return langDict[key] || I18N_DATA.en[key] || key;
  }

  apply() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = this.t(key);
      if (text) {
        if (el.tagName === 'INPUT' && el.getAttribute('placeholder')) {
          el.setAttribute('placeholder', text);
        } else {
          el.textContent = text;
        }
      }
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
    });
  }
}

window.i18n = new I18nManager();
