import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';

interface Teacher {
  id: string;
  full_name: string;
  work_institution: string;
  level: string;
  appointment_date: string;
}

export function TeacherList() {
  const { t, i18n } = useTranslation();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const navigate = useNavigate();

  // RTL support
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    fetchTeachers();
  }, []);

  async function fetchTeachers() {
    try {
      const { data, error } = await supabase
        .from('teacher_profiles')
        .select(`
          id,
          full_name,
          work_institution,
          level,
          appointment_date
        `);

      if (error) {
        console.error('Error fetching teachers:', error);
        throw error;
      }
      setTeachers(data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      // Show error message or handle error state
    } finally {
      setLoading(false);
    }
  }

  const filteredTeachers = teachers.filter(teacher => 
    teacher.full_name.toLowerCase().includes(filterText.toLowerCase()) ||
    teacher.work_institution.toLowerCase().includes(filterText.toLowerCase()) ||
    teacher.level.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">{t('inspectorTeacherList.title')}</h2>
        <div>
          <input
            type="text"
            placeholder={t('inspectorTeacherList.search')}
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center">{t('inspectorTeacherList.loading')}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('inspectorTeacherList.table.name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('inspectorTeacherList.table.institution')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('inspectorTeacherList.table.level')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('inspectorTeacherList.table.appointmentDate')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('inspectorTeacherList.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{teacher.full_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{teacher.work_institution}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{teacher.level}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(teacher.appointment_date).toLocaleDateString(i18n.language)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => navigate(`/inspector/teachers/${teacher.id}`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {t('inspectorTeacherList.actions.viewDetails')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredTeachers.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              {t('inspectorTeacherList.noTeachers')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
