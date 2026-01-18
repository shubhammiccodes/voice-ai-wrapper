import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', ...props }) => {
    const baseStyle = "px-4 py-2 rounded-md font-medium text-sm focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
        primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm hover:shadow",
        secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm",
        danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
    };

    return (
        <button
            className={`${baseStyle} ${variants[variant]} ${className}`}
            {...props}
        />
    );
};
