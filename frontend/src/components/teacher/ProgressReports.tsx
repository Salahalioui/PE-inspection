import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

type ProgressStats = {
  totalLessons: number;
  completedLessons: number;
  completionPercentage: number;
  totalAbsences: number;
  absencesByMonth: Record<string, number>;
  lessonsByMonth: Record<string, { total: number; completed: number }>;
};

export function ProgressReports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProgressStats>({
    totalLessons: 0,
    completedLessons: 0,
    completionPercentage: 0,
    totalAbsences: 0,
    absencesByMonth: {},
    lessonsByMonth: {},
  });
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (user) {
      Promise.all([
        loadLessonPlans(),
        loadAbsences()
      ]).then(() => setLoading(false));
    }
  }, [user]);

  async function loadLessonPlans() {
    try {
      const { data, error } = await supabase
        .from('lesson_plans')
        .select('*')
        .eq('teacher_id', user?.id);

      if (error) throw error;

      if (data) {
        const totalLessons = data.length;
        const completedLessons = data.filter(lesson => lesson.completion_status).length;
        const completionPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

        // Group lessons by month
        const lessonsByMonth: Record<string, { total: number; completed: number }> = {};
        
        data.forEach(lesson => {
          const date = new Date(lesson.created_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!lessonsByMonth[monthKey]) {
            lessonsByMonth[monthKey] = { total: 0, completed: 0 };
          }
          
          lessonsByMonth[monthKey].total += 1;
          if (lesson.completion_status) {
            lessonsByMonth[monthKey].completed += 1;
          }
        });

        setStats(prev => ({
          ...prev,
          totalLessons,
          completedLessons,
          completionPercentage,
          lessonsByMonth
        }));
      }
    } catch (error) {
      console.error('Error loading lesson plans:', error);
      setMessage({ text: 'Failed to load lesson plan data', type: 'error' });
    }
  }

  async function loadAbsences() {
    try {
      const { data, error } = await supabase
        .from('absences')
        .select('*')
        .eq('teacher_id', user?.id);

      if (error) throw error;

      if (data) {
        const totalAbsences = data.length;

        // Group absences by month
        const absencesByMonth: Record<string, number> = {};
        
        data.forEach(absence => {
          const date = new Date(absence.absence_date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!absencesByMonth[monthKey]) {
            absencesByMonth[monthKey] = 0;
          }
          
          absencesByMonth[monthKey] += 1;
        });

        setStats(prev => ({
          ...prev,
          totalAbsences,
          absencesByMonth
        }));
      }
    } catch (error) {
      console.error('Error loading absences:', error);
      setMessage({ text: 'Failed to load absence data', type: 'error' });
    }
  }

  // Format month key (YYYY-MM) to a more readable format
  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return <div className="flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Progress Reports</h2>
      
      {message && (
        <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Lesson Completion Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Lesson Completion</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-indigo-600">{stats.completionPercentage.toFixed(1)}%</p>
              <p className="text-sm text-gray-500">{stats.completedLessons} of {stats.totalLessons} lessons completed</p>
            </div>
            <div className="relative h-16 w-16">
              <svg className="h-full w-full" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#e5e7eb" strokeWidth="2"></circle>
                <circle 
                  cx="18" 
                  cy="18" 
                  r="16" 
                  fill="none" 
                  stroke="#4f46e5" 
                  strokeWidth="2" 
                  strokeDasharray={`${stats.completionPercentage * 0.01 * 100} 100`} 
                  strokeLinecap="round" 
                  transform="rotate(-90 18 18)"
                ></circle>
              </svg>
            </div>
          </div>
        </div>

        {/* Absences Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Absences</h3>
          <div>
            <p className="text-3xl font-bold text-indigo-600">{stats.totalAbsences}</p>
            <p className="text-sm text-gray-500">Total absences recorded</p>
          </div>
        </div>
      </div>

      {/* Monthly Progress */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Progress</h3>
        
        {Object.keys(stats.lessonsByMonth).length > 0 ? (
          <div className="space-y-4">
            {Object.keys(stats.lessonsByMonth)
              .sort((a, b) => b.localeCompare(a)) // Sort in descending order (newest first)
              .map(monthKey => {
                const monthData = stats.lessonsByMonth[monthKey];
                const absences = stats.absencesByMonth[monthKey] || 0;
                const completionPercentage = monthData.total > 0 
                  ? (monthData.completed / monthData.total) * 100 
                  : 0;
                
                return (
                  <div key={monthKey} className="border-b pb-4 last:border-0">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{formatMonth(monthKey)}</h4>
                      <div className="flex space-x-4 text-sm">
                        <span className="text-gray-500">
                          {monthData.completed}/{monthData.total} lessons
                        </span>
                        <span className="text-gray-500">
                          {absences} {absences === 1 ? 'absence' : 'absences'}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full" 
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No monthly data available yet.</p>
        )}
      </div>

      {/* Summary */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
        <p className="text-gray-600 mb-2">
          You have completed <span className="font-medium">{stats.completedLessons}</span> out of <span className="font-medium">{stats.totalLessons}</span> lessons 
          ({stats.completionPercentage.toFixed(1)}% completion rate).
        </p>
        <p className="text-gray-600">
          You have recorded <span className="font-medium">{stats.totalAbsences}</span> absences in total.
        </p>
      </div>
    </div>
  );
}
