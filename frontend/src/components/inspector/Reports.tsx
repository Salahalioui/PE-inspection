import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';

interface TeacherStats {
  id: string;
  user_id: string;
  full_name: string;
  work_institution: string;
  lesson_completion: number;
  total_lessons: number;
  absence_count: number;
  field_visit_count: number;
}

export function Reports() {
  const { t, i18n } = useTranslation();
  const [teacherStats, setTeacherStats] = useState<TeacherStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [sortBy, setSortBy] = useState<keyof TeacherStats>('full_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // RTL support
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    fetchTeacherStats();
  }, []);

  async function fetchTeacherStats() {
    try {
      // Fetch teacher profiles with user_id
      const { data: teachers, error: teacherError } = await supabase
        .from('teacher_profiles')
        .select('id, user_id, full_name, work_institution');

      if (teacherError) throw teacherError;

      // For each teacher, fetch their stats
      const stats = await Promise.all(
        (teachers || []).map(async (teacher) => {
          // Get lesson plans using user_id
          const { data: lessonPlans, error: lessonError } = await supabase
            .from('lesson_plans')
            .select('*')
            .eq('teacher_id', teacher.user_id);

          if (lessonError) throw lessonError;

          // Get absences using user_id
          const { data: absences, error: absenceError } = await supabase
            .from('absences')
            .select('*')
            .eq('teacher_id', teacher.user_id);

          if (absenceError) throw absenceError;

          // Get field visits using teacher_profile_id
          const { data: fieldVisits, error: visitError } = await supabase
            .from('field_visit_reports')
            .select('*')
            .eq('teacher_profile_id', teacher.id);

          if (visitError) throw visitError;

          const completedLessons = lessonPlans?.filter(plan => plan.completion_status).length || 0;

          return {
            id: teacher.id,
            user_id: teacher.user_id,
            full_name: teacher.full_name,
            work_institution: teacher.work_institution,
            lesson_completion: lessonPlans?.length 
              ? Math.round((completedLessons / lessonPlans.length) * 100)
              : 0,
            total_lessons: lessonPlans?.length || 0,
            absence_count: absences?.length || 0,
            field_visit_count: fieldVisits?.length || 0
          };
        })
      );

      setTeacherStats(stats);
    } catch (error) {
      console.error('Error fetching teacher statistics:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredStats = teacherStats
    .filter(teacher => 
      teacher.full_name.toLowerCase().includes(filterText.toLowerCase()) ||
      teacher.work_institution.toLowerCase().includes(filterText.toLowerCase())
    )
    .sort((a, b) => {
      const valueA = a[sortBy];
      const valueB = b[sortBy];
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      
      return sortDirection === 'asc'
        ? (valueA as number) - (valueB as number)
        : (valueB as number) - (valueA as number);
    });

  const handleSort = (column: keyof TeacherStats) => {
    if (sortBy === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  if (loading) {
    return <div className="text-center py-8">{t('common.loading')}</div>;
  }

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">{t('inspectorReports.title')}</h2>
        <input
          type="text"
          placeholder={t('inspectorReports.search')}
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white shadow overflow-x-auto rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('full_name')}
              >
                {t('inspectorReports.table.teacherName')}
                {sortBy === 'full_name' && (
                  <span className={`${isRTL ? 'mr-1' : 'ml-1'}`}>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('work_institution')}
              >
                {t('inspectorReports.table.institution')}
                {sortBy === 'work_institution' && (
                  <span className={`${isRTL ? 'mr-1' : 'ml-1'}`}>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('lesson_completion')}
              >
                {t('inspectorReports.table.lessonCompletion')}
                {sortBy === 'lesson_completion' && (
                  <span className={`${isRTL ? 'mr-1' : 'ml-1'}`}>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('absence_count')}
              >
                {t('inspectorReports.table.absences')}
                {sortBy === 'absence_count' && (
                  <span className={`${isRTL ? 'mr-1' : 'ml-1'}`}>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('field_visit_count')}
              >
                {t('inspectorReports.table.fieldVisits')}
                {sortBy === 'field_visit_count' && (
                  <span className={`${isRTL ? 'mr-1' : 'ml-1'}`}>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStats.map((teacher) => (
              <tr key={teacher.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{teacher.full_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{teacher.work_institution}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`${isRTL ? 'ml-2' : 'mr-2'}`}>{teacher.lesson_completion}%</span>
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${teacher.lesson_completion}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    teacher.absence_count > 5 
                      ? 'bg-red-100 text-red-800'
                      : teacher.absence_count > 2
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {teacher.absence_count}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{teacher.field_visit_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStats.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            {t('inspectorReports.noTeachers')}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('inspectorReports.stats.averageCompletion')}</h3>
          <p className="text-3xl font-bold text-blue-600">
            {Math.round(
              teacherStats.reduce((sum, t) => sum + t.lesson_completion, 0) / teacherStats.length
            )}%
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('inspectorReports.stats.totalFieldVisits')}</h3>
          <p className="text-3xl font-bold text-green-600">
            {teacherStats.reduce((sum, t) => sum + t.field_visit_count, 0)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('inspectorReports.stats.totalTeachers')}</h3>
          <p className="text-3xl font-bold text-purple-600">
            {teacherStats.length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('inspectorReports.stats.totalAbsences')}</h3>
          <p className="text-3xl font-bold text-red-600">
            {teacherStats.reduce((sum, t) => sum + t.absence_count, 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
