import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Clock, Award, XCircle, AlertCircle, FileText,
  Eye, EyeOff, Upload, Phone, Mail, MapPin, User, Calendar,
  GraduationCap, Shield, Lock, Key, Copy, Check, ExternalLink,
  RefreshCw, Loader2, Sparkles, Building2, HelpCircle, ArrowRight
} from 'lucide-react';
import IcteLogo from './IcteLogo';

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

export default function StudentDashboard({ user, handleLogout }) {
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

      // 1. Fetch Student Application
      const appRes = await fetch(`${API}/leads/my-application`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!appRes.ok) {
        const errData = await appRes.json();
        throw new Error(errData.message || 'Failed to fetch application details.');
      }
      const appData = await appRes.json();
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
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-extrabold text-slate-900 mb-2">Application Not Found</h2>
          <p className="text-xs text-slate-600 leading-relaxed mb-6">
            {error || 'We could not find an admission application linked to this student account.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={fetchDashboardData}
              className="flex-1 py-3 bg-[#1E40FF] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all border-none cursor-pointer"
            >
              Retry
            </button>
            <button
              onClick={() => navigate('/apply')}
              className="flex-1 py-3 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-all border-none cursor-pointer"
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
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-500/20 text-slate-700 pb-16">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <IcteLogo size={36} withText />
            <div className="hidden sm:flex items-center gap-2 border-l border-slate-200 pl-3">
              <span className="text-xs font-black uppercase tracking-widest text-[#1E40FF] bg-blue-50 px-2 py-0.5 rounded-md">
                Student Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/student/profile')}
              className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border-none cursor-pointer"
              title="Student Profile"
            >
              <div className="w-6 h-6 rounded-full bg-[#1E40FF] text-white flex items-center justify-center text-[10px] font-black">
                {(application.name || user?.name || 'S').slice(0, 2).toUpperCase()}
              </div>
              <span className="hidden md:inline">{application.name || user?.name || 'My Profile'}</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-700 hover:bg-red-50 transition-all border-none bg-transparent cursor-pointer"
            >
              Logout
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-[#1E40FF] to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest bg-white/15 px-3 py-1 rounded-full text-blue-100 mb-1 border border-white/20">
              <Sparkles size={14} /> Admissions 2025-26
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome, {application.name || 'Applicant'}!
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl font-medium">
              Manage your Buddha College of Nursing application, upload required credentials, and track your admission journey in real-time.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/student/profile')}
              className="px-4 py-2.5 rounded-xl bg-white text-[#1E40FF] hover:bg-blue-50 font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer border-none flex items-center gap-1.5"
            >
              <User size={14} /> View Profile
            </button>
            <button
              onClick={fetchDashboardData}
              className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer border border-white/20"
              title="Refresh Dashboard"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* 1. APPLICATION STATUS CARD (Top & Most Prominent) */}
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
                Application Status
              </span>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-1.5 rounded-full text-xs font-black border flex items-center gap-1.5 ${statusInfo.bg}`}>
                  {statusInfo.icon} {statusInfo.label}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 flex items-center gap-2">
                <span className="text-slate-400 font-bold">App ID:</span>
                <span className="font-mono font-black text-slate-900">{appIdShort}</span>
                <button
                  onClick={() => copyApplicationId(application.id)}
                  className="text-[#1E40FF] hover:text-blue-700 p-1 border-none bg-transparent cursor-pointer"
                  title="Copy Application ID"
                >
                  {copiedAppId ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>
              <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600">
                <span className="text-slate-400 font-bold mr-1">Applied:</span>
                <span className="font-bold text-slate-800">{appliedDate}</span>
              </div>
            </div>
          </div>

          {/* Visual Progress Steps Tracker */}
          <div className="pt-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-6">
              Application Journey
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    className={`p-4 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-blue-50/70 border-[#1E40FF] shadow-md shadow-blue-500/10'
                        : isPassed
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-white border-slate-100 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                          isCurrent
                            ? 'bg-[#1E40FF] text-white shadow-sm'
                            : isPassed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isPassed && !isCurrent ? <Check size={14} /> : item.step}
                      </div>
                      <span className={`text-xs font-black uppercase tracking-wider ${isCurrent ? 'text-[#1E40FF]' : 'text-slate-800'}`}>
                        {item.title}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-500">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 2-Column Grid for Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 2. COURSE DETAILS CARD */}
          <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <GraduationCap className="text-[#1E40FF]" size={20} /> Course Details
              </h3>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1E40FF] bg-blue-50 px-2.5 py-1 rounded-md">
                {formData.academic_session || '2025-26'}
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Applied Program</span>
                  <span className="font-extrabold text-slate-800">{formData.program_type || 'Nursing'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Course Name</span>
                  <span className="font-black text-[#1E40FF] text-sm">{formData.course || 'B.Sc Nursing'}</span>
                </div>
                {formData.specialization && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Specialization</span>
                    <span className="font-bold text-slate-800">{formData.specialization}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Study Mode</span>
                  <span className="font-bold text-slate-800">{formData.preferred_college_type || 'Offline / Regular'}</span>
                </div>
              </div>

              {/* Enrolled Course Full Details if enrolled */}
              {application.enrolled_course && (
                <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                    Enrolled Program Details
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-sm">{application.enrolled_course.name}</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div><span className="text-slate-400 block font-medium">Duration:</span> <span className="font-bold text-slate-800">{application.enrolled_course.duration || '3 Years'}</span></div>
                    <div><span className="text-slate-400 block font-medium">Fee:</span> <span className="font-bold text-slate-800">₹{application.enrolled_course.fee || 'TBD'}</span></div>
                  </div>
                </div>
              )}

              {application.interested_colleges && application.interested_colleges.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
                    Preferred Campus
                  </span>
                  <div className="space-y-2">
                    {application.interested_colleges.map(col => (
                      <div key={col.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-[#1E40FF]" />
                          <span className="font-bold text-slate-800 text-xs">{col.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-semibold">{col.city}, {col.state}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 3. PERSONAL INFORMATION CARD */}
          <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <User className="text-[#1E40FF]" size={20} /> Personal Information
              </h3>
              <button
                onClick={() => navigate('/student/profile')}
                className="text-xs font-bold text-[#1E40FF] hover:underline border-none bg-transparent cursor-pointer flex items-center gap-1"
              >
                Edit <ArrowRight size={13} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium block text-[11px]">Applicant Name</span>
                <span className="font-bold text-slate-900">{formData.full_name || application.name}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[11px]">Date of Birth</span>
                <span className="font-bold text-slate-900">{formData.dob || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[11px]">Gender</span>
                <span className="font-bold text-slate-900">{formData.gender || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[11px]">Category</span>
                <span className="font-bold text-slate-900">{formData.category || 'General'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[11px]">Father's Name</span>
                <span className="font-bold text-slate-900">{formData.father_name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[11px]">Mother's Name</span>
                <span className="font-bold text-slate-900">{formData.mother_name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[11px]">Phone Number</span>
                <span className="font-bold text-slate-900">+91 {application.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[11px]">Email Address</span>
                <span className="font-bold text-slate-900 truncate block">{formData.email || application.email || 'N/A'}</span>
              </div>

              {formData.aadhaar_number && (
                <div className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 font-medium block text-[10px]">Aadhaar Number</span>
                    <span className="font-mono font-bold text-slate-800">
                      {showAadhaar
                        ? formData.aadhaar_number
                        : `•••• •••• ${formData.aadhaar_number.slice(-4)}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAadhaar(!showAadhaar)}
                    className="text-slate-500 hover:text-slate-800 p-1 border-none bg-transparent cursor-pointer"
                  >
                    {showAadhaar ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              )}

              {formData.permanent_address && (
                <div className="col-span-2">
                  <span className="text-slate-400 font-medium block text-[11px]">Permanent Address</span>
                  <span className="font-bold text-slate-800 leading-relaxed block">
                    {formData.permanent_address.address_line_1}
                    {formData.permanent_address.city ? `, ${formData.permanent_address.city}` : ''}
                    {formData.permanent_address.district ? `, ${formData.permanent_address.district}` : ''}
                    {formData.permanent_address.state ? `, ${formData.permanent_address.state}` : ''}
                    {formData.permanent_address.pincode ? ` - ${formData.permanent_address.pincode}` : ''}
                  </span>
                </div>
              )}
            </div>
          </section>

        </div>

        {/* 4. ACADEMIC QUALIFICATIONS CARD */}
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Award className="text-[#1E40FF]" size={20} /> Academic Qualifications
            </h3>
            <span className="text-xs text-slate-400 font-medium">Verified from Application</span>
          </div>

          {Array.isArray(formData.qualifications) && formData.qualifications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 rounded-l-xl">Level</th>
                    <th className="py-3 px-4">Board / University</th>
                    <th className="py-3 px-4">Institution / School</th>
                    <th className="py-3 px-4">Passing Year</th>
                    <th className="py-3 px-4 rounded-r-xl">Score / %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {formData.qualifications.map((q, idx) => (
                    <tr key={q.id || idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#1E40FF]">{q.level}</td>
                      <td className="py-3.5 px-4">{q.board || '—'}</td>
                      <td className="py-3.5 px-4">{q.institution || '—'}</td>
                      <td className="py-3.5 px-4 font-semibold">{q.year || '—'}</td>
                      <td className="py-3.5 px-4 font-extrabold text-emerald-700">{q.percentage ? `${q.percentage}%` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-4">No detailed qualification records found in application.</p>
          )}
        </section>

        {/* 5. DOCUMENTS CARD */}
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="text-[#1E40FF]" size={20} /> Application Documents
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review verified admission certificates and upload any pending documents.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {documents.length} Document(s) Uploaded
            </span>
          </div>

          {uploadError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3.5 font-semibold flex items-center gap-2">
              <AlertCircle size={16} /> {uploadError}
            </div>
          )}
          {uploadSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl p-3.5 font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} /> {uploadSuccess}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REQUIRED_DOC_TYPES.map((docDef) => {
              const uploadedDoc = uploadedMap[docDef.type];
              const isUploading = uploadingType === docDef.type;

              return (
                <div
                  key={docDef.type}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    uploadedDoc
                      ? 'bg-slate-50/80 border-slate-200'
                      : docDef.required
                      ? 'bg-amber-50/60 border-amber-200/80'
                      : 'bg-slate-50/40 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-extrabold text-slate-800">{docDef.label}</span>
                        {docDef.required && !uploadedDoc && (
                          <span className="text-[9px] font-black uppercase text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                            Required
                          </span>
                        )}
                        {uploadedDoc && (
                          <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Check size={10} /> Uploaded
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate max-w-xs">
                        {uploadedDoc ? uploadedDoc.document_name : 'Pending upload'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {uploadedDoc ? (
                      <a
                        href={uploadedDoc.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E40FF] hover:bg-blue-700 text-white font-bold text-xs transition-colors no-underline"
                      >
                        <ExternalLink size={12} /> View Document
                      </a>
                    ) : null}

                    {/* Direct Upload / Re-upload button */}
                    <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                      uploadedDoc
                        ? 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                        : 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
                    }`}>
                      {isUploading ? (
                        <><Loader2 size={12} className="animate-spin" /> Uploading...</>
                      ) : (
                        <><Upload size={12} /> {uploadedDoc ? 'Replace' : 'Upload Now'}</>
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

        {/* 6. APPLICATION TIMELINE & 7. IMPORTANT INFORMATION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 6. APPLICATION TIMELINE */}
          <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="text-[#1E40FF]" size={20} /> Application Timeline
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
                        <span className="text-xs font-black text-slate-900">{evt.title}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {new Date(evt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {evt.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-4">No milestone updates logged yet.</p>
            )}
          </section>

          {/* 7. IMPORTANT INFORMATION & CHECKLIST */}
          <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 className="text-[#1E40FF]" size={20} /> Admission Day Checklist
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Physical documents required when visiting the campus for enrollment.
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                'Original Class 10th & 12th Marksheets + 3 sets of photocopies',
                'Transfer Certificate (TC) & Migration Certificate (Original)',
                'Aadhaar Card copy & 6 Passport size photographs',
                'Category / Caste Certificate (if applicable)',
                'Medical Fitness Certificate from registered practitioner',
                'Admission fee installment receipt / DD'
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 font-semibold text-slate-800">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="bg-blue-50/80 border border-blue-200/80 p-4 rounded-2xl space-y-1.5 text-xs">
              <h4 className="font-extrabold text-blue-950 flex items-center gap-1.5">
                <HelpCircle size={15} className="text-[#1E40FF]" /> Campus Contact & Counseling Desk
              </h4>
              <p className="text-blue-900 font-medium leading-relaxed">
                Buddha College of Nursing Campus, Near Highway Junction, Education Zone.
              </p>
              <div className="flex flex-wrap gap-4 pt-1 font-bold text-slate-800">
                <span>📞 +91 98765 43210</span>
                <span>✉️ admissions@buddhacollegeofnursing.edu</span>
              </div>
            </div>
          </section>

        </div>

        {/* 8. CHANGE PASSWORD SECTION */}
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Key className="text-[#1E40FF]" size={20} /> Account Security & Password
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Change your portal password away from your default phone number to keep your student record secure.
            </p>
          </div>

          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs font-semibold text-amber-900 flex items-start gap-2.5">
            <Shield size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Security Reminder:</strong> Your initial default password was set to your 10-digit mobile number. Please create a custom private password below.
            </span>
          </div>

          {passwordError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3.5 font-semibold flex items-center gap-2">
              <AlertCircle size={16} /> {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl p-3.5 font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} /> {passwordSuccess}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 ml-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                  placeholder="Default: Phone Number"
                  className="w-full px-4 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-900 text-xs font-medium focus:outline-none focus:border-[#1E40FF] focus:ring-4 focus:ring-[#1E40FF]/15 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 border-none bg-transparent cursor-pointer"
                >
                  {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 ml-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                  placeholder="At least 6 characters"
                  className="w-full px-4 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-900 text-xs font-medium focus:outline-none focus:border-[#1E40FF] focus:ring-4 focus:ring-[#1E40FF]/15 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 border-none bg-transparent cursor-pointer"
                >
                  {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 ml-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                placeholder="Re-type new password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-900 text-xs font-medium focus:outline-none focus:border-[#1E40FF] focus:ring-4 focus:ring-[#1E40FF]/15 transition-all"
                required
              />
            </div>

            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={changingPassword}
                className="px-6 py-3 rounded-xl bg-[#1E40FF] hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/20 disabled:opacity-60 cursor-pointer border-none flex items-center gap-2"
              >
                {changingPassword ? <><Loader2 size={14} className="animate-spin" /> Updating...</> : 'Update Password'}
              </button>
            </div>

          </form>
        </section>

      </main>

    </div>
  );
}
