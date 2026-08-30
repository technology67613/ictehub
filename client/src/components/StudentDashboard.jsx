import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Clock, Award, XCircle, AlertCircle, FileText,
  Eye, EyeOff, Upload, Phone, Mail, MapPin, User, Calendar,
  GraduationCap, Shield, Lock, Key, Copy, Check, ExternalLink,
  RefreshCw, Loader2, Sparkles, Building2, HelpCircle, ArrowRight,
  CreditCard, LayoutDashboard, PhoneCall, Home, UserCheck, Users
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
              Manage your Buddha College of Nursing application, view your institutional credentials, and track your admission status in real-time.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setActiveTab('idcard');
                const el = document.getElementById('student-id-card-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2.5 rounded-xl bg-white text-[#1E40FF] hover:bg-blue-50 font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer border-none flex items-center gap-1.5"
            >
              <CreditCard size={14} /> Student ID Card
            </button>
            <button
              onClick={() => navigate('/student/profile')}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer border border-white/20 flex items-center gap-1.5"
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

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
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
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer border ${
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

        {/* 1. STUDENT ID CARD COMPONENT */}
        {(activeTab === 'all' || activeTab === 'idcard') && (
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
        )}

        {/* 2. APPLICATION STATUS & JOURNEY CARD */}
        {(activeTab === 'all' || activeTab === 'overview') && (
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
        )}

        {/* 3. COURSE DETAILS SECTION */}
        {(activeTab === 'all' || activeTab === 'overview') && (
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <GraduationCap className="text-[#1E40FF]" size={20} /> Course Details
            </h3>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1E40FF] bg-blue-50 px-2.5 py-1 rounded-md">
              Session: {formData.academic_session || '2025-26'}
            </span>
          </div>

          {/* Labeled Cards Grid for Course Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Program Type
              </span>
              <div className="text-xs font-bold text-slate-900">
                {renderVal(formData.program_type)}
              </div>
            </div>

            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Course
              </span>
              <div className="text-xs font-black text-[#1E40FF]">
                {renderVal(formData.course || application.course)}
              </div>
            </div>

            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Specialization
              </span>
              <div className="text-xs font-bold text-slate-900">
                {renderVal(formData.specialization)}
              </div>
            </div>

            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Academic Session
              </span>
              <div className="text-xs font-bold text-slate-900">
                {renderVal(formData.academic_session)}
              </div>
            </div>

            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Preferred College Type
              </span>
              <div className="text-xs font-bold text-slate-900">
                {renderVal(formData.preferred_college_type)}
              </div>
            </div>

            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Hostel Required
              </span>
              <div className="text-xs font-bold text-slate-900">
                {formData.hostel_required === 'Yes'
                  ? `Yes${formData.hostel_location ? ` (${formData.hostel_location})` : ''}`
                  : (formData.hostel_required ? formData.hostel_required : <span className="text-slate-400 italic font-normal">Not provided</span>)}
              </div>
            </div>

            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Scholarship Required
              </span>
              <div className="text-xs font-bold text-slate-900">
                {renderVal(formData.scholarship_required)}
              </div>
            </div>

            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Category
              </span>
              <div className="text-xs font-bold text-slate-900">
                {renderVal(formData.category)}
              </div>
            </div>
          </div>

          {/* Enrolled Course Full Details if enrolled */}
          {application.enrolled_course && (
            <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-2xl space-y-2">
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
            <div className="pt-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
                Preferred Campus
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
        </section>
        )}

        {/* 4. PERSONAL, CONTACT, ADDRESS & GUARDIAN DETAILS (2-Column Grid) */}
        {(activeTab === 'all' || activeTab === 'overview') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* PERSONAL DETAILS CARD */}
          <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <User className="text-[#1E40FF]" size={20} /> Personal Details
              </h3>
              <button
                onClick={() => navigate('/student/profile')}
                className="text-xs font-bold text-[#1E40FF] hover:underline border-none bg-transparent cursor-pointer flex items-center gap-1"
              >
                Edit Profile <ArrowRight size={13} />
              </button>
            </div>

            {/* Exact 9 Fields in Clean 2-Column Grid on Desktop, 1 on Mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 text-xs">
              {/* 1. Full Name */}
              <div className="bg-slate-50/60 p-3.5 rounded-2xl border border-slate-200/60">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Full Name
                </span>
                <div className="text-sm font-bold text-slate-900">
                  {renderVal(formData.full_name || application.name)}
                </div>
              </div>

              {/* 2. Father's Name */}
              <div className="bg-slate-50/60 p-3.5 rounded-2xl border border-slate-200/60">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Father's Name
                </span>
                <div className="text-sm font-bold text-slate-900">
                  {renderVal(formData.father_name)}
                </div>
              </div>

              {/* 3. Mother's Name */}
              <div className="bg-slate-50/60 p-3.5 rounded-2xl border border-slate-200/60">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Mother's Name
                </span>
                <div className="text-sm font-bold text-slate-900">
                  {renderVal(formData.mother_name)}
                </div>
              </div>

              {/* 4. Date of Birth (format as DD/MM/YYYY) */}
              <div className="bg-slate-50/60 p-3.5 rounded-2xl border border-slate-200/60">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Date of Birth
                </span>
                <div className="text-sm font-bold text-slate-900">
                  {renderVal(formatDobDate(formData.dob))}
                </div>
              </div>

              {/* 5. Gender */}
              <div className="bg-slate-50/60 p-3.5 rounded-2xl border border-slate-200/60">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Gender
                </span>
                <div className="text-sm font-bold text-slate-900">
                  {renderVal(formData.gender)}
                </div>
              </div>

              {/* 6. Blood Group */}
              <div className="bg-slate-50/60 p-3.5 rounded-2xl border border-slate-200/60">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Blood Group
                </span>
                <div className="text-sm font-bold text-red-600">
                  {formData.blood_group ? formData.blood_group : <span className="text-slate-400 italic font-normal">Not provided</span>}
                </div>
              </div>

              {/* 7. Category */}
              <div className="bg-slate-50/60 p-3.5 rounded-2xl border border-slate-200/60">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Category
                </span>
                <div className="text-sm font-bold text-slate-900">
                  {renderVal(formData.category)}
                </div>
              </div>

              {/* 8. Nationality */}
              <div className="bg-slate-50/60 p-3.5 rounded-2xl border border-slate-200/60">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Nationality
                </span>
                <div className="text-sm font-bold text-slate-900">
                  {renderVal(formData.nationality)}
                </div>
              </div>

              {/* 9. Aadhaar (show last 4 digits only: XXXX-XXXX-1234) */}
              <div className="bg-slate-50/60 p-3.5 rounded-2xl border border-slate-200/60 md:col-span-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Aadhaar Number
                </span>
                <div className="text-sm font-mono font-bold text-slate-900">
                  {renderVal(formatAadhaarNumber(formData.aadhaar_number))}
                </div>
              </div>
            </div>
          </section>

          {/* CONTACT, ADDRESS & GUARDIAN DETAILS */}
          <div className="space-y-8">
            
            {/* CONTACT SECTION */}
            <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Phone className="text-[#1E40FF]" size={20} /> Contact Details
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                {/* Primary Mobile */}
                <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/70 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-blue-50 text-[#1E40FF] shrink-0 mt-0.5">
                    <Phone size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Primary Mobile
                    </span>
                    <div className="text-sm font-bold text-slate-900">
                      {renderVal(formData.primary_mobile ? `+91 ${formData.primary_mobile}` : (application.phone ? `+91 ${application.phone}` : null))}
                    </div>
                  </div>
                </div>

                {/* Alternate Mobile */}
                <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/70 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0 mt-0.5">
                    <PhoneCall size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Alternate Mobile
                    </span>
                    <div className="text-sm font-bold text-slate-900">
                      {renderVal(formData.alternate_mobile ? `+91 ${formData.alternate_mobile}` : null)}
                    </div>
                  </div>
                </div>

                {/* Email Address */}
                <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/70 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0 mt-0.5">
                    <Mail size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Email Address
                    </span>
                    <div className="text-sm font-bold text-slate-900 truncate">
                      {renderVal(formData.email || application.email)}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ADDRESS SECTION */}
            <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <MapPin className="text-[#1E40FF]" size={20} /> Address Details
                </h3>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Permanent Address */}
                <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/70 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-blue-50 text-[#1E40FF] shrink-0 mt-0.5">
                    <Home size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Permanent Address
                    </span>
                    <div className="text-xs font-bold text-slate-800 leading-relaxed">
                      {renderVal(formatAddress(formData.permanent_address))}
                    </div>
                  </div>
                </div>

                {/* Correspondence Address */}
                <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/70 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 text-slate-600 shrink-0 mt-0.5">
                    <MapPin size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Correspondence Address
                    </span>
                    <div className="text-xs font-bold text-slate-800 leading-relaxed">
                      {formData.same_as_permanent
                        ? <span className="text-slate-700 font-semibold">Same as Permanent Address</span>
                        : renderVal(formatAddress(formData.correspondence_address))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* GUARDIAN SECTION */}
            <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <UserCheck className="text-[#1E40FF]" size={20} /> Guardian Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Guardian Name */}
                <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-200/70">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Guardian Name
                  </span>
                  <div className="text-xs font-bold text-slate-900">
                    {renderVal(formData.guardian_name)}
                  </div>
                </div>

                {/* Relationship */}
                <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-200/70">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Relationship
                  </span>
                  <div className="text-xs font-bold text-slate-900">
                    {renderVal(formData.guardian_relationship)}
                  </div>
                </div>

                {/* Guardian Mobile */}
                <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-200/70">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Guardian Mobile
                  </span>
                  <div className="text-xs font-bold text-slate-900">
                    {renderVal(formData.guardian_mobile ? `+91 ${formData.guardian_mobile}` : null)}
                  </div>
                </div>
              </div>
            </section>

          </div>

        </div>
        )}

        {/* 5. ACADEMIC QUALIFICATIONS SECTION */}
        {(activeTab === 'all' || activeTab === 'overview') && (
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Award className="text-[#1E40FF]" size={20} /> Academic Qualifications
            </h3>
            <span className="text-xs text-slate-400 font-semibold">Verified from Application</span>
          </div>

          {Array.isArray(formData.qualifications) && formData.qualifications.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/80 text-slate-600 font-extrabold uppercase tracking-wider text-[10px]">
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
          ) : (
            <p className="text-xs text-slate-400 italic py-6 text-center">No qualifications added</p>
          )}
        </section>
        )}

        {/* 6. DOCUMENTS CARD */}
        {(activeTab === 'all' || activeTab === 'documents') && (
        <section id="documents-section" className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
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
        )}

        {/* 7. APPLICATION TIMELINE & CHECKLIST */}
        {(activeTab === 'all' || activeTab === 'overview') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* APPLICATION TIMELINE */}
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

          {/* ADMISSION DAY CHECKLIST */}
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
        )}

        {/* 8. CHANGE PASSWORD SECTION */}
        {(activeTab === 'all' || activeTab === 'security') && (
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Key className="text-[#1E40FF]" size={20} /> Account Security & Password
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Change your portal password away from your default Date of Birth to keep your student record secure.
            </p>
          </div>

          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs font-semibold text-amber-900 flex items-start gap-2.5">
            <Shield size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Security Reminder:</strong> Your initial default password was set to your Date of Birth in <strong>DDMMYYYY</strong> format (e.g. 15082002). Please create a custom private password below.
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
                  placeholder="Default: DOB (DDMMYYYY)"
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
        )}

      </main>

    </div>
  );
}
