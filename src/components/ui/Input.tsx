import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  error?: string;
  className?: string;
  type?: string;
}

export default function Input({ label, description, error, className = "", ...props }: InputProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-bold text-slate-900 uppercase tracking-widest px-1">
        {label}
      </label>
      <input 
        className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm transition-all outline-none focus:ring-2 focus:ring-medical-primary/10 ${
          error ? "border-red-500" : "border-slate-200 focus:border-medical-primary"
        }`}
        {...props}
      />
      {description && !error && <p className="text-[10px] text-slate-400 px-1 italic font-medium">{description}</p>}
      {error && <span className="text-[10px] font-bold text-red-500 px-1">{error}</span>}
    </div>
  );
}
