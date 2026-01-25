/**
 * Enhanced CalendarView Component
 * 
 * Features:
 * - Month/Week/Day views
 * - Event type color coding
 * - Event detail modal
 * - Create new events
 * - Today indicator
 * - Overdue indicator
 * - Click to navigate to assignment
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon,
  Clock, Flag, CheckCircle2, AlertTriangle, Target, BookOpen,
  Loader2, RefreshCw, ExternalLink, Edit2, Trash2
} from 'lucide-react';
import { Assignment } from '../types';
import {
  calendarApi,
  CalendarEvent,
  getMonthRange,
  getEventTypeColor,
  getEventTypeIcon,
  formatEventTime,
  isEventOverdue,
} from '../services/calendarApi';

type ViewMode = 'month' | 'week' | 'day';

interface CalendarViewProps {
  assignments: Assignment[];
  onAssignmentClick?: (assignmentId: string) => void;
}

interface EventModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
  onComplete: (eventId: string) => void;
  onDelete: (eventId: string) => void;
  onAssignmentClick?: (assignmentId: string) => void;
}

interface CreateEventModalProps {
  date: Date | null;
  onClose: () => void;
  onCreate: (event: { title: string; startTime: string; description?: string; type: string; color: string }) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ assignments, onAssignmentClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [createDate, setCreateDate] = useState<Date | null>(null);
  const [syncing, setSyncing] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Load events
  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const range = getMonthRange(year, month);
      const data = await calendarApi.getEvents(range);
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Sync events from assignments
  const handleSync = async () => {
    setSyncing(true);
    try {
      await calendarApi.syncEvents();
      await loadEvents();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  // Event handlers
  const handleCompleteEvent = async (eventId: string) => {
    try {
      await calendarApi.completeEvent(eventId);
      await loadEvents();
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to complete event:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Delete this event?')) return;
    try {
      await calendarApi.deleteEvent(eventId);
      await loadEvents();
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const handleCreateEvent = async (data: { title: string; startTime: string; description?: string; type: string; color: string }) => {
    try {
      await calendarApi.createEvent(data);
      await loadEvents();
      setCreateDate(null);
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  // Navigation
  const navigatePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
    }
  };

  const navigateNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  // Calendar calculations
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const getEventsForDay = (day: number): CalendarEvent[] => {
    return events.filter(e => {
      const d = new Date(e.startTime);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  // Stats
  const upcomingCount = events.filter(e => e.status === 'scheduled' && new Date(e.startTime) >= new Date()).length;
  const overdueCount = events.filter(e => isEventOverdue(e)).length;

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, event: CalendarEvent) => {
    e.dataTransfer.setData('eventId', event.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleEventDrop = async (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData('eventId');
    if (!eventId) return;

    const event = events.find(ev => ev.id === eventId);
    if (!event) return;

    // Calculate new start time based on target date but preserving time if not allDay
    const newStartTime = new Date(targetDate);
    if (!event.allDay) {
      const oldStart = new Date(event.startTime);
      newStartTime.setHours(oldStart.getHours(), oldStart.getMinutes());
    } else {
      newStartTime.setHours(9, 0, 0, 0); // Default to 9 AM for dropped allDay events if needed
    }

    // Calculate new end time if it exists
    let newEndTime = undefined;
    if (event.endTime) {
      const duration = new Date(event.endTime).getTime() - new Date(event.startTime).getTime();
      newEndTime = new Date(newStartTime.getTime() + duration).toISOString();
    }

    try {
      await calendarApi.updateEvent(eventId, {
        startTime: newStartTime.toISOString(),
        endTime: newEndTime,
      });
      await loadEvents();
    } catch (error) {
      console.error('Failed to reschedule event:', error);
      alert('Failed to reschedule event');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden animate-in fade-in duration-500">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Title and Navigation */}
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white">
              {monthName} {year}
            </h2>
            <div className="flex gap-1">
              <button
                onClick={navigatePrev}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              >
                Today
              </button>
              <button
                onClick={navigateNext}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* View Mode Tabs & Actions */}
          <div className="flex items-center gap-3">
            {/* View Mode */}
            <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
              {(['month', 'week', 'day'] as ViewMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${viewMode === mode
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Sync Button */}
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
              Sync
            </button>

            {/* Add Event Button */}
            <button
              onClick={() => setCreateDate(new Date())}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              <Plus size={16} />
              Add Event
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs font-medium text-gray-500">{upcomingCount} upcoming</span>
          </div>
          {overdueCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-medium text-red-500">{overdueCount} overdue</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: getEventTypeColor('assignment_deadline') }} />
            <span className="text-xs text-gray-400">Deadline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: getEventTypeColor('milestone') }} />
            <span className="text-xs text-gray-400">Milestone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: getEventTypeColor('custom') }} />
            <span className="text-xs text-gray-400">Custom</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid - Month View */}
      {viewMode === 'month' && (
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 size={32} className="animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-px bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="bg-gray-50 dark:bg-gray-900 p-3 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {d}
                  </span>
                </div>
              ))}

              {/* Calendar Days */}
              {Array.from({ length: 42 }).map((_, i) => {
                const dayNumber = i - firstDayOfMonth + 1;
                const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
                const dayEvents = isCurrentMonth ? getEventsForDay(dayNumber) : [];
                const isTodayCell = isToday(dayNumber);
                const hasOverdue = dayEvents.some(e => isEventOverdue(e));

                return (
                  <div
                    key={i}
                    onClick={() => {
                      if (isCurrentMonth) {
                        setCreateDate(new Date(year, month, dayNumber));
                      }
                    }}
                    onDragOver={handleDragOver}
                    onDrop={(e) => isCurrentMonth && handleEventDrop(e, new Date(year, month, dayNumber))}
                    className={`min-h-[120px] bg-white dark:bg-gray-900 p-2 flex flex-col cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${!isCurrentMonth ? 'opacity-30' : ''
                      } ${isTodayCell ? 'ring-2 ring-inset ring-blue-500' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-sm font-bold ${isTodayCell
                        ? 'bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center'
                        : 'text-gray-300 dark:text-gray-600'
                        }`}>
                        {isCurrentMonth ? dayNumber : ''}
                      </span>
                      {hasOverdue && isCurrentMonth && (
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-1 max-h-[80px]">
                      {dayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                          }}
                          draggable
                          onDragStart={(e) => handleDragStart(e, event)}
                          className={`text-[10px] px-2 py-1 rounded-lg font-bold truncate cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02] ${event.status === 'completed'
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 line-through'
                            : isEventOverdue(event)
                              ? 'bg-red-500 text-white'
                              : ''
                            }`}
                          style={
                            event.status !== 'completed' && !isEventOverdue(event)
                              ? { backgroundColor: event.color + '20', color: event.color }
                              : undefined
                          }
                        >
                          {getEventTypeIcon(event.type)} {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-[9px] text-gray-400 text-center">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="p-4">
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => {
              const d = new Date(currentDate);
              d.setDate(d.getDate() - d.getDay() + i);
              const dayNumber = d.getDate();
              const dayMonth = d.getMonth();
              const dayYear = d.getFullYear();
              const dayEvents = events.filter(e => {
                const ed = new Date(e.startTime);
                return ed.getDate() === dayNumber && ed.getMonth() === dayMonth && ed.getFullYear() === dayYear;
              });
              const isTodayCell = dayNumber === new Date().getDate() && dayMonth === new Date().getMonth();

              return (
                <div key={i} className={`rounded-2xl p-3 min-h-[300px] ${isTodayCell
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                  : 'bg-gray-50 dark:bg-gray-800/50'
                  }`}>
                  <div className="text-center mb-3">
                    <div className="text-[10px] font-bold uppercase text-gray-400">
                      {d.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className={`text-xl font-black ${isTodayCell ? 'text-blue-600' : 'text-gray-900 dark:text-white'}`}>
                      {dayNumber}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {dayEvents.map(event => (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className="p-2 rounded-lg text-xs font-medium cursor-pointer transition-all hover:scale-[1.02]"
                        style={{ backgroundColor: event.color + '20', color: event.color }}
                      >
                        <div className="font-bold truncate">{event.title}</div>
                        <div className="text-[10px] opacity-70">{formatEventTime(event)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day View */}
      {viewMode === 'day' && (
        <div className="p-4">
          <div className="text-center mb-6">
            <div className="text-sm font-bold text-gray-400">{currentDate.toLocaleDateString('en-US', { weekday: 'long' })}</div>
            <div className="text-4xl font-black text-gray-900 dark:text-white">{currentDate.getDate()}</div>
          </div>
          <div className="max-w-2xl mx-auto space-y-3">
            {events
              .filter(e => {
                const d = new Date(e.startTime);
                return d.getDate() === currentDate.getDate() &&
                  d.getMonth() === currentDate.getMonth() &&
                  d.getFullYear() === currentDate.getFullYear();
              })
              .map(event => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.01]"
                  style={{ backgroundColor: event.color + '15', borderLeft: `4px solid ${event.color}` }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">{event.title}</div>
                      <div className="text-sm text-gray-500">{formatEventTime(event)}</div>
                      {event.description && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">{event.description}</div>
                      )}
                    </div>
                    <span className="text-lg">{getEventTypeIcon(event.type)}</span>
                  </div>
                </div>
              ))}
            {events.filter(e => {
              const d = new Date(e.startTime);
              return d.getDate() === currentDate.getDate() &&
                d.getMonth() === currentDate.getMonth() &&
                d.getFullYear() === currentDate.getFullYear();
            }).length === 0 && (
                <div className="text-center text-gray-400 py-12">
                  <CalendarIcon size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No events for this day</p>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onComplete={handleCompleteEvent}
          onDelete={handleDeleteEvent}
          onAssignmentClick={onAssignmentClick}
        />
      )}

      {/* Create Event Modal */}
      {createDate && (
        <CreateEventModal
          date={createDate}
          onClose={() => setCreateDate(null)}
          onCreate={handleCreateEvent}
        />
      )}
    </div>
  );
};

// ==================== EVENT DETAIL MODAL ====================

const EventDetailModal: React.FC<EventModalProps> = ({
  event,
  onClose,
  onComplete,
  onDelete,
  onAssignmentClick
}) => {
  if (!event) return null;

  const overdue = isEventOverdue(event);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-6 text-white"
          style={{ backgroundColor: overdue ? '#EF4444' : event.color }}
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-2xl">{getEventTypeIcon(event.type)}</span>
              <h3 className="text-xl font-bold mt-2">{event.title}</h3>
              <p className="text-white/80 text-sm mt-1">{formatEventTime(event)}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          {overdue && (
            <div className="flex items-center gap-2 mt-4 bg-white/20 rounded-lg px-3 py-2">
              <AlertTriangle size={16} />
              <span className="text-sm font-medium">This event is overdue</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {event.description && (
            <div>
              <label className="text-xs font-bold uppercase text-gray-400">Description</label>
              <p className="text-gray-700 dark:text-gray-300 mt-1">{event.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-gray-400">Type</label>
              <p className="text-gray-900 dark:text-white capitalize mt-1">
                {event.type.replace(/_/g, ' ')}
              </p>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-gray-400">Status</label>
              <p className={`font-medium capitalize mt-1 ${event.status === 'completed' ? 'text-green-600' :
                overdue ? 'text-red-600' : 'text-gray-900 dark:text-white'
                }`}>
                {overdue ? 'Overdue' : event.status}
              </p>
            </div>
          </div>

          {event.assignment && (
            <div
              className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => {
                onAssignmentClick?.(event.assignmentId!);
                onClose();
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-400">Assignment</label>
                  <p className="text-gray-900 dark:text-white font-medium">{event.assignment.title}</p>
                  {event.assignment.course && (
                    <p className="text-sm text-gray-500">{event.assignment.course}</p>
                  )}
                </div>
                <ExternalLink size={16} className="text-gray-400" />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-2">
          {event.status !== 'completed' && (
            <button
              onClick={() => onComplete(event.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors"
            >
              <CheckCircle2 size={16} />
              Complete
            </button>
          )}
          {event.type === 'custom' && (
            <button
              onClick={() => onDelete(event.id)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-100 dark:bg-red-900/20 text-red-600 font-medium rounded-xl hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== CREATE EVENT MODAL ====================

const CreateEventModal: React.FC<CreateEventModalProps> = ({ date, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('09:00');
  const [type, setType] = useState('custom');
  const [color, setColor] = useState('#3B82F6');

  if (!date) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const startTime = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    startTime.setHours(hours, minutes, 0, 0);

    onCreate({
      title: title.trim(),
      description: description.trim() || undefined,
      startTime: startTime.toISOString(),
      type,
      color,
    });
  };

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create Event</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Event title"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
            <div className="flex gap-2">
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!title.trim()}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Event
          </button>
        </form>
      </div>
    </div>
  );
};

export default CalendarView;
