import { AlertCircle } from "lucide-react";

export default function Disclaimer() {
  return (
    <section className="py-8 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <p className="text-[11px] md:text-xs text-slate-500 leading-relaxed text-center">
            <span className="font-extrabold text-slate-900 uppercase tracking-widest mr-2">Disclaimer:</span> 
            HealthPredict is for informational purposes only and is not a medical diagnosis tool. 
            Assessments are based on statistical models and do not replace professional medical advice. 
            Always consult a licensed healthcare professional for official diagnosis and treatment plans.
          </p>
        </div>
      </div>
    </section>
  );
}
