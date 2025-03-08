import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { LessonPlan as LessonPlanType } from '../../lib/supabase';

type LessonPlanWithId = LessonPlanType & { isNew?: boolean };

export function LessonPlans() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [lessonPlans, setLessonPlans] = useState<LessonPlanWithId[]>([]);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [editingPlan, setEditingPlan] = useState<LessonPlanWithId | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadLessonPlans();
    }
  }, [user]);

  async function loadLessonPlans() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lesson_plans')
        .select('*')
        .eq('teacher_id', user?.id)
        .order('lesson_number', { ascending: true });

      if (error) throw error;
      setLessonPlans(data || []);
    } catch (error) {
      console.error('Error loading lesson plans:', error);
      setMessage({ text: t('lessonPlans.messages.loadError'), type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  const handleAddPlan = () => {
    // Find the highest lesson number to suggest the next one
    const highestLessonNumber = lessonPlans.length > 0
      ? Math.max(...lessonPlans.map(plan => plan.lesson_number))
      : 0;

    const newPlan: LessonPlanWithId = {
      id: `new-${Date.now()}`,
      teacher_id: user?.id || '',
      lesson_number: highestLessonNumber + 1,
      objectives: '',
      completion_status: false,
      remarks: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isNew: true
    };
    setEditingPlan(newPlan);
    setIsModalOpen(true);
  };

  const handleEditPlan = (plan: LessonPlanWithId) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleDeletePlan = async (planId: string) => {
    if (window.confirm(t('lessonPlans.messages.deleteConfirm'))) {
      try {
        const { error } = await supabase
          .from('lesson_plans')
          .delete()
          .eq('id', planId);

        if (error) throw error;

        setLessonPlans(lessonPlans.filter(plan => plan.id !== planId));
        setMessage({ text: t('lessonPlans.messages.deleteSuccess'), type: 'success' });
      } catch (error) {
        console.error('Error deleting lesson plan:', error);
        setMessage({ text: t('lessonPlans.messages.deleteError'), type: 'error' });
      }
    }
  };

  const handleToggleCompletion = async (plan: LessonPlanWithId) => {
    try {
      const updatedStatus = !plan.completion_status;
      
      const { error } = await supabase
        .from('lesson_plans')
        .update({
          completion_status: updatedStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', plan.id);

      if (error) throw error;

      setLessonPlans(
        lessonPlans.map(p =>
          p.id === plan.id
            ? { ...p, completion_status: updatedStatus, updated_at: new Date().toISOString() }
            : p
        )
      );
      
      setMessage({ 
        text: t('lessonPlans.messages.statusUpdate', {
          number: plan.lesson_number,
          status: updatedStatus ? t('lessonPlans.status.completed') : t('lessonPlans.status.notCompleted')
        }), 
        type: 'success' 
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
      
    } catch (error) {
      console.error('Error updating lesson plan status:', error);
      setMessage({ text: t('lessonPlans.messages.statusUpdateError'), type: 'error' });
    }
  };

  const handleSavePlan = async () => {
    if (!editingPlan) return;

    try {
      const { lesson_number, objectives, completion_status, remarks } = editingPlan;

      if (!lesson_number || !objectives) {
        setMessage({ text: t('lessonPlans.messages.fillRequired'), type: 'error' });
        return;
      }

      if (editingPlan.isNew) {
        // Create new lesson plan
        const { data, error } = await supabase
          .from('lesson_plans')
          .insert({
            teacher_id: user?.id,
            lesson_number,
            objectives,
            completion_status: completion_status || false,
            remarks
          })
          .select();

        if (error) throw error;

        if (data && data.length > 0) {
          setLessonPlans([...lessonPlans, data[0]]);
          setMessage({ text: t('lessonPlans.messages.saveSuccess'), type: 'success' });
        }
      } else {
        // Update existing lesson plan
        const { error } = await supabase
          .from('lesson_plans')
          .update({
            lesson_number,
            objectives,
            completion_status: completion_status || false,
            remarks,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingPlan.id);

        if (error) throw error;

        setLessonPlans(
          lessonPlans.map(plan =>
            plan.id === editingPlan.id
              ? { 
                  ...plan, 
                  lesson_number, 
                  objectives, 
                  completion_status: completion_status || false, 
                  remarks, 
                  updated_at: new Date().toISOString() 
                }
              : plan
          )
        );
        setMessage({ text: t('lessonPlans.messages.updateSuccess'), type: 'success' });
      }

      setIsModalOpen(false);
      setEditingPlan(null);
    } catch (error) {
      console.error('Error saving lesson plan:', error);
      setMessage({ text: t('lessonPlans.messages.saveError'), type: 'error' });
    }
  };

  if (loading) {
    return <div className="flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{t('lessonPlans.title')}</h2>
        <button
          onClick={handleAddPlan}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {t('lessonPlans.addPlan')}
        </button>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {lessonPlans.length > 0 ? (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('lessonPlans.table.lessonNumber')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('lessonPlans.table.objectives')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('lessonPlans.table.status')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('lessonPlans.table.remarks')}
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('lessonPlans.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lessonPlans.map((plan) => (
                <tr key={plan.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {plan.lesson_number}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {plan.objectives}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button 
                      onClick={() => handleToggleCompletion(plan)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${plan.completion_status ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                    >
                      {plan.completion_status ? t('lessonPlans.status.completed') : t('lessonPlans.status.notCompleted')}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {plan.remarks || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditPlan(plan)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      {t('common.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
          {t('lessonPlans.noPlans')}
        </div>
      )}

      {/* Modal for adding/editing lesson plans */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingPlan?.isNew ? t('lessonPlans.addPlan') : t('lessonPlans.editPlan')}
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="lessonNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('lessonPlans.fields.lessonNumber')}
                </label>
                <input
                  id="lessonNumber"
                  type="number"
                  value={editingPlan?.lesson_number || ''}
                  onChange={(e) => setEditingPlan(prev => prev ? { ...prev, lesson_number: parseInt(e.target.value) } : null)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="objectives" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('lessonPlans.fields.objectives')}
                </label>
                <textarea
                  id="objectives"
                  value={editingPlan?.objectives || ''}
                  onChange={(e) => setEditingPlan(prev => prev ? { ...prev, objectives: e.target.value } : null)}
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  id="completionStatus"
                  type="checkbox"
                  checked={editingPlan?.completion_status || false}
                  onChange={(e) => setEditingPlan(prev => prev ? { ...prev, completion_status: e.target.checked } : null)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="completionStatus" className="ml-2 block text-sm text-gray-700">
                  {t('lessonPlans.fields.completionStatus')}
                </label>
              </div>
              <div>
                <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('lessonPlans.fields.remarks')} ({t('common.optional')})
                </label>
                <textarea
                  id="remarks"
                  value={editingPlan?.remarks || ''}
                  onChange={(e) => setEditingPlan(prev => prev ? { ...prev, remarks: e.target.value } : null)}
                  rows={2}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingPlan(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSavePlan}
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
