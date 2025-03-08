import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { WeeklySchedule as WeeklyScheduleType, DayOfWeek } from '../../lib/types';

type ScheduleEntry = WeeklyScheduleType & { isNew?: boolean };

const DAYS_MAPPING: Record<DayOfWeek, [string, string, string]> = {
  'Monday': ['Monday', 'Lundi', 'الإثنين'],
  'Tuesday': ['Tuesday', 'Mardi', 'الثلاثاء'],
  'Wednesday': ['Wednesday', 'Mercredi', 'الأربعاء'],
  'Thursday': ['Thursday', 'Jeudi', 'الخميس'],
  'Friday': ['Friday', 'Vendredi', 'الجمعة'],
  'Saturday': ['Saturday', 'Samedi', 'السبت'],
  'Sunday': ['Sunday', 'Dimanche', 'الأحد']
};

export function WeeklySchedule() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const daysOfWeek = [
    t('days.monday'),
    t('days.tuesday'),
    t('days.wednesday'),
    t('days.thursday'),
    t('days.friday'),
    t('days.saturday'),
    t('days.sunday')
  ];

  useEffect(() => {
    if (user) {
      loadSchedule();
    }
  }, [user]);

  useEffect(() => {
    // Reload schedule entries when language changes to update the day names
    if (!loading) {
      loadSchedule();
    }
  }, [i18n.language]);

  // Function to get English day name from translated day name
  const getEnglishDayName = (translatedDay: string): DayOfWeek => {
    const entry = Object.entries(DAYS_MAPPING).find(([_, translations]) =>
      translations.includes(translatedDay)
    );
    return (entry ? entry[0] : 'Monday') as DayOfWeek;
  };

  // Function to get translated day name from English day name
  const getTranslatedDayName = (englishDay: DayOfWeek): string => {
    const translations = DAYS_MAPPING[englishDay];
    if (i18n.language.startsWith('fr')) return translations[1];
    if (i18n.language.startsWith('ar')) return translations[2];
    return translations[0];
  };

  async function loadSchedule() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('teacher_weekly_schedules')
        .select('*')
        .eq('teacher_id', user?.id)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      setScheduleEntries(data || []);
    } catch (error) {
      console.error('Error loading schedule:', error);
      setMessage({ text: t('weeklySchedule.messages.loadError'), type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  const handleAddEntry = () => {
    const newEntry: ScheduleEntry = {
      id: `new-${Date.now()}`,
      teacher_id: user?.id || '',
      day_of_week: 'Monday',
      start_time: '08:00',
      end_time: '09:00',
      subject_class: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isNew: true
    };
    setEditingEntry(newEntry);
    setIsModalOpen(true);
  };

  const handleEditEntry = (entry: ScheduleEntry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (window.confirm(t('weeklySchedule.messages.deleteConfirm'))) {
      try {
        const { error } = await supabase
          .from('teacher_weekly_schedules')
          .delete()
          .eq('id', entryId);

        if (error) throw error;

        setScheduleEntries(scheduleEntries.filter(entry => entry.id !== entryId));
        setMessage({ text: t('weeklySchedule.messages.deleteSuccess'), type: 'success' });
      } catch (error) {
        console.error('Error deleting schedule entry:', error);
        setMessage({ text: t('weeklySchedule.messages.deleteError'), type: 'error' });
      }
    }
  };

  const handleSaveEntry = async () => {
    if (!editingEntry) return;

    try {
      const { start_time, end_time, subject_class } = editingEntry;
      const day_of_week = getEnglishDayName(editingEntry.day_of_week);

      if (!day_of_week || !start_time || !end_time || !subject_class) {
        setMessage({ text: t('weeklySchedule.messages.fillRequired'), type: 'error' });
        return;
      }

      if (editingEntry.isNew) {
        // Create new entry
        const { data, error } = await supabase
          .from('teacher_weekly_schedules')
          .insert({
            teacher_id: user?.id,
            day_of_week,
            start_time,
            end_time,
            subject_class
          })
          .select();

        if (error) throw error;

        if (data && data.length > 0) {
          setScheduleEntries([...scheduleEntries, data[0] as ScheduleEntry]);
          setMessage({ text: t('weeklySchedule.messages.saveSuccess'), type: 'success' });
        }
      } else {
        // Update existing entry
        const { error } = await supabase
          .from('teacher_weekly_schedules')
          .update({
            day_of_week,
            start_time,
            end_time,
            subject_class,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingEntry.id);

        if (error) throw error;

        const updatedEntry: ScheduleEntry = {
          ...editingEntry,
          day_of_week,
          start_time,
          end_time,
          subject_class,
          updated_at: new Date().toISOString()
        };

        setScheduleEntries(
          scheduleEntries.map(entry =>
            entry.id === editingEntry.id ? updatedEntry : entry
          )
        );
        setMessage({ text: t('weeklySchedule.messages.updateSuccess'), type: 'success' });
      }

      setIsModalOpen(false);
      setEditingEntry(null);
    } catch (error) {
      console.error('Error saving schedule entry:', error);
      setMessage({ text: t('weeklySchedule.messages.saveError'), type: 'error' });
    }
  };

  const groupedEntries = daysOfWeek.map(day => ({
    day,
    entries: scheduleEntries.filter(entry => getTranslatedDayName(entry.day_of_week) === day)
  }));

  if (loading) {
    return <div className="flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{t('weeklySchedule.title')}</h2>
        <button
          onClick={handleAddEntry}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {t('weeklySchedule.addEntry')}
        </button>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {groupedEntries.map(({ day, entries }) => (
          <div key={day} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <h3 className="text-lg font-medium text-gray-900">{day}</h3>
            </div>
            {entries.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {entries.map(entry => (
                  <div key={entry.id} className="px-4 py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{entry.subject_class}</p>
                      <p className="text-sm text-gray-500">
                        {entry.start_time} - {entry.end_time}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditEntry(entry)}
                        className="text-indigo-600 hover:text-indigo-900 focus:outline-none"
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-red-600 hover:text-red-900 focus:outline-none"
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-3 text-gray-500 italic">{t('weeklySchedule.noEntries')}</div>
            )}
          </div>
        ))}
      </div>

      {/* Modal for adding/editing schedule entries */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingEntry?.isNew ? t('weeklySchedule.addEntry') : t('weeklySchedule.editEntry')}
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('weeklySchedule.fields.dayOfWeek')}
                </label>
                <select
                  id="day"
                  value={editingEntry ? getTranslatedDayName(editingEntry.day_of_week) : ''}
                  onChange={(e) => setEditingEntry(prev => {
                    if (!prev) return null;
                    const englishDay = getEnglishDayName(e.target.value);
                    return { ...prev, day_of_week: englishDay };
                  })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('weeklySchedule.fields.startTime')}
                </label>
                <input
                  id="startTime"
                  type="time"
                  value={editingEntry?.start_time || ''}
                  onChange={(e) => setEditingEntry(prev => prev ? { ...prev, start_time: e.target.value } : null)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('weeklySchedule.fields.endTime')}
                </label>
                <input
                  id="endTime"
                  type="time"
                  value={editingEntry?.end_time || ''}
                  onChange={(e) => setEditingEntry(prev => prev ? { ...prev, end_time: e.target.value } : null)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="subjectClass" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('weeklySchedule.fields.subjectClass')}
                </label>
                <input
                  id="subjectClass"
                  type="text"
                  value={editingEntry?.subject_class || ''}
                  onChange={(e) => setEditingEntry(prev => prev ? { ...prev, subject_class: e.target.value } : null)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingEntry(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSaveEntry}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
