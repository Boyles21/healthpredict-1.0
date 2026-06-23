import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

interface FaqItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FaqItem({ question, answer, isOpen, onToggle }: FaqItemProps) {
  return (
    <div className="border-b border-slate-200 py-5 text-left">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 font-bold text-slate-900 group text-sm sm:text-base py-2.5 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-teal-500/50 focus-visible:ring-offset-2 outline-none rounded-xl px-2.5"
      >
        <span className="group-hover:text-teal-700 transition-colors flex items-center gap-2.5">
          <HelpCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
          {question}
        </span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-slate-500 group-hover:text-slate-700 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-500 group-hover:text-slate-700 flex-shrink-0" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="text-sm text-slate-650 leading-relaxed pt-3 pb-4 pl-8 pr-6">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Is this a medical diagnosis?",
      answer: "No. HealthPredict is an automated screening tool powered by calibrated random forest classification, designed to calculate potential likelihood based on physiological patterns. It does not replace standard clinical testing, hormone panels, or transvaginal ultrasounds. Only a licensed Gynaecologist or Physician can provide a formal diagnostic assessment."
    },
    {
      question: "How accurate is the system?",
      answer: "Our models are trained on real, clinically-sourced patient record distributions. The current calibration maintains an overall test accuracy of 90.83%, with a high precision of 96.30% (optimized to minimize anxiety-producing false positives) and a classification recall rate of 74.29%."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. Security and sovereignty over personal health data is our paramount focus. All assessment results are processed securely, standard protocols protect your account credentials, and encrypted database guidelines are strictly enforced. We never share or sell detailed symptom reports with health insurers or third-party advertisers."
    },
    {
      question: "What conditions are assessed?",
      answer: "We assess indicators pointing towards two primary gynecological conditions: Polycystic Ovary Syndrome (PCOS)—associated with metabolic syndrome, ovulation delays, and extra androgen levels; and Uterine Fibroids—benign muscular growths in uterine walls causing bleeding fluctuations, severe fatigue, and pelvis discomfort."
    }
  ];

  return (
    <section id="faq" className="py-24 bg-white border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-widest bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-200">
            Common Inquiries
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-6 tracking-tight leading-tight">
            Frequently Asked Questions.
          </h2>
          <p className="text-slate-650 mt-4 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Find immediate answers on the mathematical validation, clinical criteria, data sovereignty, and screening limitations of our ML model solutions.
          </p>
        </div>

        {/* FAQ list */}
        <div className="bg-slate-50/50 border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm">
          {faqs.map((faq, index) => (
            <FaqItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
