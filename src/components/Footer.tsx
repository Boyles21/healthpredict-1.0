import { Activity, Mail, MapPin, ExternalLink, CalendarDays } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Main Grid Links */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* Brand Col */}
          <div className="col-span-1 md:col-span-5 text-left">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 bg-teal-505 bg-teal-600 rounded-xl flex items-center justify-center text-white">
                <Activity className="w-5.5 h-5.5 stroke-[2.5]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Health<span className="text-teal-400">Predict</span>
              </span>
            </div>
            
            <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
              Advancing gynaecological and systemic health equity through accessible, data-sovereign machine learning models. Built to empower patients with screening foresight.
            </p>

            <div className="space-y-2.5 text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-teal-400" />
                <a href="mailto:support@healthpredict.org" className="hover:text-white transition-colors">support@healthpredict.org</a>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-teal-400" />
                <span>Academic Research Facility, GBR</span>
              </div>
            </div>
          </div>
          
          {/* Links Col 1 */}
          <div className="col-span-1 md:col-span-2.5 col-start-7 text-left">
            <h4 className="font-bold text-white mb-6 uppercase text-[10px] tracking-widest text-[#94a3b8]">Product</h4>
            <ul className="space-y-3.5 text-xs font-medium">
              <li><a href="#hero" className="hover:text-white transition-colors">Risk Assessment</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Machine Learning Model</a></li>
              <li><a href="#results-preview" className="hover:text-white transition-colors">Sample Report</a></li>
            </ul>
          </div>
          
          {/* Links Col 2 */}
          <div className="col-span-1 md:col-span-2.5 text-left">
            <h4 className="font-bold text-white mb-6 uppercase text-[10px] tracking-widest text-[#94a3b8]">Company</h4>
            <ul className="space-y-3.5 text-xs font-medium">
              <li><a href="#conditions" className="hover:text-white transition-colors">Conditions Covered</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">Workflow & Science</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Frequently Asked</a></li>
            </ul>
          </div>
        </div>
        
        {/* Academic/Medical Disclaimer Block */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 mb-12 text-left">
          <div className="flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
              ⚠
            </div>
            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-1.5">Important Medical Disclaimer</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                HealthPredict is an educational and research-grade predictive testing app, designed purely to assist in early-stage risk classification. The algorithm calculates probability metrics based on statistically correlated physiological symptom flags. It is **not** a diagnostic instrument, does not perform medical diagnosis, and must not serve as a replacement for expert medical diagnostic services, transvaginal ultrasounds, clinical biopsy, or doctor consultations. Always seek the advice of a qualified healthcare professional with any questions you may have regarding a gynecological or metabolic condition.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} HealthPredict Project. Closed Research Release (v1.2.0).</span>
          
          <div className="flex flex-wrap justify-center gap-6 font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Medical Reviews</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
