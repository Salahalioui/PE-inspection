import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Absence as AbsenceType, AbsenceMotif } from '../../lib/supabase';

type AbsenceWithMotif = AbsenceType & { motif?: AbsenceMotif, isNew?: boolean };

export function AbsenceTracker() {
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
      ]).then(() => setLoading(false));
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
      
      // Transform the data to match our expected type
      const formattedData = data?.map(item => ({
        ...item,
        motif: item.absence_motif as unknown as AbsenceMotif,
        absence_motif_id: item.absence_motif_id as string
      })) || [];
      
      setAbsences(formattedData);
    } catch (error) {
      console.error('Error loading absences:', error);
      setMessage({ text: 'Failed to load absence data', type: 'error' });
    }
  }

  async function loadMotifs() {
    try {
      const { data, error } = await supabase
        .from('absence_motifs')
        .select('*')
        .order('motif_label_fr', { ascending: true });

      if (error) throw error;
      setMotifs(data || []);
    } catch (error) {
      console.error('Error loading motifs:', error);
      setMessage({ text: 'Failed to load absence motifs', type: 'error' });
    }
  }

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
    if (window.confirm('Are you sure you want to delete this absence record?')) {
      try {
        const { error } = await supabase
          .from('absences')
          .delete()
          .eq('id', absenceId);

        if (error) throw error;

        setAbsences(absences.filter(absence => absence.id !== absenceId));
        setMessage({ text: 'Absence record deleted successfully', type: 'success' });
      } catch (error) {
        console.error('Error deleting absence:', error);
        setMessage({ text: 'Failed to delete absence record', type: 'error' });
      }
    }
  };

  const handleSaveAbsence = async () => {
    if (!editingAbsence) return;

    try {
      const { absence_date, absence_motif_id, remarks } = editingAbsence;

      if (!absence_date || !absence_motif_id) {
        setMessage({ text: 'Please fill in all required fields', type: 'error' });
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
          // Transform the data to match our expected type
          const formattedData = data.map(item => ({
            ...item,
            motif: item.absence_motif as unknown as AbsenceMotif,
            absence_motif_id: item.absence_motif_id as string
          }));
          
          setAbsences([...formattedData, ...absences]);
          setMessage({ text: 'Absence record added successfully', type: 'success' });
        }
      } else {
        // Update existing absence record
        const { data, error } = await supabase
          .from('absences')
          .update({
            absence_date,
            absence_motif_id,
            remarks,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAbsence.id)
          .select(`
            *,
            absence_motif:absence_motif_id(id, motif_label_ar, motif_label_fr)
          `);

        if (error) throw error;

        if (data && data.length > 0) {
          // Transform the data to match our expected type
          const formattedData = data.map(item => ({
            ...item,
            motif: item.absence_motif as unknown as AbsenceMotif,
            absence_motif_id: item.absence_motif_id as string
          }))[0];
          
          setAbsences(
            absences.map(absence =>
              absence.id === editingAbsence.id ? formattedData : absence
            )
          );
          setMessage({ text: 'Absence record updated successfully', type: 'success' });
        }
      }

      setIsModalOpen(false);
      setEditingAbsence(null);
    } catch (error) {
      console.error('Error saving absence:', error);
      setMessage({ text: 'Failed to save absence record', type: 'error' });
    }
  };

  if (loading) {
    return <div className="flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Absence Records</h2>
        <button
          onClick={handleAddAbsence}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Absence
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
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Motif
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remarks
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {absences.map((absence) => (
                <tr key={absence.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {new Date(absence.absence_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {absence.motif?.motif_label_fr || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {absence.remarks || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditAbsence(absence)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAbsence(absence.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
          No absence records yet. Click "Add Absence" to create your first record.
        </div>
      )}

      {/* Modal for adding/editing absence records */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingAbsence?.isNew ? 'Add Absence Record' : 'Edit Absence Record'}
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="absenceDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Absence Date
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
                  Absence Motif
                </label>
                <select
                  id="absenceMotif"
                  value={editingAbsence?.absence_motif_id || ''}
                  onChange={(e) => setEditingAbsence(prev => prev ? { ...prev, absence_motif_id: e.target.value } : null)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select a motif</option>
                  {motifs.map(motif => (
                    <option key={motif.id} value={motif.id}>
                      {motif.motif_label_fr} ({motif.motif_label_ar})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks (Optional)
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
                Cancel
              </button>
              <button
                onClick={handleSaveAbsence}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}