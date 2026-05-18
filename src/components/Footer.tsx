import { Activity, Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-100 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-medical-primary rounded-lg flex items-center justify-center text-white">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                HealthPredict
              </span>
            </div>
            <p className="text-sm text-slate-500 max-w-xs mb-6 leading-relaxed">
              Advancing women's health through precision AI and accessible technology.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase text-[10px] tracking-widest">Platform</h4>
            <ul className="space-y-3 text-xs text-slate-500 font-medium">
              <li><a href="#" className="hover:text-medical-primary transition-colors">AI Accuracy Model</a></li>
              <li><a href="#" className="hover:text-medical-primary transition-colors">Clinical Validation</a></li>
              <li><a href="#" className="hover:text-medical-primary transition-colors">Security Standards</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase text-[10px] tracking-widest">Company</h4>
            <ul className="space-y-3 text-xs text-slate-500 font-medium">
              <li><a href="#" className="hover:text-medical-primary transition-colors">About</a></li>
              <li><a href="#" className="hover:text-medical-primary transition-colors">Research</a></li>
              <li><a href="#" className="hover:text-medical-primary transition-colors">Press Kit</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-200/60">
          <span>© {new Date().getFullYear()} HealthPredict AI Systems</span>
          <div className="flex flex-wrap justify-center gap-8">
            <a href="#" className="hover:text-medical-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-medical-primary transition-colors">Contact Support</a>
            <a href="#" className="hover:text-medical-primary transition-colors">Medical Review Board</a>
            <a href="#" className="hover:text-medical-primary transition-colors">Careers</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
