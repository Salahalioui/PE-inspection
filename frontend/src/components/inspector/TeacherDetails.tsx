import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';

interface TeacherProfile {
  id: string;
  full_name: string;
  date_of_birth: string;
  job_title: string;
  level: string;
  work_institution: string;
  position: string;
  grade: string;
  appointment_date: string;
  confirmation_date: string;
  marital_status: string;
  certificate_obtained: string;
}

interface LessonPlan {
  id: string;
  lesson_number: number;
  objectives: string;
  completion_status: boolean;
  remarks: string;
  created_at: string;
}

interface Absence {
  id: string;
  absence_date: string;
  motif: {
    motif_label_ar: string;
    motif_label_fr: string;
  };
  remarks: string;
}

export function TeacherDetails() {
  const { t, i18n } = useTranslation();
  const { teacherId } = useParams<{ teacherId: string }>();
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'lessons' | 'absences'>('profile');

  // RTL support
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    if (teacherId) {
      fetchTeacherData();
    }
  }, [teacherId]);

  interface TeacherWithProfile extends TeacherProfile {
    user_id: string;
  }

  async function fetchTeacherData() {
    try {
      // Fetch teacher profile
      const { data: profileData, error: profileError } = await supabase
        .from('teacher_profiles')
        .select('*, user_id')
        .eq('id', teacherId)
        .single();

      if (profileError) throw profileError;
      
      if (!profileData) {
        setLoading(false);
        return;
      }

      const teacherWithProfile = profileData as TeacherWithProfile;
      setTeacher(teacherWithProfile);

      const { data: lessonData, error: lessonError } = await supabase
        .from('lesson_plans')
        .select('*')
        .eq('teacher_id', teacherWithProfile.user_id)
        .order('created_at', { ascending: false });

      if (lessonError) throw lessonError;
      setLessonPlans(lessonData || []);

      // Fetch absences with motifs
      const { data: absenceData, error: absenceError } = await supabase
        .from('absences')
        .select(`
          *,
          motif:absence_motifs (
            motif_label_ar,
            motif_label_fr
          )
        `)
        .eq('teacher_id', teacherWithProfile.user_id)
        .order('absence_date', { ascending: false });

      if (absenceError) throw absenceError;
      setAbsences(absenceData || []);

    } catch (error) {
      console.error('Error fetching teacher data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8">{t('inspectorTeacherDetails.loading')}</div>;
  }

  if (!teacher) {
    return <div className="text-center py-8 text-red-600">{t('inspectorTeacherDetails.notFound')}</div>;
  }

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">{teacher.full_name}</h2>
        <div className="space-x-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('inspectorTeacherDetails.tabs.profile')}
          </button>
          <button
            onClick={() => setActiveTab('lessons')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'lessons'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('inspectorTeacherDetails.tabs.lessons')}
          </button>
          <button
            onClick={() => setActiveTab('absences')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'absences'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('inspectorTeacherDetails.tabs.absences')}
          </button>
          <Link
            to={`/inspector/teachers/${teacherId}/schedule`}
            className="px-4 py-2 rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
          >
            {t('inspectorTeacherDetails.actions.viewSchedule')}
          </Link>
        </div>
      </div>

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">{t('inspectorTeacherDetails.profile.fullName')}</label>
              <div className="mt-1 text-gray-900">{teacher.full_name}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">{t('inspectorTeacherDetails.profile.dateOfBirth')}</label>
              <div className="mt-1 text-gray-900">
                {new Date(teacher.date_of_birth).toLocaleDateString(i18n.language)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">{t('inspectorTeacherDetails.profile.jobTitle')}</label>
              <div className="mt-1 text-gray-900">{teacher.job_title}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">{t('inspectorTeacherDetails.profile.level')}</label>
              <div className="mt-1 text-gray-900">{teacher.level}</div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">{t('inspectorTeacherDetails.profile.institution')}</label>
              <div className="mt-1 text-gray-900">{teacher.work_institution}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">{t('inspectorTeacherDetails.profile.position')}</label>
              <div className="mt-1 text-gray-900">{teacher.position}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">{t('inspectorTeacherDetails.profile.grade')}</label>
              <div className="mt-1 text-gray-900">{teacher.grade}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">{t('inspectorTeacherDetails.profile.appointmentDate')}</label>
              <div className="mt-1 text-gray-900">
                {new Date(teacher.appointment_date).toLocaleDateString(i18n.language)}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'lessons' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('inspectorTeacherDetails.lessonPlans.table.number')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('inspectorTeacherDetails.lessonPlans.table.objectives')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('inspectorTeacherDetails.lessonPlans.table.status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('inspectorTeacherDetails.lessonPlans.table.remarks')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('inspectorTeacherDetails.lessonPlans.table.date')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lessonPlans.map((lesson) => (
                <tr key={lesson.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{lesson.lesson_number}</td>
                  <td className="px-6 py-4">{lesson.objectives}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      lesson.completion_status
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {lesson.completion_status 
                        ? t('inspectorTeacherDetails.lessonPlans.status.completed')
                        : t('inspectorTeacherDetails.lessonPlans.status.pending')
                      }
                    </span>
                  </td>
                  <td className="px-6 py-4">{lesson.remarks}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(lesson.created_at).toLocaleDateString(i18n.language)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {lessonPlans.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              {t('inspectorTeacherDetails.lessonPlans.noPlans')}
            </div>
          )}
        </div>
      )}

      {activeTab === 'absences' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('inspectorTeacherDetails.absences.table.date')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('inspectorTeacherDetails.absences.table.motifAr')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('inspectorTeacherDetails.absences.table.motifFr')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('inspectorTeacherDetails.absences.table.remarks')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {absences.map((absence) => (
                <tr key={absence.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(absence.absence_date).toLocaleDateString(i18n.language)}
                  </td>
                  <td className="px-6 py-4">{absence.motif.motif_label_ar}</td>
                  <td className="px-6 py-4">{absence.motif.motif_label_fr}</td>
                  <td className="px-6 py-4">{absence.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {absences.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              {t('inspectorTeacherDetails.absences.noAbsences')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
