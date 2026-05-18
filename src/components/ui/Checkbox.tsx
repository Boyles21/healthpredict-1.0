import React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  className?: string;
  checked?: boolean;
}

export default function Checkbox({ label, description, className = "", ...props }: CheckboxProps) {
  return (
    <label className={`flex items-start gap-3 p-4 bg-white border border-slate-100 rounded-2xl cursor-pointer hover:border-medical-primary/30 transition-all hover:shadow-sm group ${className}`}>
      <input 
        type="checkbox" 
        className="w-4 h-4 mt-1 rounded border-slate-300 text-medical-primary focus:ring-medical-primary cursor-pointer shrink-0"
        {...props}
      />
      <div className="flex flex-col">
        <span className="text-sm font-bold text-slate-800 group-hover:text-slate-900 transition-colors">
          {label}
        </span>
        {description && (
          <span className="text-[10px] text-slate-400 font-medium italic mt-0.5 leading-tight">
            {description}
          </span>
        )}
      </div>
    </label>
  );
}
