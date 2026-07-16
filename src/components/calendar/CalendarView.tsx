'use client';

import { useState } from 'react';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Download, Globe, Lock, X } from 'lucide-react';
import { createCalendarEvent, deleteCalendarEvent } from '@/app/actions/calendar';
import { toast } from 'sonner';

export default function CalendarView({ initialEvents, role, userId }: { initialEvents: any[], role: string, userId: string }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState(initialEvents);
  const [viewMode, setViewMode] = useState<'general' | 'private'>('general');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // View mode filtered events
  const filteredEvents = events.filter(e => viewMode === 'general' ? e.isGlobal : (!e.isGlobal && e.ownerId === userId));

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Calendar Math
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const handleDayClick = (day: Date) => {
    if (viewMode === 'general' && role === 'TEACHER') {
      toast.error('Teachers cannot create global events. Switch to Private View.');
      return;
    }
    setSelectedDate(day);
    setIsModalOpen(true);
  };

  const handleAddEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      description: formData.get('description') || '',
      startDate: `${format(selectedDate!, 'yyyy-MM-dd')}T${formData.get('startTime') || '00:00'}:00`,
      endDate: `${format(selectedDate!, 'yyyy-MM-dd')}T${formData.get('endTime') || '23:59'}:00`,
      eventType: formData.get('eventType') || 'Event',
      color: formData.get('color'),
      isGlobal: viewMode === 'general',
    };

    try {
      const newEvent = await createCalendarEvent(data);
      setEvents([...events, newEvent]);
      setIsModalOpen(false);
      toast.success('Event added successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add event');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Delete this event?')) return;
    try {
      await deleteCalendarEvent(id);
      setEvents(events.filter(ev => ev.id !== id));
      toast.success('Event deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const exportICS = (event: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${event.title}
DTSTART:${format(new Date(event.startDate), "yyyyMMdd'T'HHmmss")}
DTEND:${format(new Date(event.endDate), "yyyyMMdd'T'HHmmss")}
DESCRIPTION:${event.description || ''}
END:VEVENT
END:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl md:text-2xl font-black text-slate-800">{format(currentDate, 'MMMM yyyy')}</h2>
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button onClick={prevMonth} className="p-1 hover:bg-white rounded text-slate-600 transition shadow-sm"><ChevronLeft className="w-5 h-5"/></button>
            <button onClick={nextMonth} className="p-1 hover:bg-white rounded text-slate-600 transition shadow-sm"><ChevronRight className="w-5 h-5"/></button>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setViewMode('general')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${viewMode === 'general' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Globe className="w-4 h-4" /> Global View
          </button>
          <button 
            onClick={() => setViewMode('private')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${viewMode === 'private' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Lock className="w-4 h-4" /> My Private Calendar
          </button>
        </div>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 auto-rows-[120px] md:auto-rows-[160px] divide-x divide-y divide-slate-100">
        {days.map((day, i) => {
          const dayEvents = filteredEvents.filter(e => isSameDay(new Date(e.startDate), day));
          return (
            <div 
              key={day.toString()} 
              onClick={() => handleDayClick(day)}
              className={`p-2 transition cursor-pointer hover:bg-slate-50/50 ${!isSameMonth(day, monthStart) ? 'bg-slate-50/50 text-slate-400' : 'bg-white text-slate-800'}`}
            >
              <div className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isSameDay(day, new Date()) ? 'bg-indigo-600 text-white shadow-md' : ''}`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1 overflow-y-auto max-h-[80px] md:max-h-[110px] custom-scrollbar">
                {dayEvents.map(e => (
                  <div key={e.id} className={`group relative p-1.5 px-2 rounded text-[10px] md:text-xs font-bold text-white shadow-sm transition hover:ring-2 hover:ring-offset-1 ${e.color}`}>
                    <div className="truncate">{e.title}</div>
                    <div className="hidden group-hover:flex absolute right-1 top-1 items-center gap-1 bg-black/20 p-0.5 rounded backdrop-blur-sm">
                      <button onClick={(ev) => exportICS(e, ev)} className="p-0.5 hover:text-indigo-200 transition" title="Export to Calendar"><Download className="w-3 h-3"/></button>
                      {(role !== 'TEACHER' || e.ownerId === userId) && (
                        <button onClick={(ev) => handleDelete(ev, e.id)} className="p-0.5 hover:text-rose-300 transition" title="Delete"><X className="w-3 h-3" /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for adding event */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><CalendarIcon className="w-5 h-5 text-indigo-600"/> Add Event</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleAddEvent} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Event Date</label>
                <div className="text-sm font-bold text-indigo-600 bg-indigo-50 p-2 rounded">{format(selectedDate!, 'PPPP')}</div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Title</label>
                <input required name="title" autoFocus className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="e.g. Science Fair" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Start Time (Optional)</label>
                  <input name="startTime" type="time" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">End Time (Optional)</label>
                  <input name="endTime" type="time" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Category & Color</label>
                <select name="color" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-1 focus:ring-indigo-500 outline-none">
                  <option value="bg-indigo-500 ring-indigo-500">School Event (Indigo)</option>
                  <option value="bg-rose-500 ring-rose-500">Holiday (Red)</option>
                  <option value="bg-emerald-500 ring-emerald-500">Academic Deadline (Green)</option>
                  <option value="bg-amber-500 ring-amber-500">Birthday / Party (Yellow)</option>
                  <option value="bg-slate-700 ring-slate-700">Private Task (Dark)</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition">Create Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
