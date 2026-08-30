import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Clock, Award, XCircle, AlertCircle, FileText,
  Eye, EyeOff, Upload, Phone, Mail, MapPin, User, Calendar,
  GraduationCap, Shield, Lock, Key, Copy, Check, ExternalLink,
  RefreshCw, Loader2, Sparkles, Building2, HelpCircle, ArrowRight,
  CreditCard, LayoutDashboard, PhoneCall, Home, UserCheck, Users, Settings
} from 'lucide-react';
import IcteLogo from './IcteLogo';
import IDCard from './IDCard';

const API = 'https://ictehub.onrender.com';

const REQUIRED_DOC_TYPES = [
  { type: 'passport_photo', label: 'Passport Size Photograph', required: true },
  { type: 'marksheet_10th', label: 'Class 10th Marksheet', required: true },
  { type: 'marksheet_12th', label: 'Class 12th Marksheet', required: true },
  { type: 'id_proof', label: 'Government ID Proof (Aadhaar/PAN)', required: true },
  { type: 'category_certificate', label: 'Category / Caste Certificate', required: false },
  { type: 'transfer_certificate', label: 'Transfer Certificate (TC)', required: false },
  { type: 'migration_certificate', label: 'Migration Certificate', required: false },
];

/**
 * Helper to render value or "Not provided" in gray italic
 */
function renderVal(val) {
  if (val === null || val === undefined || String(val).trim() === '') {
    return <span className="text-slate-400 italic font-normal">Not provided</span>;
  }
  return <span className="font-bold text-slate-900">{String(val)}</span>;
}

/**
 * Helper to format DOB string into DD/MM/YYYY
 */
function formatDobDate(dobStr) {
  if (!dobStr) return null;
  const str = String(dobStr).trim();
  
  // YYYY-MM-DD
  const ymd = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymd) {
    return `${ymd[3].padStart(2, '0')}/${ymd[2].padStart(2, '0')}/${ymd[1]}`;
  }
  
  // DDMMYYYY
  if (/^\d{8}$/.test(str)) {
    return `${str.slice(0, 2)}/${str.slice(2, 4)}/${str.slice(4)}`;
  }

  // DD-MM-YYYY
  const dmy = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmy) {
    return `${dmy[1].padStart(2, '0')}/${dmy[2].padStart(2, '0')}/${dmy[3]}`;
  }

  return str;
}

/**
 * Helper to format Aadhaar as XXXX-XXXX-1234
 */
function formatAadhaarNumber(aadhaarStr) {
  if (!aadhaarStr) return null;
  const cleaned = String(aadhaarStr).replace(/\D/g, '');
  if (cleaned.length >= 4) {
    return `XXXX-XXXX-${cleaned.slice(-4)}`;
  }
  return cleaned.length > 0 ? cleaned : null;
}

/**
 * Helper to format Address object as "123 Street, City, District, State - PIN"
 */
function formatAddress(addr) {
  if (!addr || typeof addr !== 'object') return null;
  const line1 = addr.address_line_1 ? addr.address_line_1.trim() : '';
  const line2 = addr.address_line_2 ? addr.address_line_2.trim() : '';
  const city = addr.city ? addr.city.trim() : '';
  const district = addr.district ? addr.district.trim() : '';
  const state = addr.state ? addr.state.trim() : '';
  const pin = addr.pincode ? addr.pincode.trim() : '';

  const street = [line1, line2].filter(Boolean).join(', ');
  const mainParts = [street, city, district].filter(Boolean);
  
  let statePin = '';
  if (state && pin) statePin = `${state} - ${pin}`;
  else if (state) statePin = state;
  else if (pin) statePin = `PIN: ${pin}`;

  if (statePin) mainParts.push(statePin);
  
  return mainParts.length > 0 ? mainParts.join(', ') : null;
}

export default function StudentDashboard({ user, handleLogout }) {
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tab navigation state
  const [activeTab, setActiveTab] = useState('all');

  // Aadhaar masking
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [copiedAppId, setCopiedAppId] = useState(false);

  // Document upload state
  const [uploadingType, setUploadingType] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  // Password change state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const token = localStorage.getItem('token');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      if (!token) {
        navigate('/login');
        return;
      }

      // 1. Fetch Student Application (Relational Schema with fallback)
      let appData = null;
      try {
        const relationalRes = await fetch(`${API}/admission-applications/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (relationalRes.ok) {
          const relData = await relationalRes.json();
          if (relData && relData.id) {
            // Map relational fields into both top-level and admission_form_data for complete compatibility
            appData = {
              ...relData,
              name: relData.full_name || relData.name,
              phone: relData.primary_mobile || relData.phone,
              email: relData.email,
              admission_form_data: {
                full_name: relData.full_name,
                father_name: relData.father_name,
                mother_name: relData.mother_name,
                dob: relData.dob,
                gender: relData.gender,
                nationality: relData.nationality,
                blood_group: relData.blood_group,
                aadhaar_number: relData.aadhaar_number,
                photo_url: relData.photo_url,
                primary_mobile: relData.primary_mobile,
                alternate_mobile: relData.alternate_mobile,
                email: relData.email,
                program_type: relData.program_type,
                course: relData.course,
                specialization: relData.specialization,
                preferred_college_type: relData.preferred_college_type,
                academic_session: relData.academic_session,
                category: relData.category,
                permanent_address: {
                  address_line_1: relData.perm_address_line1 || '',
                  address_line_2: relData.perm_address_line2 || '',
                  city: relData.perm_city || '',
                  district: relData.perm_district || '',
                  state: relData.perm_state || '',
                  pincode: relData.perm_pin || '',
                },
                same_as_permanent: relData.corr_same_as_perm !== false,
                correspondence_address: {
                  address_line_1: relData.corr_address_line1 || '',
                  address_line_2: relData.corr_address_line2 || '',
                  city: relData.corr_city || '',
                  district: relData.corr_district || '',
                  state: relData.corr_state || '',
                  pincode: relData.corr_pin || '',
                },
                guardian_name: relData.guardian_name,
                guardian_relationship: relData.guardian_relationship,
                guardian_mobile: relData.guardian_mobile,
                hostel_required: relData.hostel_required ? 'Yes' : 'No',
                hostel_location: relData.hostel_location,
                scholarship_required: relData.scholarship_required ? 'Yes' : 'No',
                hear_about_us: relData.heard_about_us,
                qualifications: (relData.qualifications || relData.admission_qualifications || []).map((q, idx) => ({
                  id: q.id || `q_${idx}`,
                  level: q.examination,
                  board: q.board_institution,
                  institution: '',
                  year: q.year_of_passing,
                  stream: q.stream_subjects,
                  percentage: q.percentage_cgpa,
                  division: q.division,
                }))
              }
            };
          }
        }
      } catch (e) {
        console.warn('Relational fetch fallback trigger:', e);
      }

      if (!appData) {
        const appRes = await fetch(`${API}/leads/my-application`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!appRes.ok) {
          const errData = await appRes.json();
          throw new Error(errData.message || 'Failed to fetch application details.');
        }
        appData = await appRes.json();
      }

      setApplication(appData);

      // 2. Fetch Student Documents
      try {
        const docRes = await fetch(`${API}/admission-documents/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (docRes.ok) {
          const docData = await docRes.json();
          setDocuments(Array.isArray(docData) ? docData : []);
        }
      } catch (dErr) {
        console.error('Error fetching documents:', dErr);
      }

      // 3. Fetch Timeline Logs
      try {
        const timeRes = await fetch(`${API}/call-logs/my-timeline`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (timeRes.ok) {
          const timeData = await timeRes.json();
          setTimeline(Array.isArray(timeData) ? timeData : []);
        }
      } catch (tErr) {
        console.error('Error fetching timeline:', tErr);
      }

    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err.message || 'Unable to load dashboard data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const copyApplicationId = (id) => {
    if (!id) return;
    const ref = id.substring(0, 8).toUpperCase();
    navigator.clipboard.writeText(ref);
    setCopiedAppId(true);
    setTimeout(() => setCopiedAppId(false), 2500);
  };

  // Status mapping
  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return {
          label: 'Application Received ✓',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: <Clock size={16} className="text-blue-600" />,
          step: 1,
        };
      case 'contacted':
        return {
          label: 'Under Review',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <Clock size={16} className="text-amber-600" />,
          step: 2,
        };
      case 'interested':
        return {
          label: 'Shortlisted 🌟',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <Award size={16} className="text-emerald-600" />,
          step: 3,
        };
      case 'not-interested':
        return {
          label: 'Not Progressing',
          bg: 'bg-red-50 text-red-700 border-red-200',
          icon: <XCircle size={16} className="text-red-600" />,
          step: 1,
        };
      case 'enrolled-college':
      case 'enrolled-institute':
        return {
          label: 'Congratulations! Admitted 🎉',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: <Sparkles size={16} className="text-emerald-600" />,
          step: 4,
        };
      default:
        return {
          label: 'Application Received',
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: <Clock size={16} className="text-slate-600" />,
          step: 1,
        };
    }
  };

  // Document upload handler
  const handleDocumentUpload = async (docType, file) => {
    if (!file || !application?.id) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5MB limit. Please upload a smaller file.');
      return;
    }

    setUploadingType(docType);
    setUploadError('');
    setUploadSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'admission-document');

      // 1. POST /upload
      const uploadRes = await fetch(`${API}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.url) {
        throw new Error(uploadData.message || 'File upload failed');
      }

      // 2. Link via POST /admission-documents
      const docLinkRes = await fetch(`${API}/admission-documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          lead_id: application.id,
          document_type: docType,
          document_name: file.name,
          file_url: uploadData.url,
          file_size: file.size,
        }),
      });

      if (!docLinkRes.ok) {
        throw new Error('Failed to register document in portal');
      }

      const newDoc = await docLinkRes.json();
      setDocuments(prev => [newDoc, ...prev.filter(d => d.document_type !== docType)]);
      setUploadSuccess(`Uploaded ${file.name} successfully!`);
      setTimeout(() => setUploadSuccess(''), 4000);
    } catch (err) {
      console.error('Document upload error:', err);
      setUploadError(err.message || 'Error uploading document. Please try again.');
    } finally {
      setUploadingType(null);
    }
  };

  // Password change handler
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordData.current_password || !passwordData.new_password) {
      setPasswordError('Please fill in all password fields.');
      return;
    }

    if (passwordData.new_password.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    setChangingPassword(true);

    try {
      const res = await fetch(`${API}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      setPasswordSuccess('Password changed successfully! Keep your new password safe.');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setPasswordSuccess(''), 5000);
    } catch (err) {
      setPasswordError(err.message || 'Error changing password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 size={40} className="text-[#1E40FF] animate-spin mb-4" />
        <h3 className="text-base font-bold text-slate-800">Loading Student Dashboard...</h3>
        <p className="text-xs text-slate-500 mt-1">Connecting to Buddha College of Nursing portal</p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-extrabold text-slate-900 mb-2">Application Not Found</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
            {error || 'We could not find an admission application linked to this student account.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={fetchDashboardData}
              className="flex-1 py-3 bg-[#1E40FF] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all border-none cursor-pointer min-h-[44px]"
            >
              Retry
            </button>
            <button
              onClick={() => navigate('/apply')}
              className="flex-1 py-3 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-all border-none cursor-pointer min-h-[44px]"
            >
              Apply Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formData = application.admission_form_data || {};
  const statusInfo = getStatusBadge(application.status);
  const appIdShort = (application.id || '').substring(0, 8).toUpperCase();
  const appliedDate = application.created_at
    ? new Date(application.created_at).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';

  // Uploaded docs lookup map
  const uploadedMap = {};
  documents.forEach(d => {
    uploadedMap[d.document_type] = d;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-500/20 text-slate-700 pb-24 overflow-x-hidden w-full">
      
      {/* 1. Top Navbar (On mobile: logo + student initial avatar + logout button) */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Buddha College of Nursing" className="h-9 sm:h-10 w-auto object-contain" />
            <div className="hidden md:flex items-center gap-2 border-l border-slate-200 pl-3">
              <span className="text-xs font-black uppercase tracking-widest text-[#1E40FF] bg-blue-50 px-2 py-0.5 rounded-md">
                Student Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/student/profile')}
              className="flex items-center gap-2 py-1.5 px-2.5 sm:px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border-none cursor-pointer min-h-[44px]"
              title="Student Profile"
            >
              <div className="w-7 h-7 sm:w-6 sm:h-6 rounded-full bg-[#1E40FF] text-white flex items-center justify-center text-xs sm:text-[10px] font-black shrink-0">
                {(application.name || user?.name || 'S').slice(0, 2).toUpperCase()}
              </div>
              <span className="hidden md:inline text-sm">{application.name || user?.name || 'My Profile'}</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider text-red-600 hover:text-red-700 hover:bg-red-50 transition-all border-none bg-transparent cursor-pointer min-h-[44px] flex items-center"
            >
              Logout
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 space-y-6 sm:space-y-8 w-full">
        
        {/* 2. Welcome Header Card */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 bg-gradient-to-r from-blue-900 via-[#1E40FF] to-indigo-800 rounded-2xl md:rounded-3xl p-4 sm:p-8 text-white shadow-xl shadow-blue-500/10 relative overflow-hidden text-center md:text-left w-full">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 space-y-1.5 w-full md:w-auto">
            <div className="inline-flex items-center justify-center md:justify-start gap-1.5 text-xs font-extrabold uppercase tracking-widest bg-white/15 px-3 py-1 rounded-full text-blue-100 mb-1 border border-white/20">
              <Sparkles size={14} /> Admissions 2025-26
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
              Welcome, {application.name || 'Applicant'}!
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl font-medium leading-relaxed">
              Manage your Buddha College of Nursing application, view your institutional credentials, and track your admission status in real-time.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => {
                setActiveTab('idcard');
                const el = document.getElementById('student-id-card-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-3 rounded-xl bg-white text-[#1E40FF] hover:bg-blue-50 font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md cursor-pointer border-none flex items-center justify-center gap-1.5 min-h-[44px] w-full sm:w-auto"
            >
              <CreditCard size={16} /> Student ID Card
            </button>
            <button
              onClick={() => navigate('/student/profile')}
              className="px-4 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer border border-white/20 flex items-center justify-center gap-1.5 min-h-[44px] w-full sm:w-auto"
            >
              <User size={16} /> View Profile
            </button>
            <button
              onClick={fetchDashboardData}
              className="p-3 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer border border-white/20 flex items-center justify-center min-h-[44px] w-full sm:w-auto"
              title="Refresh Dashboard"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* Desktop Top Tabs Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar w-full">
          {[
            { id: 'all', label: 'Full Overview', icon: <LayoutDashboard size={15} /> },
            { id: 'idcard', label: 'Student ID Card', icon: <CreditCard size={15} />, badge: 'Official' },
            { id: 'overview', label: 'Application & Course', icon: <FileText size={15} /> },
            { id: 'documents', label: 'Documents', icon: <Upload size={15} />, count: documents.length },
            { id: 'security', label: 'Account Security', icon: <Lock size={15} /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer border min-h-[44px] ${
                  isActive
                    ? 'bg-[#1E40FF] text-white border-[#1E40FF] shadow-lg shadow-blue-500/20'
                    : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-[#1E40FF]' : 'bg-blue-100 text-[#1E40FF]'
                  }`}>
                    {tab.badge}
                  </span>
                )}
                {tab.count !== undefined && (
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 7. STUDENT ID CARD COMPONENT */}
        {(activeTab === 'all' || activeTab === 'idcard') && (
          <div id="student-id-card-section" className="w-full">
            <IDCard
              application={application}
              documents={documents}
              onNavigateToDocuments={() => {
                setActiveTab('documents');
                setTimeout(() => {
                  const el = document.getElementById('documents-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
            />
          </div>
        )}

        {/* 2. APPLICATION STATUS & JOURNEY CARD */}
        {(activeTab === 'all' || activeTab === 'overview') && (
        <section className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-8 space-y-6 w-full">
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="w-full flex flex-col items-center sm:items-start">
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 block mb-2">
                Application Status
              </span>
              <div className="flex items-center justify-center sm:justify-start">
                <span className={`px-5 py-2.5 rounded-full text-sm font-black border flex items-center justify-center gap-2 shadow-sm ${statusInfo.bg}`}>
                  {statusInfo.icon} {statusInfo.label}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs sm:text-sm w-full">
              <div className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 flex items-center gap-2 min-h-[44px]">
                <span className="text-slate-400 font-bold">App ID:</span>
                <span className="font-mono font-black text-slate-900 text-sm">{appIdShort}</span>
                <button
                  onClick={() => copyApplicationId(application.id)}
                  className="text-[#1E40FF] hover:text-blue-700 p-1.5 border-none bg-transparent cursor-pointer min-h-[44px] flex items-center"
                  title="Copy Application ID"
                >
                  {copiedAppId ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                </button>
              </div>
              <div className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 min-h-[44px] flex items-center">
                <span className="text-slate-400 font-bold mr-1">Applied:</span>
                <span className="font-bold text-slate-800 text-xs sm:text-sm">{appliedDate}</span>
              </div>
            </div>
          </div>

          {/* Visual Progress Steps Tracker: Vertical on mobile, Horizontal on md+ */}
          <div className="pt-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4 text-center sm:text-left">
              Application Journey
            </h4>
            <div className="flex flex-col space-y-3 md:grid md:grid-cols-4 md:space-y-0 md:gap-4">
              {[
                { step: 1, title: 'Applied', desc: 'Application Received' },
                { step: 2, title: 'Reviewing', desc: 'Document Verification' },
                { step: 3, title: 'Shortlisted', desc: 'Eligibility Confirmed' },
                { step: 4, title: 'Admitted', desc: 'Seat Confirmed 🎉' },
              ].map((item) => {
                const isPassed = statusInfo.step >= item.step;
                const isCurrent = statusInfo.step === item.step;
                return (
                  <div
                    key={item.step}
                    className={`p-4 rounded-2xl border transition-all flex md:flex-col items-center md:items-start gap-3 md:gap-0 ${
                      isCurrent
                        ? 'bg-blue-50/70 border-[#1E40FF] shadow-md shadow-blue-500/10'
                        : isPassed
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-white border-slate-100 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 md:mb-2 shrink-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                          isCurrent
                            ? 'bg-[#1E40FF] text-white shadow-sm'
                            : isPassed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isPassed && !isCurrent ? <Check size={16} /> : item.step}
                      </div>
                      <span className={`text-xs sm:text-sm font-black uppercase tracking-wider hidden md:inline ${isCurrent ? 'text-[#1E40FF]' : 'text-slate-800'}`}>
                        {item.title}
                      </span>
                    </div>
                    <div>
                      <span className={`text-xs sm:text-sm font-black uppercase tracking-wider inline md:hidden ${isCurrent ? 'text-[#1E40FF]' : 'text-slate-800'}`}>
                        {item.title}
                      </span>
                      <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        )}

        {/* 3. COURSE DETAILS SECTION */}
        {(activeTab === 'all' || activeTab === 'overview') && (
        <section className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-8 space-y-6 w-full">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <GraduationCap className="text-[#1E40FF]" size={22} /> Course Details
            </h3>
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-[#1E40FF] bg-blue-50 px-2.5 py-1 rounded-md">
              Session: {formData.academic_session || '2025-26'}
            </span>
          </div>

          {/* Labeled Cards Grid for Course Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full">
            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Program Type
              </span>
              <div className="text-sm font-bold text-slate-900">
                {renderVal(formData.program_type)}
              </div>
            </div>

            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Course
              </span>
              <div className="text-sm font-black text-[#1E40FF]">
                {renderVal(formData.course || application.course)}
              </div>
            </div>

            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Specialization
              </span>
              <div className="text-sm font-bold text-slate-900">
                {renderVal(formData.specialization)}
              </div>
            </div>

            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Academic Session
              </span>
              <div className="text-sm font-bold text-slate-900">
                {renderVal(formData.academic_session)}
              </div>
            </div>

            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Preferred College Type
              </span>
              <div className="text-sm font-bold text-slate-900">
                {renderVal(formData.preferred_college_type)}
              </div>
            </div>

            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Hostel Required
              </span>
              <div className="text-sm font-bold text-slate-900">
                {formData.hostel_required === 'Yes'
                  ? `Yes${formData.hostel_location ? ` (${formData.hostel_location})` : ''}`
                  : (formData.hostel_required ? formData.hostel_required : <span className="text-slate-400 italic font-normal">Not provided</span>)}
              </div>
            </div>

            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Scholarship Required
              </span>
              <div className="text-sm font-bold text-slate-900">
                {renderVal(formData.scholarship_required)}
              </div>
            </div>

            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Category
              </span>
              <div className="text-sm font-bold text-slate-900">
                {renderVal(formData.category)}
              </div>
            </div>
          </div>

          {/* Enrolled Course Full Details if enrolled */}
          {application.enrolled_course && (
            <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-2xl space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 block">
                Enrolled Program Details
              </span>
              <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">{application.enrolled_course.name}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm pt-1">
                <div><span className="text-slate-400 block font-medium">Duration:</span> <span className="font-bold text-slate-800">{application.enrolled_course.duration || '3 Years'}</span></div>
                <div><span className="text-slate-400 block font-medium">Fee:</span> <span className="font-bold text-slate-800">₹{application.enrolled_course.fee || 'TBD'}</span></div>
              </div>
            </div>
          )}

          {application.interested_colleges && application.interested_colleges.length > 0 && (
            <div className="pt-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
                Preferred Campus
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {application.interested_colleges.map(col => (
                  <div key={col.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 size={18} className="text-[#1E40FF]" />
                      <span className="font-bold text-slate-800 text-xs sm:text-sm">{col.name}</span>
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">{col.city}, {col.state}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
        )}

        {/* 4. PERSONAL, CONTACT, ADDRESS & GUARDIAN DETAILS */}
        {(activeTab === 'all' || activeTab === 'overview') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full">
          
          {/* PERSONAL DETAILS CARD (Requirement 4: 1-column on mobile) */}
          <section id="personal-details-section" className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-8 space-y-5 w-full">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <User className="text-[#1E40FF]" size={22} /> Personal Details
              </h3>
              <button
                onClick={() => navigate('/student/profile')}
                className="text-xs sm:text-sm font-bold text-[#1E40FF] hover:underline border-none bg-transparent cursor-pointer flex items-center gap-1 min-h-[44px]"
              >
                Edit Profile <ArrowRight size={14} />
              </button>
            </div>

            {/* 1-column on Mobile, 2-column on Desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 text-sm">
              {/* 1. Full Name */}
              <div className="bg-slate-50/60 p-3.5 rounded-2xl border border-slate-200/60">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Full Name
                </span>
                <div className="text-sm sm:text-base font-bold text-slate-900">
                  {renderVal(formData.full_name || application.name)}
                </div>
              </div>

              {/* 2. Father's Name */}
              <div className="bg-slate-50/60 p-3.5 rounded-2xl border border-slate-200/60">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Father's Name
                </span>
                <div className="text-sm sm:text-base font-bold text-slate-900">
                  {renderVal(formData.father_name)}
                </div>
              </div>

              {/* 3. Mother's Name */}
              <div className="bg-slate-50/60 p-3.5 rounded-2xl border border-slate-200/60">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Mother's Name
                </span>
                <div className="text-sm sm:text-base font-bold text-slate-900">
                  {renderVal(formData.mother_name)}
                </div>
              </div>

              {/* 4. Date of Birth */}
              <div className="bg-slate-50/60 p-3.5 rounded-2xl border border-slate-200/60">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Date of Birth
                </span>
                <div className="text-sm sm:text-base font-bold text-slate-900">
                  {renderVal(formatDobDate(formData.dob))}
                </div>
              </div>

              {/* 5. Gender */}
              <div className="bg-slate-50/60 p-3.5 rounded-2xl border border-slate-200/60">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Gender
                </span>
                <div className="text-sm sm:text-base font-bold text-slate-900">
                  {renderVal(formData.gender)}
                </div>
              </div>

              {/* 6. Blood Group */}
              <div className="bg-slate-50/60 p-3.5 rounded-2xl border border-slate-200/60">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Blood Group
                </span>
                <div className="text-sm sm:text-base font-bold text-red-600">
                  {formData.blood_group ? formData.blood_group : <span className="text-slate-400 italic font-normal">Not provided</span>}
                </div>
              </div>

              {/* 7. Category */}
              <div className="bg-slate-50/60 p-3.5 rounded-2xl border border-slate-200/60">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Category
                </span>
                <div className="text-sm sm:text-base font-bold text-slate-900">
                  {renderVal(formData.category)}
                </div>
              </div>

              {/* 8. Nationality */}
              <div className="bg-slate-50/60 p-3.5 rounded-2xl border border-slate-200/60">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Nationality
                </span>
                <div className="text-sm sm:text-base font-bold text-slate-900">
                  {renderVal(formData.nationality)}
                </div>
              </div>

              {/* 9. Aadhaar */}
              <div className="bg-slate-50/60 p-3.5 rounded-2xl border border-slate-200/60 md:col-span-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Aadhaar Number
                </span>
                <div className="text-sm sm:text-base font-mono font-bold text-slate-900">
                  {renderVal(formatAadhaarNumber(formData.aadhaar_number))}
                </div>
              </div>
            </div>
          </section>

          {/* CONTACT, ADDRESS & GUARDIAN DETAILS */}
          <div className="space-y-6 sm:space-y-8 w-full">
            
            {/* CONTACT SECTION */}
            <section className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-8 space-y-4 w-full">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Phone className="text-[#1E40FF]" size={22} /> Contact Details
                </h3>
              </div>

              <div className="space-y-3 text-sm">
                {/* Primary Mobile */}
                <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/70 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-blue-50 text-[#1E40FF] shrink-0 mt-0.5">
                    <Phone size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Primary Mobile
                    </span>
                    <div className="text-sm sm:text-base font-bold text-slate-900">
                      {renderVal(formData.primary_mobile ? `+91 ${formData.primary_mobile}` : (application.phone ? `+91 ${application.phone}` : null))}
                    </div>
                  </div>
                </div>

                {/* Alternate Mobile */}
                <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/70 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0 mt-0.5">
                    <PhoneCall size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Alternate Mobile
                    </span>
                    <div className="text-sm sm:text-base font-bold text-slate-900">
                      {renderVal(formData.alternate_mobile ? `+91 ${formData.alternate_mobile}` : null)}
                    </div>
                  </div>
                </div>

                {/* Email Address */}
                <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/70 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0 mt-0.5">
                    <Mail size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Email Address
                    </span>
                    <div className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      {renderVal(formData.email || application.email)}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ADDRESS SECTION */}
            <section className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-8 space-y-4 w-full">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <MapPin className="text-[#1E40FF]" size={22} /> Address Details
                </h3>
              </div>

              <div className="space-y-3.5 text-sm">
                {/* Permanent Address */}
                <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/70 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-blue-50 text-[#1E40FF] shrink-0 mt-0.5">
                    <Home size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Permanent Address
                    </span>
                    <div className="text-sm font-bold text-slate-800 leading-relaxed">
                      {renderVal(formatAddress(formData.permanent_address))}
                    </div>
                  </div>
                </div>

                {/* Correspondence Address */}
                <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/70 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 text-slate-600 shrink-0 mt-0.5">
                    <MapPin size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Correspondence Address
                    </span>
                    <div className="text-sm font-bold text-slate-800 leading-relaxed">
                      {formData.same_as_permanent
                        ? <span className="text-slate-700 font-semibold">Same as Permanent Address</span>
                        : renderVal(formatAddress(formData.correspondence_address))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* GUARDIAN SECTION */}
            <section className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-8 space-y-4 w-full">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <UserCheck className="text-[#1E40FF]" size={22} /> Guardian Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                {/* Guardian Name */}
                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/70">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Guardian Name
                  </span>
                  <div className="text-sm font-bold text-slate-900">
                    {renderVal(formData.guardian_name)}
                  </div>
                </div>

                {/* Relationship */}
                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/70">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Relationship
                  </span>
                  <div className="text-sm font-bold text-slate-900">
                    {renderVal(formData.guardian_relationship)}
                  </div>
                </div>

                {/* Guardian Mobile */}
                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/70">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Guardian Mobile
                  </span>
                  <div className="text-sm font-bold text-slate-900">
                    {renderVal(formData.guardian_mobile ? `+91 ${formData.guardian_mobile}` : null)}
                  </div>
                </div>
              </div>
            </section>

          </div>

        </div>
        )}

        {/* 5. ACADEMIC QUALIFICATIONS SECTION (Requirement 5: table on desktop, stacked cards on mobile) */}
        {(activeTab === 'all' || activeTab === 'overview') && (
        <section className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-8 space-y-4 w-full">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Award className="text-[#1E40FF]" size={22} /> Academic Qualifications
            </h3>
            <span className="text-xs text-slate-400 font-semibold">Verified</span>
          </div>

          {Array.isArray(formData.qualifications) && formData.qualifications.length > 0 ? (
            <div>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200/80">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/80 text-slate-600 font-extrabold uppercase tracking-wider text-xs">
                      <th className="py-3.5 px-4">Examination</th>
                      <th className="py-3.5 px-4">Board / Institution</th>
                      <th className="py-3.5 px-4">Year</th>
                      <th className="py-3.5 px-4">Percentage</th>
                      <th className="py-3.5 px-4">Division</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {formData.qualifications.map((q, idx) => {
                      const boardInst = [q.board, q.institution].filter(Boolean).join(' / ');
                      return (
                        <tr
                          key={q.id || idx}
                          className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}
                        >
                          <td className="py-3.5 px-4 font-bold text-[#1E40FF]">
                            {q.level || q.stream || 'Examination'}
                          </td>
                          <td className="py-3.5 px-4">
                            {boardInst || <span className="text-slate-400 italic">Not provided</span>}
                          </td>
                          <td className="py-3.5 px-4 font-semibold">
                            {q.year || <span className="text-slate-400 italic">Not provided</span>}
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-emerald-700">
                            {q.percentage ? `${q.percentage}%` : <span className="text-slate-400 italic font-normal">Not provided</span>}
                          </td>
                          <td className="py-3.5 px-4 font-bold">
                            {q.division || <span className="text-slate-400 italic font-normal">Not provided</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Cards View */}
              <div className="block md:hidden space-y-3">
                {formData.qualifications.map((q, idx) => {
                  const boardInst = [q.board, q.institution].filter(Boolean).join(' / ');
                  return (
                    <div key={q.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                      <div className="font-extrabold text-sm text-[#1E40FF] border-b border-slate-200/80 pb-2">
                        {q.level || q.stream || 'Examination'}
                      </div>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-slate-500 font-medium">Board / Institution:</span>
                          <span className="font-bold text-slate-800 text-right">{boardInst || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-slate-500 font-medium">Passing Year:</span>
                          <span className="font-bold text-slate-800">{q.year || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-slate-500 font-medium">Percentage / Marks:</span>
                          <span className="font-extrabold text-emerald-700">{q.percentage ? `${q.percentage}%` : 'Not provided'}</span>
                        </div>
                        {q.division && (
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-slate-500 font-medium">Division:</span>
                            <span className="font-bold text-slate-800">{q.division}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic py-6 text-center">No qualifications added</p>
          )}
        </section>
        )}

        {/* 6. DOCUMENTS CARD (Requirement 6: 1 column on mobile, buttons w-full) */}
        {(activeTab === 'all' || activeTab === 'documents') && (
        <section id="documents-section" className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-8 space-y-6 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="text-[#1E40FF]" size={22} /> Application Documents
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Review verified admission certificates and upload any pending documents.
              </p>
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-500">
              {documents.length} Document(s) Uploaded
            </span>
          </div>

          {uploadError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl p-3.5 font-semibold flex items-center gap-2">
              <AlertCircle size={18} /> {uploadError}
            </div>
          )}
          {uploadSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm rounded-xl p-3.5 font-semibold flex items-center gap-2">
              <CheckCircle2 size={18} /> {uploadSuccess}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {REQUIRED_DOC_TYPES.map((docDef) => {
              const uploadedDoc = uploadedMap[docDef.type];
              const isUploading = uploadingType === docDef.type;

              return (
                <div
                  key={docDef.type}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3.5 w-full ${
                    uploadedDoc
                      ? 'bg-slate-50/80 border-slate-200'
                      : docDef.required
                      ? 'bg-amber-50/60 border-amber-200/80'
                      : 'bg-slate-50/40 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="text-sm font-extrabold text-slate-800">{docDef.label}</span>
                        {docDef.required && !uploadedDoc && (
                          <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                            Required
                          </span>
                        )}
                        {uploadedDoc && (
                          <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Check size={12} /> Uploaded
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate max-w-xs">
                        {uploadedDoc ? uploadedDoc.document_name : 'Pending upload'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 w-full">
                    {uploadedDoc ? (
                      <a
                        href={uploadedDoc.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1E40FF] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-colors no-underline min-h-[44px] w-full sm:w-auto flex-1"
                      >
                        <ExternalLink size={14} /> View Document
                      </a>
                    ) : null}

                    {/* Direct Upload / Re-upload button */}
                    <label className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition-all min-h-[44px] w-full sm:w-auto flex-1 ${
                      uploadedDoc
                        ? 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                        : 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
                    }`}>
                      {isUploading ? (
                        <><Loader2 size={14} className="animate-spin" /> Uploading...</>
                      ) : (
                        <><Upload size={14} /> {uploadedDoc ? 'Replace' : 'Upload Now'}</>
                      )}
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        disabled={isUploading}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleDocumentUpload(docDef.type, e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        )}

        {/* 7. APPLICATION TIMELINE & CHECKLIST */}
        {(activeTab === 'all' || activeTab === 'overview') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full">
          
          {/* APPLICATION TIMELINE */}
          <section className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-8 space-y-4 w-full">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="text-[#1E40FF]" size={22} /> Application Timeline
              </h3>
              <span className="text-xs text-slate-400 font-bold">Activity Log</span>
            </div>

            {timeline.length > 0 ? (
              <div className="relative pl-6 border-l-2 border-blue-100 space-y-6 pt-2">
                {timeline.map((evt, idx) => (
                  <div key={evt.id || idx} className="relative group">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#1E40FF] border-4 border-white shadow-sm"></div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-black text-slate-900">{evt.title}</span>
                        <span className="text-xs text-slate-400 font-semibold">
                          {new Date(evt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        {evt.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-slate-500 italic py-4">No milestone updates logged yet.</p>
            )}
          </section>

          {/* ADMISSION DAY CHECKLIST */}
          <section className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-8 space-y-5 w-full">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 className="text-[#1E40FF]" size={22} /> Admission Day Checklist
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Physical documents required when visiting the campus for enrollment.
              </p>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm">
              {[
                'Original Class 10th & 12th Marksheets + 3 sets of photocopies',
                'Transfer Certificate (TC) & Migration Certificate (Original)',
                'Aadhaar Card copy & 6 Passport size photographs',
                'Category / Caste Certificate (if applicable)',
                'Medical Fitness Certificate from registered practitioner',
                'Admission fee installment receipt / DD'
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/60 font-semibold text-slate-800">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="bg-blue-50/80 border border-blue-200/80 p-4 rounded-2xl space-y-1.5 text-xs sm:text-sm">
              <h4 className="font-extrabold text-blue-950 flex items-center gap-1.5 text-sm sm:text-base">
                <HelpCircle size={18} className="text-[#1E40FF]" /> Campus Contact & Counseling Desk
              </h4>
              <p className="text-blue-900 font-medium leading-relaxed">
                Buddha College of Nursing Campus, Near Highway Junction, Education Zone.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 pt-1 font-bold text-slate-800 text-xs sm:text-sm">
                <span>📞 +91 98765 43210</span>
                <span>✉️ admissions@buddhacollegeofnursing.edu</span>
              </div>
            </div>
          </section>

        </div>
        )}

        {/* 8. CHANGE PASSWORD SECTION (Requirement 8: full-width inputs, stacked vertically on mobile) */}
        {(activeTab === 'all' || activeTab === 'security') && (
        <section id="security-section" className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-8 space-y-6 w-full">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Key className="text-[#1E40FF]" size={22} /> Account Security & Password
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Change your portal password away from your default Date of Birth to keep your student record secure.
            </p>
          </div>

          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs sm:text-sm font-semibold text-amber-900 flex items-start gap-2.5">
            <Shield size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Security Reminder:</strong> Your initial default password was set to your Date of Birth in <strong>DDMMYYYY</strong> format (e.g. 15082002). Please create a custom private password below.
            </span>
          </div>

          {passwordError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl p-3.5 font-semibold flex items-center gap-2">
              <AlertCircle size={18} /> {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm rounded-xl p-3.5 font-semibold flex items-center gap-2">
              <CheckCircle2 size={18} /> {passwordSuccess}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 ml-1">
                Current Password
              </label>
              <div className="relative w-full">
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                  placeholder="Default: DOB (DDMMYYYY)"
                  className="w-full px-4 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-900 text-sm font-medium focus:outline-none focus:border-[#1E40FF] focus:ring-4 focus:ring-[#1E40FF]/15 transition-all min-h-[44px]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-2 border-none bg-transparent cursor-pointer min-h-[44px] flex items-center justify-center"
                >
                  {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 ml-1">
                New Password
              </label>
              <div className="relative w-full">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                  placeholder="At least 6 characters"
                  className="w-full px-4 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-900 text-sm font-medium focus:outline-none focus:border-[#1E40FF] focus:ring-4 focus:ring-[#1E40FF]/15 transition-all min-h-[44px]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-2 border-none bg-transparent cursor-pointer min-h-[44px] flex items-center justify-center"
                >
                  {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 ml-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                placeholder="Re-type new password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-900 text-sm font-medium focus:outline-none focus:border-[#1E40FF] focus:ring-4 focus:ring-[#1E40FF]/15 transition-all min-h-[44px]"
                required
              />
            </div>

            <div className="md:col-span-3 flex justify-end w-full">
              <button
                type="submit"
                disabled={changingPassword}
                className="px-6 py-3 rounded-xl bg-[#1E40FF] hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md shadow-blue-500/20 disabled:opacity-60 cursor-pointer border-none flex items-center justify-center gap-2 min-h-[44px] w-full md:w-auto"
              >
                {changingPassword ? <><Loader2 size={16} className="animate-spin" /> Updating...</> : 'Update Password'}
              </button>
            </div>

          </form>
        </section>
        )}

      </main>

      {/* 1. Mobile Fixed Bottom Navigation Bar (Fixed at bottom on mobile screens < 768px) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] px-2 py-1.5 flex items-center justify-around md:hidden">
        <button
          type="button"
          onClick={() => {
            setActiveTab('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl border-none bg-transparent cursor-pointer min-w-[56px] min-h-[44px] transition-colors ${
            activeTab === 'all' || activeTab === 'overview' ? 'text-[#1E40FF] font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
          title="Home"
        >
          <LayoutDashboard size={22} />
          <span className="text-[10px] font-medium mt-0.5">Home</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('overview');
            const el = document.getElementById('personal-details-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl border-none bg-transparent cursor-pointer min-w-[56px] min-h-[44px] text-slate-500 hover:text-slate-800 transition-colors"
          title="Profile"
        >
          <User size={22} />
          <span className="text-[10px] font-medium mt-0.5">Profile</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('documents');
            const el = document.getElementById('documents-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl border-none bg-transparent cursor-pointer min-w-[56px] min-h-[44px] transition-colors ${
            activeTab === 'documents' ? 'text-[#1E40FF] font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
          title="Documents"
        >
          <FileText size={22} />
          <span className="text-[10px] font-medium mt-0.5">Documents</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('idcard');
            const el = document.getElementById('student-id-card-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl border-none bg-transparent cursor-pointer min-w-[56px] min-h-[44px] transition-colors ${
            activeTab === 'idcard' ? 'text-[#1E40FF] font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
          title="ID Card"
        >
          <CreditCard size={22} />
          <span className="text-[10px] font-medium mt-0.5">ID Card</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('security');
            const el = document.getElementById('security-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl border-none bg-transparent cursor-pointer min-w-[56px] min-h-[44px] transition-colors ${
            activeTab === 'security' ? 'text-[#1E40FF] font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
          title="Settings"
        >
          <Settings size={22} />
          <span className="text-[10px] font-medium mt-0.5">Settings</span>
        </button>
      </nav>

    </div>
  );
}
