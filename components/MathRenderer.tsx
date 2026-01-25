/**
 * MathRenderer Component
 * 
 * A robust component that renders both inline and block math using KaTeX.
 * Supports $...$ for inline and $$...$$ for block math.
 */

import React, { useEffect, useRef } from 'react';

interface MathRendererProps {
    content: string;
    className?: string;
}

declare global {
    interface Window {
        katex: any;
    }
}

const MathRenderer: React.FC<MathRendererProps> = ({ content, className = "" }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!window.katex || !containerRef.current) return;

        // Reset container
        containerRef.current.innerHTML = '';

        // Regex to find math segments
        // Block: $$...$$
        // Inline: $...$
        const mathRegex = /(\$\$.*?\$\$|\$.*?\$)/gs;
        const parts = content.split(mathRegex);

        parts.forEach(part => {
            if (part.startsWith('$$') && part.endsWith('$$')) {
                // Block math
                const formula = part.slice(2, -2);
                const el = document.createElement('div');
                el.className = 'my-4 flex justify-center';
                try {
                    window.katex.render(formula, el, { displayMode: true, throwOnError: false });
                } catch (e) {
                    el.innerText = part;
                }
                containerRef.current?.appendChild(el);
            } else if (part.startsWith('$') && part.endsWith('$')) {
                // Inline math
                const formula = part.slice(1, -1);
                const el = document.createElement('span');
                try {
                    window.katex.render(formula, el, { displayMode: false, throwOnError: false });
                } catch (e) {
                    el.innerText = part;
                }
                containerRef.current?.appendChild(el);
            } else if (part.trim() || part === ' ') {
                // Plain text
                const el = document.createElement('span');
                el.innerText = part;
                containerRef.current?.appendChild(el);
            }
        });
    }, [content]);

    const isArabic = /[\u0600-\u06FF]/.test(content);

    return (
        <div
            ref={containerRef}
            dir={isArabic ? "rtl" : "ltr"}
            className={`whitespace-pre-wrap leading-relaxed ${isArabic ? 'font-arabic text-right' : ''} ${className}`}
        />
    );
};

export default MathRenderer;
