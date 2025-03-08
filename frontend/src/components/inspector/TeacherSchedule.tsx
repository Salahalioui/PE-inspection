import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';

interface ScheduleEntry {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  subject_class: string;
}

interface TeacherWithProfile {
  id: string;
  user_id: string;
  full_name: string;
  work_institution: string;
}

export function TeacherSchedule() {
  const { t, i18n } = useTranslation();
  const { teacherId } = useParams();
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [teacher, setTeacher] = useState<TeacherWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // RTL support
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    fetchTeacherSchedule();
  }, [teacherId, i18n.language]); // Added i18n.language dependency to refetch on language change

  async function fetchTeacherSchedule() {
    try {
      setLoading(true);

      // First get teacher profile to get user_id
      const { data: teacherData, error: teacherError } = await supabase
        .from('teacher_profiles')
        .select('id, user_id, full_name, work_institution')
        .eq('id', teacherId)
        .single();

      if (teacherError) throw teacherError;
      if (!teacherData) throw new Error(t('inspectorTeacherSchedule.notFound'));
      
      setTeacher(teacherData);

      // Then get their schedule using user_id
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('teacher_weekly_schedules')
        .select('*')
        .eq('teacher_id', teacherData.user_id)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (scheduleError) throw scheduleError;
      setSchedule(scheduleData || []);

    } catch (err: any) {
      setError(err.message || t('inspectorTeacherSchedule.error'));
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="text-center py-8">{t('inspectorTeacherSchedule.loading')}</div>;
  if (error) return <div className="text-red-600 p-4">{error}</div>;
  if (!teacher) return <div className="text-center py-8">{t('inspectorTeacherSchedule.notFound')}</div>;

  return (
    <div className={`p-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">
          {t('inspectorTeacherSchedule.title', { name: teacher.full_name })}
        </h2>
        <p className="text-gray-600">
          {t('inspectorTeacherSchedule.institution', { institution: teacher.work_institution })}
        </p>
      </div>

      {schedule.length === 0 ? (
        <p className="text-gray-600">{t('inspectorTeacherSchedule.noSchedule')}</p>
      ) : (
        <div className="grid gap-4">
          {[
            { key: 'monday', label: t('days.monday') },
            { key: 'tuesday', label: t('days.tuesday') },
            { key: 'wednesday', label: t('days.wednesday') },
            { key: 'thursday', label: t('days.thursday') },
            { key: 'friday', label: t('days.friday') }
          ].map((day) => (
            <div key={day.key} className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-lg mb-3 text-gray-800">{day.label}</h3>
              <div className="space-y-2">
                {schedule
                  .filter((entry) => entry.day_of_week.toLowerCase() === day.key)
                  .map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded"
                    >
                      <div className="text-gray-800">
                        <span className="font-medium">{entry.subject_class}</span>
                      </div>
                      <div className={`text-gray-600 ${isRTL ? 'mr-4' : 'ml-4'}`}>
                        {entry.start_time.slice(0, 5)} - {entry.end_time.slice(0, 5)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
