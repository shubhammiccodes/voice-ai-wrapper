import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    wrapperClassName?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', wrapperClassName = 'mb-4', ...props }) => {
    return (
        <div className={wrapperClassName}>
            {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
            <input
                className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm shadow-sm placeholder-slate-400
                focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all duration-200
                disabled:bg-slate-50 disabled:text-slate-500
                ${error ? 'border-red-300 focus:border-red-300 focus:ring-red-100' : ''} ${className}`}
                {...props}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};
