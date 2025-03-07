import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  const { teacherId } = useParams();
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [teacher, setTeacher] = useState<TeacherWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeacherSchedule();
  }, [teacherId]);

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
      if (!teacherData) throw new Error('Teacher not found');
      
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
      setError(err.message || 'Failed to fetch schedule');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="text-center py-8">Loading schedule...</div>;
  if (error) return <div className="text-red-600 p-4">{error}</div>;
  if (!teacher) return <div className="text-center py-8">Teacher not found</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{teacher.full_name}'s Schedule</h2>
        <p className="text-gray-600">Institution: {teacher.work_institution}</p>
      </div>

      {schedule.length === 0 ? (
        <p className="text-gray-600">No schedule entries found.</p>
      ) : (
        <div className="grid gap-4">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
            <div key={day} className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-lg mb-3 text-gray-800">{day}</h3>
              <div className="space-y-2">
                {schedule
                  .filter((entry) => entry.day_of_week === day)
                  .map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded"
                    >
                      <div className="text-gray-800">
                        <span className="font-medium">{entry.subject_class}</span>
                      </div>
                      <div className="text-gray-600">
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
