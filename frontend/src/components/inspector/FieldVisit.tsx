import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Teacher {
  id: string;
  full_name: string;
  work_institution: string;
}

interface FieldVisitReport {
  teacher_profile_id: string;
  visit_date: string;
  report_content: string;
  additional_comments: string;
}

export function FieldVisit() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  
  const [report, setReport] = useState<FieldVisitReport>({
    teacher_profile_id: '',
    visit_date: new Date().toISOString().split('T')[0],
    report_content: '',
    additional_comments: ''
  });

  // RTL support
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    fetchTeachers();
  }, []);

  async function fetchTeachers() {
    try {
      const { data, error } = await supabase
        .from('teacher_profiles')
        .select('id, full_name, work_institution')
        .order('full_name');

      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSubmitting(true);
      const { error } = await supabase.from('field_visit_reports').insert({
        teacher_profile_id: selectedTeacher,
        inspector_id: user.id,
        visit_date: report.visit_date,
        report_content: report.report_content,
        additional_comments: report.additional_comments
      });

      if (error) throw error;

      navigate('/inspector/visits');
    } catch (error) {
      console.error('Error submitting field visit report:', error);
      alert(t('fieldVisit.messages.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleTeacherSelect = (teacherProfileId: string) => {
    setSelectedTeacher(teacherProfileId);
    setReport(prev => ({ ...prev, teacher_profile_id: teacherProfileId }));
  };

  if (loading) {
    return <div className="text-center py-8">{t('common.loading')}</div>;
  }

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      <h2 className="text-xl font-semibold text-gray-800">{t('fieldVisit.title')}</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="teacher" className="block text-sm font-medium text-gray-700">
              {t('fieldVisit.form.selectTeacher.label')}
            </label>
            <select
              id="teacher"
              value={selectedTeacher}
              onChange={(e) => handleTeacherSelect(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              required
            >
              <option value="">{t('fieldVisit.form.selectTeacher.placeholder')}</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.full_name} - {teacher.work_institution}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="visit-date" className="block text-sm font-medium text-gray-700">
              {t('fieldVisit.form.visitDate')}
            </label>
            <input
              type="date"
              id="visit-date"
              value={report.visit_date}
              onChange={(e) => setReport(prev => ({ ...prev, visit_date: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="report-content" className="block text-sm font-medium text-gray-700">
              {t('fieldVisit.form.reportContent.label')}
            </label>
            <textarea
              id="report-content"
              rows={6}
              value={report.report_content}
              onChange={(e) => setReport(prev => ({ ...prev, report_content: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder={t('fieldVisit.form.reportContent.placeholder')}
              required
            />
          </div>

          <div>
            <label htmlFor="additional-comments" className="block text-sm font-medium text-gray-700">
              {t('fieldVisit.form.additionalComments.label')}
            </label>
            <textarea
              id="additional-comments"
              rows={3}
              value={report.additional_comments}
              onChange={(e) => setReport(prev => ({ ...prev, additional_comments: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder={t('fieldVisit.form.additionalComments.placeholder')}
            />
          </div>
        </div>

        <div className={`flex ${isRTL ? 'justify-start space-x-reverse' : 'justify-end'} space-x-3`}>
          <button
            type="button"
            onClick={() => navigate('/inspector/visits')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {t('fieldVisit.buttons.cancel')}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              submitting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? t('fieldVisit.buttons.submitting') : t('fieldVisit.buttons.submit')}
          </button>
        </div>
      </form>
    </div>
  );
}
