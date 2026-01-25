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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ duration: 0.2 }}
            className={`relative group overflow-hidden rounded-[2rem] ${variants[variant]} backdrop-blur-xl p-8 border border-white/5 hover:border-white/10 transition-all`}
        >
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-navy-700/50 flex items-center justify-center group-hover:bg-navy-600/50 transition-colors border border-navy-600/50">
                        {icon}
                    </div>
                    {trend !== undefined && (
                        <div className={`flex items-center gap-1 text-xs font-bold ${trend > 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                            {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {Math.abs(trend)}%
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <div className="text-3xl font-black text-white tracking-tight">
                        {value}
                    </div>
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {label}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MetricCard;
