import React from 'react';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => {
    return (
        <div className={`bg-white rounded-xl border border-slate-100 shadow-sm p-6 ${className}`} {...props}>
            {children}
        </div>
    );
};
