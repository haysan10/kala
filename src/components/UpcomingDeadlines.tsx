/**
 * UpcomingDeadlines Widget
 * 
 * Shows upcoming calendar events/deadlines on the dashboard
 */

import React, { useState, useEffect } from 'react';
import { Clock, Calendar, AlertTriangle, ChevronRight, Loader2, Target, Flag, RefreshCw } from 'lucide-react';
import {
    calendarApi,
    CalendarEvent,
    getEventTypeIcon,
    isEventOverdue,
    formatEventTime,
} from '../services/calendarApi';

interface UpcomingDeadlinesProps {
    onEventClick?: (event: CalendarEvent) => void;
    onViewAll?: () => void;
    limit?: number;
}

const UpcomingDeadlines: React.FC<UpcomingDeadlinesProps> = ({
    onEventClick,
    onViewAll,
    limit = 5
}) => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [overdueEvents, setOverdueEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            const [upcoming, overdue] = await Promise.all([
                calendarApi.getUpcomingEvents(limit),
                calendarApi.getOverdueEvents(),
            ]);
            setEvents(upcoming);
            setOverdueEvents(overdue);
        } catch (err: any) {
            console.error('Failed to load events:', err);
            setError('Failed to load deadlines');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEvents();
    }, [limit]);

    const formatRelativeDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays < 7) return `In ${diffDays} days`;
        if (diffDays < 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <Calendar className="text-blue-600" size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Upcoming Deadlines</h3>
                        <p className="text-xs text-gray-500">{events.length} upcoming, {overdueEvents.length} overdue</p>
                    </div>
                </div>
                <button
                    onClick={loadEvents}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500"
                    title="Refresh"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 size={24} className="animate-spin text-gray-400" />
                    </div>
                ) : error ? (
                    <div className="text-center py-8 text-gray-500">
                        <AlertTriangle size={24} className="mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">{error}</p>
                        <button onClick={loadEvents} className="text-blue-600 text-sm mt-2 hover:underline">
                            Try again
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {/* Overdue Warning */}
                        {overdueEvents.length > 0 && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle size={16} className="text-red-500" />
                                    <span className="text-sm font-medium text-red-600">
                                        {overdueEvents.length} overdue deadline{overdueEvents.length > 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="mt-2 space-y-1">
                                    {overdueEvents.slice(0, 2).map(event => (
                                        <div
                                            key={event.id}
                                            onClick={() => onEventClick?.(event)}
                                            className="text-sm text-red-600 truncate cursor-pointer hover:underline"
                                        >
                                            • {event.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Upcoming Events */}
                        {events.length === 0 && overdueEvents.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Clock size={32} className="mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">No upcoming deadlines</p>
                                <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                            </div>
                        ) : (
                            events.map(event => (
                                <div
                                    key={event.id}
                                    onClick={() => onEventClick?.(event)}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group"
                                >
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                                        style={{ backgroundColor: event.color + '20' }}
                                    >
                                        {getEventTypeIcon(event.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-white truncate">
                                            {event.title}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span>{formatRelativeDate(event.startTime)}</span>
                                            {event.assignment && (
                                                <>
                                                    <span>•</span>
                                                    <span className="truncate">{event.assignment.course || event.assignment.title}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))
                        )}

                        {/* View All Button */}
                        {(events.length > 0 || overdueEvents.length > 0) && onViewAll && (
                            <button
                                onClick={onViewAll}
                                className="w-full mt-3 py-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                View Calendar
                                <ChevronRight size={16} />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpcomingDeadlines;
