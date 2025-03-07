import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface TeacherProfile {
  id: string;
  full_name: string;
  work_institution: string;
}

interface DatabaseVisitReport {
  id: string;
  visit_date: string;
  report_content: string;
  additional_comments: string;
  created_at: string;
  teacher_profile: {
    id: string;
    full_name: string;
    work_institution: string;
  };
}

interface FieldVisitReport {
  id: string;
  visit_date: string;
  report_content: string;
  additional_comments: string;
  created_at: string;
  teacher: TeacherProfile;
}

export function FieldVisitList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<FieldVisitReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

type SupabaseResponse = {
  id: string;
  visit_date: string;
  report_content: string | null;
  additional_comments: string | null;
  created_at: string;
  teacher_profile: {
    id: string;
    full_name: string;
    work_institution: string;
  };
}

  async function fetchReports() {
    try {
      const { data, error } = await supabase
        .from('field_visit_reports')
        .select(`
          id,
          visit_date,
          report_content,
          additional_comments,
          created_at,
          teacher_profile:teacher_profiles!inner (
            id,
            full_name,
            work_institution
          )
        `)
        .eq('inspector_id', user?.id)
        .order('visit_date', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our FieldVisitReport interface
      // Cast the raw data to unknown first, then to our expected type
      const rawData = data as unknown as SupabaseResponse[];
      const typedData = (rawData || []).map(item => ({
        id: item.id,
        visit_date: item.visit_date,
        report_content: item.report_content || '',
        additional_comments: item.additional_comments || '',
        created_at: item.created_at,
        teacher: item.teacher_profile ? {
          id: item.teacher_profile.id,
          full_name: item.teacher_profile.full_name,
          work_institution: item.teacher_profile.work_institution
        } : {
          id: '',
          full_name: '',
          work_institution: ''
        }
      })) as FieldVisitReport[];

      setReports(typedData);
    } catch (error) {
      console.error('Error fetching field visit reports:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesText = 
      (report.teacher?.full_name || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (report.teacher?.work_institution || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (report.report_content || '').toLowerCase().includes(filterText.toLowerCase());

    const matchesDate = !dateFilter || report.visit_date === dateFilter;

    return matchesText && matchesDate;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Field Visit Reports</h2>
        <button
          onClick={() => navigate('/inspector/visits/new')}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          New Visit Report
        </button>
      </div>

      <div className="flex space-x-4 mb-6">
        <input
          type="text"
          placeholder="Search reports..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-md">
          {filteredReports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No field visit reports found
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <li key={report.id} className="p-6 hover:bg-gray-50">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {report.teacher?.full_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {report.teacher?.work_institution}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          Visit Date: {new Date(report.visit_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-700">
                      <p className="font-medium mb-2">Report Content:</p>
                      <p className="whitespace-pre-line">{report.report_content}</p>
                    </div>
                    
                    {report.additional_comments && (
                      <div className="text-sm text-gray-700">
                        <p className="font-medium mb-2">Additional Comments:</p>
                        <p className="whitespace-pre-line">{report.additional_comments}</p>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
