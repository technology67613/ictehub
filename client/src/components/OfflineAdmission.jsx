import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download, Upload, CheckCircle2, AlertCircle, FileText, ArrowRight,
  ShieldCheck, Loader2, Sparkles, Plus, Trash2, Key, User, Phone, Mail,
  CheckSquare, FileCheck
} from 'lucide-react';

const API = 'https://ictehub.onrender.com';
const BLANK_FORM_PDF_URL = 'https://tswpsdsordafsmasnfuf.supabase.co/storage/v1/object/public/admission-forms/Buddha%20College%20of%20Nursing.pdf';

const DOCUMENT_TYPES = [
  { value: 'marksheet_10th', label: 'High School Marksheet' },
  { value: 'certificate_10th', label: 'High School Certificate' },
  { value: 'marksheet_12th', label: 'Intermediate Marksheet' },
  { value: 'certificate_12th', label: 'Intermediate Certificate' },
  { value: 'tc_migration', label: 'Transfer / Migration Certificate' },
  { value: 'caste_income', label: 'Caste / Domicile / Income Certificate' },
  { value: 'passport_photo', label: 'Passport Photo' },
  { value: 'id_proof', label: 'Aadhaar / ID Proof' },
  { value: 'other', label: 'Other Document' },
];

export default function OfflineAdmission() {
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [course, setCourse] = useState('GNM');
  const [academicSession, setAcademicSession] = useState('2025-26');
  const [declaration, setDeclaration] = useState(false);

  // Upload States
  const [filledFormFile, setFilledFormFile] = useState(null);
  const [filledFormUrl, setFilledFormUrl] = useState('');
  const [uploadingForm, setUploadingForm] = useState(false);
  const [formUploadProgress, setFormUploadProgress] = useState(0);

  // Supporting Documents State: list of { id, file, document_type, url, uploading, progress, error }
  const [supportingDocs, setSupportingDocs] = useState([]);

  // UI / Error States
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState('');
  const [submittedCredentials, setSubmittedCredentials] = useState(null);

  // Upload progress helper function
  const uploadWithProgress = (file, type, onProgress) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const res = JSON.parse(xhr.responseText);
            if (res.url) {
              resolve(res.url);
            } else {
              reject(new Error(res.message || 'Upload failed without URL'));
            }
          } catch (err) {
            reject(new Error('Invalid response from upload server'));
          }
        } else {
          try {
            const res = JSON.parse(xhr.responseText);
            reject(new Error(res.message || `Upload failed code ${xhr.status}`));
          } catch (err) {
            reject(new Error(`Upload failed code ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error('Network error during file upload'));
      xhr.open('POST', `${API}/upload`);
      const token = localStorage.getItem('token');
      if (token) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      }
      xhr.send(formData);
    });
  };

  // Upload Filled Form (PDF only, max 10MB)
  const handleFilledFormSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setErrors(prev => ({ ...prev, filled_form: 'Only PDF files are allowed for the offline admission form.' }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, filled_form: 'File size exceeds 10MB limit.' }));
      return;
    }

    setErrors(prev => ({ ...prev, filled_form: '' }));
    setFilledFormFile(file);
    setUploadingForm(true);
    setFormUploadProgress(0);

    try {
      const url = await uploadWithProgress(file, 'admission-document', (p) => setFormUploadProgress(p));
      setFilledFormUrl(url);
    } catch (err) {
      setErrors(prev => ({ ...prev, filled_form: err.message || 'Upload failed. Please try again.' }));
      setFilledFormFile(null);
    } finally {
      setUploadingForm(false);
    }
  };

  // Add supporting document entry
  const handleAddSupportingDoc = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (supportingDocs.length + files.length > 10) {
      setErrors(prev => ({ ...prev, supporting_docs: 'You can upload maximum 10 supporting documents.' }));
      return;
    }

    setErrors(prev => ({ ...prev, supporting_docs: '' }));

    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 10MB limit and was skipped.`);
        return;
      }

      const docId = 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const newEntry = {
        id: docId,
        file,
        name: file.name,
        size: file.size,
        document_type: 'marksheet_10th',
        url: '',
        uploading: true,
        progress: 0,
        error: ''
      };

      setSupportingDocs(prev => [...prev, newEntry]);

      // Automatically trigger upload
      uploadWithProgress(file, 'admission-document', (p) => {
        setSupportingDocs(prev => prev.map(d => d.id === docId ? { ...d, progress: p } : d));
      })
        .then(url => {
          setSupportingDocs(prev => prev.map(d => d.id === docId ? { ...d, url, uploading: false } : d));
        })
        .catch(err => {
          setSupportingDocs(prev => prev.map(d => d.id === docId ? { ...d, error: err.message || 'Upload failed', uploading: false } : d));
        });
    });
  };

  const handleUpdateDocType = (id, type) => {
    setSupportingDocs(prev => prev.map(d => d.id === id ? { ...d, document_type: type } : d));
  };

  const handleRemoveSupportingDoc = (id) => {
    setSupportingDocs(prev => prev.filter(d => d.id !== id));
  };

  // Validation
  const validate = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = 'Full Name is required';
    if (!phone.trim() || !/^[6-9]\d{9}$/.test(phone.trim())) {
      newErrors.phone = 'Valid 10-digit mobile number is required';
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!course) newErrors.course = 'Course selection is required';
    if (!academicSession) newErrors.academicSession = 'Academic session is required';
    if (!filledFormUrl) newErrors.filled_form = 'Filled Admission Form PDF must be uploaded';
    if (!declaration) newErrors.declaration = 'You must agree to the declaration before submitting';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 400, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    setSubmitProgress('Creating lead and student account...');

    try {
      // 1. POST /leads
      const leadRes = await fetch(`${API}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          source: 'offline_form'
        })
      });

      const leadData = await leadRes.json();
      if (!leadRes.ok) {
        throw new Error(leadData.message || 'Failed to submit lead information.');
      }

      const leadId = leadData.id;

      // 2. POST /admission-applications
      setSubmitProgress('Saving offline admission details...');
      const appRes = await fetch(`${API}/admission-applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: leadId,
          full_name: name.trim(),
          primary_mobile: phone.trim(),
          email: email.trim() || null,
          course,
          academic_session: academicSession,
          application_type: 'offline',
          offline_form_url: filledFormUrl
        })
      });

      const appData = await appRes.json();
      if (!appRes.ok) {
        throw new Error(appData.message || 'Failed to create admission application record.');
      }

      // 3. POST /admission-documents for filled form and all supporting docs
      setSubmitProgress('Saving attached documents...');
      const docsToSave = [
        {
          lead_id: leadId,
          document_type: 'offline_application_form',
          document_name: filledFormFile?.name || 'Offline_Admission_Form.pdf',
          file_url: filledFormUrl,
          file_size: filledFormFile?.size || null
        },
        ...supportingDocs.filter(d => d.url).map(d => ({
          lead_id: leadId,
          document_type: d.document_type,
          document_name: d.name,
          file_url: d.url,
          file_size: d.size || null
        }))
      ];

      for (const docObj of docsToSave) {
        try {
          await fetch(`${API}/admission-documents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(docObj)
          });
        } catch (e) {
          console.warn('Document record creation error:', e);
        }
      }

      // Success!
      setSubmittedCredentials({
        name: name.trim(),
        phone: phone.trim(),
        password: phone.trim(), // Default password for offline applications
        appRef: appData.application_ref || `BCN-${leadId.substring(0, 8).toUpperCase()}`
      });

    } catch (err) {
      console.error('Offline submission error:', err);
      alert(err.message || 'Submission failed. Please check your internet connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Confirmation Screen */}
        {submittedCredentials ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl space-y-6 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={48} />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                Application Submitted Successfully
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                Offline Admission Form Received
              </h1>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                Thank you <strong className="text-slate-800">{submittedCredentials.name}</strong>. Your offline application and uploaded documents have been registered.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 max-w-md mx-auto text-left space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-200 pb-2 flex items-center gap-2">
                <Key size={14} className="text-[#1E40FF]" /> Student Portal Credentials
              </h3>
              <div className="text-sm space-y-1.5 font-semibold">
                <div className="flex justify-between">
                  <span className="text-slate-500">Application Ref:</span>
                  <span className="font-mono font-bold text-slate-800">{submittedCredentials.appRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Username (Phone):</span>
                  <span className="font-bold text-[#1E40FF]">{submittedCredentials.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Default Password:</span>
                  <span className="font-mono font-bold text-slate-800">{submittedCredentials.password}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-200">
                Use your phone number as your default password to log in and track admission progress.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3.5 rounded-xl bg-[#1E40FF] hover:bg-blue-700 text-white font-extrabold text-sm transition-all shadow-lg shadow-blue-500/25 cursor-pointer border-none"
              >
                Go to Student Login
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm border border-slate-200 transition-all cursor-pointer"
              >
                Return Home
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Page Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
              <div className="relative z-10 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-extrabold uppercase tracking-wider backdrop-blur-md">
                  <FileText size={14} className="text-amber-400" /> Offline Admission Mode
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                  Download & Upload Offline Admission Form
                </h1>
                <p className="text-slate-300 text-sm sm:text-base max-w-2xl font-normal leading-relaxed">
                  Prefer paper applications? Download the official admission form, fill it out manually, and upload the scanned copy along with required documents below.
                </p>
              </div>
            </div>

            {/* Section A — Download Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1E40FF]">Section A</span>
                  <h2 className="text-xl font-extrabold text-slate-900">Download Admission Form</h2>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E40FF] flex items-center justify-center font-bold">
                  <Download size={20} />
                </div>
              </div>

              <p className="text-slate-600 text-sm leading-relaxed">
                Download the form, fill it by hand, get it signed, then upload the filled form along with your documents below.
              </p>

              {/* Large Download Button */}
              <a
                href={BLANK_FORM_PDF_URL}
                target="_blank"
                rel="noopener noreferrer"
                download="Buddha_College_of_Nursing_Admission_Form.pdf"
                className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-base transition-all shadow-lg shadow-blue-500/25 no-underline cursor-pointer group"
              >
                <Download size={22} className="group-hover:translate-y-0.5 transition-transform" />
                <span>Download Blank Form (PDF)</span>
              </a>

              {/* Document Checklist */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <CheckSquare size={16} className="text-[#1E40FF]" /> Required Documents Checklist (To be attached with paper form)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/60 shadow-2xs">
                    <FileCheck size={16} className="text-emerald-600 shrink-0" />
                    <span>High School Marksheet (10th)</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/60 shadow-2xs">
                    <FileCheck size={16} className="text-emerald-600 shrink-0" />
                    <span>High School Passing Certificate</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/60 shadow-2xs">
                    <FileCheck size={16} className="text-emerald-600 shrink-0" />
                    <span>Intermediate Marksheet (12th)</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/60 shadow-2xs">
                    <FileCheck size={16} className="text-emerald-600 shrink-0" />
                    <span>Intermediate Passing Certificate</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/60 shadow-2xs">
                    <FileCheck size={16} className="text-emerald-600 shrink-0" />
                    <span>Transfer / Migration Certificate</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/60 shadow-2xs">
                    <FileCheck size={16} className="text-emerald-600 shrink-0" />
                    <span>Caste / Domicile / Income Certificate</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/60 shadow-2xs sm:col-span-2">
                    <FileCheck size={16} className="text-emerald-600 shrink-0" />
                    <span>10 Colored Passport Size Photographs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section B — Upload Filled Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1E40FF]">Section B</span>
                  <h2 className="text-xl font-extrabold text-slate-900">Upload Filled Form & Details</h2>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Upload size={20} />
                </div>
              </div>

              {/* Minimal Student Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <User size={14} className="text-slate-400" /> Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter student's full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-[#1E40FF]"
                  />
                  {errors.name && <p className="text-xs text-red-500 font-semibold">{errors.name}</p>}
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Phone size={14} className="text-slate-400" /> Phone Number *
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-[#1E40FF]"
                  />
                  {errors.phone && <p className="text-xs text-red-500 font-semibold">{errors.phone}</p>}
                </div>

                {/* Email (Optional) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Mail size={14} className="text-slate-400" /> Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-[#1E40FF]"
                  />
                  {errors.email && <p className="text-xs text-red-500 font-semibold">{errors.email}</p>}
                </div>

                {/* Academic Session */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Academic Session *</label>
                  <select
                    value={academicSession}
                    onChange={(e) => setAcademicSession(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-[#1E40FF] bg-white"
                  >
                    <option value="2025-26">2025-26</option>
                    <option value="2026-27">2026-27</option>
                  </select>
                </div>

                {/* Course Applied (GNM / ANM Radio buttons) */}
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Course Applied *</label>
                  <div className="flex gap-4">
                    <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${course === 'GNM' ? 'border-[#1E40FF] bg-[#EEF2FF] shadow-xs' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                      <input
                        type="radio"
                        name="course"
                        value="GNM"
                        checked={course === 'GNM'}
                        onChange={() => setCourse('GNM')}
                        className="w-4 h-4 text-[#1E40FF]"
                      />
                      <div>
                        <span className="font-extrabold text-sm text-slate-900 block">GNM</span>
                        <span className="text-[11px] text-slate-500 font-medium">General Nursing & Midwifery (3 Years)</span>
                      </div>
                    </label>

                    <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${course === 'ANM' ? 'border-[#1E40FF] bg-[#EEF2FF] shadow-xs' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                      <input
                        type="radio"
                        name="course"
                        value="ANM"
                        checked={course === 'ANM'}
                        onChange={() => setCourse('ANM')}
                        className="w-4 h-4 text-[#1E40FF]"
                      />
                      <div>
                        <span className="font-extrabold text-sm text-slate-900 block">ANM</span>
                        <span className="text-[11px] text-slate-500 font-medium">Auxiliary Nursing Midwifery (2 Years)</span>
                      </div>
                    </label>
                  </div>
                </div>

              </div>

              {/* Upload Filled Form (PDF only, max 10MB) */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Upload Filled Form * (PDF only, max 10MB)</label>

                {!filledFormUrl ? (
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-blue-50/30 transition-colors relative">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFilledFormSelect}
                      disabled={uploadingForm}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-full bg-blue-100 text-[#1E40FF] flex items-center justify-center mx-auto">
                        {uploadingForm ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
                      </div>
                      <div className="text-sm font-bold text-slate-800">
                        {uploadingForm ? `Uploading filled form (${formUploadProgress}%)...` : 'Click or Drag & Drop scanned form PDF here'}
                      </div>
                      <p className="text-xs text-slate-400">PDF files up to 10MB allowed</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs font-semibold text-emerald-900">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileCheck size={24} className="text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <div className="font-bold truncate">{filledFormFile?.name || 'Filled_Admission_Form.pdf'}</div>
                        <div className="text-[11px] text-emerald-700">Scanned form uploaded successfully</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setFilledFormUrl(''); setFilledFormFile(null); }}
                      className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-800 cursor-pointer border-none bg-transparent"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
                {errors.filled_form && <p className="text-xs text-red-500 font-semibold">{errors.filled_form}</p>}
              </div>

              {/* Upload Supporting Documents (multiple files, up to 10) */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Upload Supporting Documents</label>
                    <p className="text-xs text-slate-400">Attach marksheets, certificates, photos (up to 10 files)</p>
                  </div>
                  <label className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider cursor-pointer border-none transition-all inline-flex items-center gap-1.5">
                    <Plus size={14} /> Add Documents
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={handleAddSupportingDoc}
                      className="hidden"
                    />
                  </label>
                </div>

                {supportingDocs.length > 0 && (
                  <div className="space-y-3">
                    {supportingDocs.map(doc => (
                      <div key={doc.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <FileText size={20} className="text-[#1E40FF] shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-800 truncate">{doc.name}</div>
                            {doc.uploading ? (
                              <div className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                                <Loader2 size={12} className="animate-spin" /> Uploading ({doc.progress}%)...
                              </div>
                            ) : doc.error ? (
                              <div className="text-[10px] text-red-500 font-semibold">{doc.error}</div>
                            ) : (
                              <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                                <CheckCircle2 size={12} /> Uploaded
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Document Type Selector */}
                        <div className="flex items-center gap-2">
                          <select
                            value={doc.document_type}
                            onChange={(e) => handleUpdateDocType(doc.id, e.target.value)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-700"
                          >
                            {DOCUMENT_TYPES.map(dt => (
                              <option key={dt.value} value={dt.value}>{dt.label}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleRemoveSupportingDoc(doc.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 cursor-pointer border-none bg-transparent"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {errors.supporting_docs && <p className="text-xs text-red-500 font-semibold">{errors.supporting_docs}</p>}
              </div>

              {/* Declaration Checkbox */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <label className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={declaration}
                    onChange={(e) => setDeclaration(e.target.checked)}
                    className="w-5 h-5 rounded text-[#1E40FF] mt-0.5"
                  />
                  <span className="text-xs font-semibold text-slate-700 leading-relaxed">
                    I hereby declare that the information provided in the attached offline form and supporting documents is true and authentic to the best of my knowledge.
                  </span>
                </label>
                {errors.declaration && <p className="text-xs text-red-500 font-semibold">{errors.declaration}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 rounded-2xl bg-[#1E40FF] hover:bg-blue-700 disabled:bg-slate-300 text-white font-extrabold text-base transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                {submitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>{submitProgress}</span>
                  </>
                ) : (
                  <>
                    <span>Submit Offline Application</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}
