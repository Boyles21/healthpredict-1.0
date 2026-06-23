import React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  className?: string;
  checked?: boolean;
}

export default function Checkbox({ label, description, className = "", ...props }: CheckboxProps) {
  return (
    <label className={`flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:border-teal-500/40 hover:bg-slate-50/30 transition-all duration-300 hover:shadow-sm group ${className}`}>
      <input 
        type="checkbox" 
        className="w-4 h-4 mt-1 rounded border-slate-300 text-teal-600 focus:ring-teal-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500 cursor-pointer shrink-0"
        {...props}
      />
      <div className="flex flex-col">
        <span className="text-sm font-bold text-slate-800 group-hover:text-slate-900 transition-colors">
          {label}
        </span>
        {description && (
          <span className="text-xs text-slate-500 font-medium italic mt-1 leading-normal">
            {description}
          </span>
        )}
      </div>
    </label>
  );
}
