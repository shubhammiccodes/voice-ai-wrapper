import React from 'react';

interface HeaderProps {
    title?: string;
    description?: string;
    children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
    title = "Projects",
    description = "Manage your organization's projects and tasks.",
    children
}) => {
    return (
        <header className="bg-gradient-to-r from-white via-slate-50 to-white backdrop-blur-xl border-b border-slate-200/60 mb-8 w-full sticky top-0 z-20 shadow-sm/50">
            <div className="w-full px-4 md:px-8 py-4">
                <div className="flex items-center gap-4">
                    {children && <div className="shrink-0">{children}</div>}
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
                        <p className="text-sm text-slate-500">{description}</p>
                    </div>
                </div>
            </div>
        </header>
    );
};
