import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { TeacherProfileType } from '../../lib/types';

export function TeacherProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [profileExists, setProfileExists] = useState(false);
  
  // Personal Information
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  
  // Professional Information
  const [jobTitle, setJobTitle] = useState('');
  const [level, setLevel] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [workInstitution, setWorkInstitution] = useState('');
  const [position, setPosition] = useState('');
  const [grade, setGrade] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [confirmationDate, setConfirmationDate] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [certificateObtained, setCertificateObtained] = useState('');

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('teacher_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
          throw error;
        }
        
        if (data) {
          setProfileExists(true);
          // Personal Information
          setFullName(data.full_name || '');
          setDateOfBirth(data.date_of_birth || '');
          
          // Professional Information
          setJobTitle(data.job_title || '');
          setLevel(data.level || '');
          setFirstName(data.first_name || '');
          setLastName(data.last_name || '');
          setWorkInstitution(data.work_institution || '');
          setPosition(data.position || '');
          setGrade(data.grade || '');
          setAppointmentDate(data.appointment_date || '');
          setConfirmationDate(data.confirmation_date || '');
          setMaritalStatus(data.marital_status || '');
          setCertificateObtained(data.certificate_obtained || '');
        } else {
          setProfileExists(false);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setMessage({ text: 'Failed to load profile data', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
    
    loadProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      const profileData: Partial<TeacherProfileType> = {
        user_id: user.id,
        // Personal Information
        full_name: fullName,
        date_of_birth: dateOfBirth || undefined,
        
        // Professional Information
        job_title: jobTitle,
        level: level || undefined,
        first_name: firstName,
        last_name: lastName,
        work_institution: workInstitution,
        position: position || undefined,
        grade: grade || undefined,
        appointment_date: appointmentDate || undefined,
        confirmation_date: confirmationDate || undefined,
        marital_status: maritalStatus || undefined,
        certificate_obtained: certificateObtained || undefined,
      };
      
      let error;
      
      if (profileExists) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('teacher_profiles')
          .update(profileData)
          .eq('user_id', user.id);
        error = updateError;
      } else {
        // Create new profile
        const { error: insertError } = await supabase
          .from('teacher_profiles')
          .insert([profileData]);
        error = insertError;
        if (!insertError) {
          setProfileExists(true);
        }
      }
      
      if (error) throw error;
      
      setMessage({ 
        text: profileExists ? 'Profile updated successfully' : 'Profile created successfully', 
        type: 'success' 
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ 
        text: profileExists ? 'Failed to update profile' : 'Failed to create profile', 
        type: 'error' 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Teacher Profile</h2>
      
      {message && (
        <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information Section */}
        <div>
          <h3 className="text-lg font-medium mb-4 pb-2 border-b">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
        
        {/* Professional Information Section */}
        <div>
          <h3 className="text-lg font-medium mb-4 pb-2 border-b">Professional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Job Title (الوظيفة)
              </label>
              <input
                id="jobTitle"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                Level (المستوى)
              </label>
              <input
                id="level"
                type="text"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name (الاسم)
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name (اللقب)
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="workInstitution" className="block text-sm font-medium text-gray-700 mb-1">
                Work Institution (مؤسسة العمل)
              </label>
              <input
                id="workInstitution"
                type="text"
                value={workInstitution}
                onChange={(e) => setWorkInstitution(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                Position (الصفة)
              </label>
              <input
                id="position"
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                Grade (الدرجة)
              </label>
              <input
                id="grade"
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 mb-1">
                Appointment Date (تاريخ التعيين)
              </label>
              <input
                id="appointmentDate"
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="confirmationDate" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmation Date (تاريخ الترسيم)
              </label>
              <input
                id="confirmationDate"
                type="date"
                value={confirmationDate}
                onChange={(e) => setConfirmationDate(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700 mb-1">
                Marital Status (الحالة العائلية)
              </label>
              <select
                id="maritalStatus"
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="certificateObtained" className="block text-sm font-medium text-gray-700 mb-1">
                Certificate Obtained (الشهادة المحصل عليها)
              </label>
              <input
                id="certificateObtained"
                type="text"
                value={certificateObtained}
                onChange={(e) => setCertificateObtained(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : (profileExists ? 'Update Profile' : 'Create Profile')}
          </button>
        </div>
      </form>
    </div>
  );
}
