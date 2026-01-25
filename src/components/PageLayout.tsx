import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface PageLayoutProps {
    title: string;
    children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ title, children }) => (
    <div className="min-h-screen bg-kala-bg dark:bg-kala-darkBg transition-colors">
        {/* Header */}
        <nav className="fixed top-0 w-full z-50 bg-white/90 dark:bg-kala-darkBg/90 backdrop-blur-xl border-b border-kala-border dark:border-kala-darkDivider px-10 py-4">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
                <a href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-kala-text dark:bg-kala-darkText rounded-xl flex items-center justify-center">
                        <span className="text-kala-bg dark:text-kala-darkBg font-black text-sm">K</span>
                    </div>
                    <span className="text-lg font-black uppercase text-kala-text dark:text-kala-darkText">Kala</span>
                </a>
                <a href="/" className="flex items-center gap-2 text-sm text-kala-textSecondary hover:text-kala-text dark:hover:text-kala-darkText transition-colors">
                    <ArrowLeft size={16} />
                    Back
                </a>
            </div>
        </nav>

        {/* Content */}
        <main className="pt-32 pb-20 px-10">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-black text-kala-text dark:text-kala-darkText mb-10">{title}</h1>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                    {children}
                </div>
            </div>
        </main>

        {/* Footer */}
        <footer className="py-8 px-10 border-t border-kala-border dark:border-kala-darkDivider">
            <div className="max-w-4xl mx-auto flex justify-between items-center text-sm text-kala-textSecondary">
                <span>© 2024 Kala</span>
                <div className="flex gap-6">
                    <a href="/about" className="hover:text-kala-text dark:hover:text-kala-darkText transition-colors">About</a>
                    <a href="/privacy" className="hover:text-kala-text dark:hover:text-kala-darkText transition-colors">Privacy</a>
                    <a href="/terms" className="hover:text-kala-text dark:hover:text-kala-darkText transition-colors">Terms</a>
                </div>
            </div>
        </footer>



    </div>
);

export default PageLayout;
