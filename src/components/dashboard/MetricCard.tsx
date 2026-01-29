import React from 'react';
import { Assignment } from '../../types';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface MetricCardProps {
    label: string;
    value: number;
    trend?: number;
    icon: React.ReactNode;
    variant?: 'default' | 'warning' | 'success' | 'primary';
}

const MetricCard: React.FC<MetricCardProps> = ({
    label,
    value,
    trend,
    icon,
    variant = 'default'
}) => {
    const variants = {
        default: 'bg-slate-900/40',
        warning: 'bg-red-500/5',
        success: 'bg-emerald-500/5',
        primary: 'bg-blue-500/5'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`relative group overflow-hidden rounded-2xl bg-white dark:bg-white/[0.02] p-6 border border-gray-100 dark:border-white/5 hover:border-blue-500/20 transition-all`}
        >
            <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="text-gray-400 dark:text-gray-500">
                        {icon}
                    </div>
                    {trend !== undefined && (
                        <div className={`flex items-center gap-1 text-[10px] font-bold ${trend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {trend > 0 ? '+' : '-'}{Math.abs(trend)}%
                        </div>
                    )}
                </div>

                <div className="space-y-0.5">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                        {value}
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {label}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MetricCard;
