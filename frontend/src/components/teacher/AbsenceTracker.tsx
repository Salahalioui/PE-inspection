import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Absence as AbsenceType, AbsenceMotif } from '../../lib/supabase';

type AbsenceWithMotif = AbsenceType & { motif?: AbsenceMotif, isNew?: boolean };

export function AbsenceTracker() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [absences, setAbsences] = useState<AbsenceWithMotif[]>([]);
  const [motifs, setMotifs] = useState<AbsenceMotif[]>([]);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [editingAbsence, setEditingAbsence] = useState<AbsenceWithMotif | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      Promise.all([
        loadAbsences(),
        loadMotifs()
      ]).then(() => {
        setLoading(false);
      });
    }
  }, [user]);

  async function loadAbsences() {
    try {
      const { data, error } = await supabase
        .from('absences')
        .select(`
          *,
          absence_motif:absence_motif_id(id, motif_label_ar, motif_label_fr)
        `)
        .eq('teacher_id', user?.id)
        .order('absence_date', { ascending: false });

      if (error) throw error;
      
      const formattedData = data?.map(item => ({
        ...item,
        motif: item.absence_motif as unknown as AbsenceMotif,
        absence_motif_id: item.absence_motif_id as string
      })) || [];
      
      setAbsences(formattedData);
    } catch (error) {
      console.error('Error loading absences:', error);
      setMessage({ text: t('absenceTracker.messages.loadError'), type: 'error' });
    }
  }

  async function loadMotifs() {
    try {
      const { data, error } = await supabase
        .from('absence_motifs')
        .select('id, motif_label_fr, motif_label_ar, created_at, updated_at')
        .order('motif_label_fr', { ascending: true });

      if (error) throw error;
      setMotifs(data || []);
    } catch (error) {
      console.error('Error loading motifs:', error);
      setMessage({ text: t('absenceTracker.messages.loadMotifsError'), type: 'error' });
    }
  }

  const getMotifLabel = (motif?: AbsenceMotif) => {
    if (!motif) return '-';
    return i18n.language.startsWith('ar') ? motif.motif_label_ar : motif.motif_label_fr;
  };

  const handleAddAbsence = () => {
    const newAbsence: AbsenceWithMotif = {
      id: `new-${Date.now()}`,
      teacher_id: user?.id || '',
      absence_date: new Date().toISOString().split('T')[0],
      absence_motif_id: '',
      remarks: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isNew: true
    };
    setEditingAbsence(newAbsence);
    setIsModalOpen(true);
  };

  const handleEditAbsence = (absence: AbsenceWithMotif) => {
    setEditingAbsence(absence);
    setIsModalOpen(true);
  };

  const handleDeleteAbsence = async (absenceId: string) => {
    if (window.confirm(t('absenceTracker.messages.deleteConfirm'))) {
      try {
        const { error } = await supabase
          .from('absences')
          .delete()
          .eq('id', absenceId);

        if (error) throw error;

        setAbsences(absences.filter(absence => absence.id !== absenceId));
        setMessage({ text: t('absenceTracker.messages.deleteSuccess'), type: 'success' });
      } catch (error) {
        console.error('Error deleting absence:', error);
        setMessage({ text: t('absenceTracker.messages.deleteError'), type: 'error' });
      }
    }
  };

  const handleSaveAbsence = async () => {
    if (!editingAbsence) return;

    try {
      const { absence_date, absence_motif_id, remarks } = editingAbsence;

      if (!absence_date || !absence_motif_id) {
        setMessage({ text: t('absenceTracker.messages.fillRequired'), type: 'error' });
        return;
      }

      if (editingAbsence.isNew) {
        // Create new absence record
        const { data, error } = await supabase
          .from('absences')
          .insert({
            teacher_id: user?.id,
            absence_date,
            absence_motif_id,
            remarks
          })
          .select(`
            *,
            absence_motif:absence_motif_id(id, motif_label_ar, motif_label_fr)
          `);

        if (error) throw error;

        if (data && data.length > 0) {
          const formattedData = data.map(item => ({
            ...item,
            motif: item.absence_motif as unknown as AbsenceMotif,
            absence_motif_id: item.absence_motif_id as string
          }))[0];
          setAbsences([formattedData, ...absences]);
          setMessage({ text: t('absenceTracker.messages.saveSuccess'), type: 'success' });
        }
      } else {
        // Update existing absence record
        const { error } = await supabase
          .from('absences')
          .update({
            absence_date,
            absence_motif_id,
            remarks,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAbsence.id);

        if (error) throw error;

        const updatedMotif = motifs.find(m => m.id === absence_motif_id);
        const updatedAbsence = {
          ...editingAbsence,
          absence_date,
          absence_motif_id,
          motif: updatedMotif,
          remarks,
          updated_at: new Date().toISOString()
        };

        setAbsences(
          absences.map(absence =>
            absence.id === editingAbsence.id ? updatedAbsence : absence
          )
        );
        setMessage({ text: t('absenceTracker.messages.updateSuccess'), type: 'success' });
      }

      setIsModalOpen(false);
      setEditingAbsence(null);
    } catch (error) {
      console.error('Error saving absence:', error);
      setMessage({ text: t('absenceTracker.messages.saveError'), type: 'error' });
    }
  };

  if (loading) {
    return <div className="flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{t('absenceTracker.title')}</h2>
        <button
          onClick={handleAddAbsence}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {t('absenceTracker.addAbsence')}
        </button>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {absences.length > 0 ? (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('absenceTracker.table.date')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('absenceTracker.table.motif')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('absenceTracker.table.remarks')}
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('absenceTracker.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {absences.map((absence) => (
                <tr key={absence.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {new Date(absence.absence_date).toLocaleDateString(i18n.language)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {getMotifLabel(absence.motif)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {absence.remarks || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditAbsence(absence)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => handleDeleteAbsence(absence.id)}
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
          {t('absenceTracker.noAbsences')}
        </div>
      )}

      {/* Modal for adding/editing absence records */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingAbsence?.isNew ? t('absenceTracker.addAbsence') : t('absenceTracker.editAbsence')}
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="absenceDate" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('absenceTracker.fields.date')}
                </label>
                <input
                  id="absenceDate"
                  type="date"
                  value={editingAbsence?.absence_date || ''}
                  onChange={(e) => setEditingAbsence(prev => prev ? { ...prev, absence_date: e.target.value } : null)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="absenceMotif" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('absenceTracker.fields.motif')}
                </label>
                <select
                  id="absenceMotif"
                  value={editingAbsence?.absence_motif_id || ''}
                  onChange={(e) => setEditingAbsence(prev => prev ? { ...prev, absence_motif_id: e.target.value } : null)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  <option value="">{t('absenceTracker.form.selectMotif')}</option>
                  {motifs.map(motif => (
                    <option key={motif.id} value={motif.id}>
                      {getMotifLabel(motif)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('absenceTracker.fields.remarks')} ({t('common.optional')})
                </label>
                <textarea
                  id="remarks"
                  value={editingAbsence?.remarks || ''}
                  onChange={(e) => setEditingAbsence(prev => prev ? { ...prev, remarks: e.target.value } : null)}
                  rows={2}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingAbsence(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSaveAbsence}
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
