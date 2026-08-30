import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2, ChevronRight, ChevronLeft, Save, FileText, Upload,
  Trash2, Plus, AlertCircle, Edit3, User, BookOpen, MapPin, Phone,
  GraduationCap, Shield, Building, RotateCcw, Info, Eye, EyeOff, Check,
  FileCheck, File, RefreshCw, Loader2, Key, MessageCircle, ArrowRight, Sparkles
} from 'lucide-react';
import { getSessionId, getLeadSource, linkLeadToSession } from '../utils/tracking';

const API = 'https://ictehub.onrender.com';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir',
  'Ladakh', 'Puducherry', 'Other'
];

const PROGRAM_COURSES = {
  'UG Degree': ['BCA', 'BBA', 'B.Com', 'B.Sc', 'BA', 'LLB'],
  'PG Degree': ['MBA', 'MCA', 'M.Com', 'M.Sc', 'MA'],
  'Diploma': ['PGDM', 'Diploma in Computer Science', 'Diploma in Business'],
  'Nursing': ['ANM', 'GNM', 'B.Sc Nursing'],
  'Certificate': ['Certificate in Digital Marketing', 'Certificate in Data Analytics', 'Certificate in Cyber Security', 'Other Certificate']
};

const INITIAL_FORM_STATE = {
  // Step 1: Course Details
  program_type: 'UG Degree',
  course: 'BCA',
  specialization: '',
  preferred_college_type: 'Both',
  academic_session: '2025-26',
  category: 'General',

  // Step 2: Personal Details
  full_name: '',
  father_name: '',
  mother_name: '',
  dob: '',
  gender: 'Male',
  nationality: 'Indian',
  blood_group: '',
  aadhaar_number: '',
  photo_url: '',

  // Step 3: Contact & Address
  permanent_address: {
    address_line_1: '',
    address_line_2: '',
    city: '',
    district: '',
    state: 'Maharashtra',
    pincode: '',
  },
  same_as_permanent: true,
  correspondence_address: {
    address_line_1: '',
    address_line_2: '',
    city: '',
    district: '',
    state: 'Maharashtra',
    pincode: '',
  },
  primary_mobile: '',
  alternate_mobile: '',
  email: '',

  // Step 4: Academic Qualifications
  qualifications: [
    {
      id: 'q10',
      level: 'Class 10',
      board: '',
      institution: '',
      year: '',
      stream: 'All Subjects',
      percentage: '',
      division: 'First',
      required: true,
    },
    {
      id: 'q12',
      level: 'Class 12',
      board: '',
      institution: '',
      year: '',
      stream: 'Science',
      percentage: '',
      division: 'First',
      required: true,
    }
  ],

  // Step 5: Additional Info
  guardian_name: '',
  guardian_relationship: 'Father',
  guardian_mobile: '',
  hostel_required: 'No',
  hostel_location: '',
  scholarship_required: 'No',
  hear_about_us: 'Google Search',
  source: '',

  // Step 6: Documents
  documents: {},

  // Step 7: Review & Declaration
  declaration_accepted: false,
};

/**
 * Helper to normalize date of birth into DDMMYYYY format string for student default password
 */
function formatDobToDDMMYYYY(dobStr) {
  if (!dobStr || typeof dobStr !== 'string') return '';
  const trimmed = dobStr.trim();
  if (/^\d{8}$/.test(trimmed)) return trimmed;

  const ymdMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${day}${month}${year}`;
  }

  const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${day}${month}${year}`;
  }

  const parsedDate = new Date(trimmed);
  if (!isNaN(parsedDate.getTime())) {
    const day = String(parsedDate.getDate()).padStart(2, '0');
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const year = String(parsedDate.getFullYear());
    return `${day}${month}${year}`;
  }
  return '';
}

/**
 * Helper to strip base64 data URLs, File instances, or non-serializable objects
 * to prevent localStorage QuotaExceededError and 413 Payload Too Large on POST /leads.
 */
function sanitizeFormData(data) {
  if (!data) return data;
  const cleanData = JSON.parse(JSON.stringify(data));

  // Sanitize photo_url if it's base64 data URL
  if (cleanData.photo_url && typeof cleanData.photo_url === 'string' && cleanData.photo_url.startsWith('data:')) {
    cleanData.photo_url = '';
  }

  // Sanitize documents object: keep only real HTTP/HTTPS URLs
  if (cleanData.documents && typeof cleanData.documents === 'object') {
    const cleanDocs = {};
    for (const [docType, docMeta] of Object.entries(cleanData.documents)) {
      if (docMeta && typeof docMeta === 'object') {
        const fileUrl = docMeta.file_url;
        if (typeof fileUrl === 'string' && !fileUrl.startsWith('data:')) {
          cleanDocs[docType] = {
            file_url: fileUrl,
            document_name: docMeta.document_name || '',
            file_size: docMeta.file_size || null
          };
        }
      }
    }
    cleanData.documents = cleanDocs;
  }

  return cleanData;
}

/**
 * Reusable helper function for uploading files with XMLHttpRequest to track progress
 * and attach the Authorization header automatically.
 */
function uploadWithProgress(file, type, token, onProgress) {
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
            reject(new Error(res.message || 'Upload succeeded but server returned no URL'));
          }
        } catch (err) {
          reject(new Error('Invalid JSON response from upload server'));
        }
      } else {
        try {
          const res = JSON.parse(xhr.responseText);
          reject(new Error(res.message || `Upload failed with status ${xhr.status}`));
        } catch (err) {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.onabort = () => reject(new Error('Upload aborted'));

    xhr.open('POST', `${API}/upload`);
    const authToken = token || localStorage.getItem('token');
    if (authToken) {
      xhr.setRequestHeader('Authorization', 'Bearer ' + authToken);
    }
    xhr.send(formData);
  });
}

export default function AdmissionForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState('');

  // Document upload state: { [docType]: boolean }
  const [uploadingDocs, setUploadingDocs] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [docUploadErrors, setDocUploadErrors] = useState({});

  // Draft Banner State
  const [draftBannerVisible, setDraftBannerVisible] = useState(false);
  const [savedToast, setSavedToast] = useState('');

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submittingProgress, setSubmittingProgress] = useState('');
  const [submittedLead, setSubmittedLead] = useState(null);
  const [hasUrlSource, setHasUrlSource] = useState(false);

  // Mask Aadhaar display state
  const [showFullAadhaar, setShowFullAadhaar] = useState(false);

  // Institute courses state
  const [instituteCourses, setInstituteCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Check URL params on mount & fetch institute courses
  useEffect(() => {
    const urlSource = searchParams.get('source');
    if (urlSource) {
      setHasUrlSource(true);
      setFormData(prev => ({ ...prev, source: urlSource.trim() }));
    } else {
      const source = getLeadSource();
      setFormData(prev => ({ ...prev, source: source || 'direct' }));
    }

    // Fetch Institute Courses from backend
    fetch(`${API}/institute-courses`)
      .then(res => res.json())
      .then(courses => {
        const list = Array.isArray(courses) ? courses : [];
        setInstituteCourses(list);

        const paramCourse = searchParams.get('course');
        if (!paramCourse) {
          // Redirect to homepage if no course parameter specified
          navigate('/', { replace: true });
          return;
        }

        const matched = list.find(c => (c.name || c.title || '').toLowerCase() === paramCourse.trim().toLowerCase());
        if (!matched) {
          // Redirect to homepage if course is invalid / not found in institute courses
          navigate('/', { replace: true });
          return;
        }

        setFormData(prev => ({
          ...prev,
          course: matched.name || matched.title,
          program_type: matched.program_type || matched.category || 'Nursing'
        }));
      })
      .catch(err => {
        console.error('Error fetching institute courses:', err);
      })
      .finally(() => setLoadingCourses(false));

    const savedDraft = localStorage.getItem('admission_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed && parsed.formData) {
          setDraftBannerVisible(true);
        }
      } catch (e) {
        localStorage.removeItem('admission_draft');
      }
    }
  }, [searchParams, navigate]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (submittedLead) return;
    const interval = setInterval(() => {
      saveDraftToLocalStorage(formData, currentStep, false);
    }, 30000);
    return () => clearInterval(interval);
  }, [formData, currentStep, submittedLead]);

  const saveDraftToLocalStorage = (dataToSave, stepToSave, showToastMsg = true) => {
    if (submittedLead) return;
    try {
      const sanitized = sanitizeFormData(dataToSave);
      const draftObj = {
        formData: sanitized,
        currentStep: stepToSave,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('admission_draft', JSON.stringify(draftObj));
      if (showToastMsg) {
        setSavedToast('Draft saved to localStorage!');
        setTimeout(() => setSavedToast(''), 3000);
      }
    } catch (err) {
      console.warn('Could not save draft to localStorage:', err);
    }
  };

  const handleResumeDraft = () => {
    const savedDraft = localStorage.getItem('admission_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.formData) {
          setFormData(parsed.formData);
          if (parsed.currentStep) setCurrentStep(parsed.currentStep);
        }
      } catch (e) {}
    }
    setDraftBannerVisible(false);
  };

  const handleStartFresh = () => {
    localStorage.removeItem('admission_draft');
    setFormData(INITIAL_FORM_STATE);
    setCurrentStep(1);
    setDraftBannerVisible(false);
  };

  const handleProgramTypeChange = (e) => {
    const newProg = e.target.value;
    const availableCourses = PROGRAM_COURSES[newProg] || [];
    const firstCourse = availableCourses[0] || '';

    setFormData(prev => ({
      ...prev,
      program_type: newProg,
      course: firstCourse,
      specialization: firstCourse === 'MBA' ? 'Finance' : ''
    }));

    const req12 = ['UG Degree', 'PG Degree', 'Nursing'].includes(newProg);
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.map(q =>
        q.level === 'Class 12' ? { ...q, required: req12 } : q
      )
    }));
  };

  const handleCourseChange = (e) => {
    const newCourse = e.target.value;
    setFormData(prev => ({
      ...prev,
      course: newCourse,
      specialization: newCourse === 'MBA' ? (prev.specialization || 'Finance') : ''
    }));
  };

  // Profile photo upload handler (POST /upload type="profile-picture")
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setPhotoUploadError('File size limit exceeded. Maximum file size is 2MB.');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPhotoUploadError('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
      return;
    }

    setUploadingPhoto(true);
    setPhotoUploadError('');

    try {
      const token = localStorage.getItem('token');
      const uploadedUrl = await uploadWithProgress(file, 'profile-picture', token);

      setFormData(prev => ({
        ...prev,
        photo_url: uploadedUrl,
        documents: {
          ...prev.documents,
          passport_photo: {
            file_url: uploadedUrl,
            document_name: file.name,
            file_size: file.size
          }
        }
      }));
    } catch (err) {
      setPhotoUploadError(err.message || 'Upload failed');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // General Document Upload Handler with real-time XMLHttpRequest progress tracking
  const handleDocumentUpload = async (docType, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setDocUploadErrors(prev => ({ ...prev, [docType]: 'File size exceeds 5MB limit.' }));
      return;
    }

    const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedMime.includes(file.type)) {
      setDocUploadErrors(prev => ({ ...prev, [docType]: 'Only JPG, PNG, WebP, and PDF files are allowed.' }));
      return;
    }

    setUploadingDocs(prev => ({ ...prev, [docType]: true }));
    setUploadProgress(prev => ({ ...prev, [docType]: 0 }));
    setDocUploadErrors(prev => ({ ...prev, [docType]: '' }));

    try {
      const token = localStorage.getItem('token');
      const uploadedUrl = await uploadWithProgress(
        file,
        'admission-document',
        token,
        (percent) => {
          setUploadProgress(prev => ({ ...prev, [docType]: percent }));
        }
      );

      const docObj = {
        file_url: uploadedUrl,
        document_name: file.name,
        file_size: file.size
      };

      setFormData(prev => {
        const updated = {
          ...prev,
          documents: {
            ...prev.documents,
            [docType]: docObj
          }
        };
        if (docType === 'passport_photo') {
          updated.photo_url = uploadedUrl;
        }
        return updated;
      });
    } catch (err) {
      setDocUploadErrors(prev => ({ ...prev, [docType]: err.message || 'Upload failed — try again' }));
    } finally {
      setUploadingDocs(prev => ({ ...prev, [docType]: false }));
    }
  };

  const handleRemoveDocument = (docType) => {
    setFormData(prev => {
      const updatedDocs = { ...prev.documents };
      delete updatedDocs[docType];
      return {
        ...prev,
        documents: updatedDocs,
        ...(docType === 'passport_photo' ? { photo_url: '' } : {})
      };
    });
  };

  // Qualification handlers
  const handleAddQualification = () => {
    const newId = 'q_' + Date.now();
    setFormData(prev => ({
      ...prev,
      qualifications: [
        ...prev.qualifications,
        {
          id: newId,
          level: 'Diploma',
          board: '',
          institution: '',
          year: '',
          stream: '',
          percentage: '',
          division: 'First',
          required: false,
        }
      ]
    }));
  };

  const handleRemoveQualification = (id) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter(q => q.id !== id)
    }));
  };

  const handleQualificationChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.map(q =>
        q.id === id ? { ...q, [field]: value } : q
      )
    }));
  };

  // Step validation
  const validateStep = (stepNumber) => {
    const newErrors = {};

    if (stepNumber === 1) {
      if (!formData.program_type) newErrors.program_type = 'Program Type is required';
      if (!formData.course) newErrors.course = 'Course selection is required';
      if (!formData.academic_session) newErrors.academic_session = 'Academic Session is required';
      if (!formData.category) newErrors.category = 'Category is required';
    }

    if (stepNumber === 2) {
      if (!formData.full_name.trim()) newErrors.full_name = 'Full Name is required';
      if (!formData.father_name.trim()) newErrors.father_name = "Father's Name is required";
      if (!formData.mother_name.trim()) newErrors.mother_name = "Mother's Name is required";
      if (!formData.dob) newErrors.dob = 'Date of Birth is required';
      if (!formData.gender) newErrors.gender = 'Gender selection is required';
      if (!formData.nationality.trim()) newErrors.nationality = 'Nationality is required';
      if (!formData.blood_group) newErrors.blood_group = 'Blood group is required';
      if (!formData.photo_url) newErrors.photo_url = 'Passport size photograph is required';

      if (formData.aadhaar_number && !/^\d{12}$/.test(formData.aadhaar_number.replace(/\s/g, ''))) {
        newErrors.aadhaar_number = 'Aadhaar Number must be 12 digits';
      }
    }

    if (stepNumber === 3) {
      const perm = formData.permanent_address;
      if (!perm.address_line_1.trim()) newErrors.perm_line1 = 'Address Line 1 is required';
      if (!perm.city.trim()) newErrors.perm_city = 'City/Town is required';
      if (!perm.district.trim()) newErrors.perm_district = 'District is required';
      if (!perm.state) newErrors.perm_state = 'State selection is required';
      if (!perm.pincode.trim() || !/^\d{6}$/.test(perm.pincode.trim())) {
        newErrors.perm_pincode = 'Valid 6-digit PIN code is required';
      }

      if (!formData.same_as_permanent) {
        const corr = formData.correspondence_address;
        if (!corr.address_line_1.trim()) newErrors.corr_line1 = 'Address Line 1 is required';
        if (!corr.city.trim()) newErrors.corr_city = 'City/Town is required';
        if (!corr.district.trim()) newErrors.corr_district = 'District is required';
        if (!corr.state) newErrors.corr_state = 'State selection is required';
        if (!corr.pincode.trim() || !/^\d{6}$/.test(corr.pincode.trim())) {
          newErrors.corr_pincode = 'Valid 6-digit PIN code is required';
        }
      }

      if (!formData.primary_mobile.trim() || !/^[6-9]\d{9}$/.test(formData.primary_mobile.trim())) {
        newErrors.primary_mobile = 'Valid 10-digit Indian mobile number is required';
      }

      if (formData.alternate_mobile && !/^[6-9]\d{9}$/.test(formData.alternate_mobile.trim())) {
        newErrors.alternate_mobile = 'Alternate mobile must be a valid 10-digit number';
      }

      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        newErrors.email = 'Valid Email Address is required';
      }
    }

    if (stepNumber === 4) {
      formData.qualifications.forEach((q) => {
        const isClass12Req = q.level === 'Class 12' && ['UG Degree', 'PG Degree', 'Nursing'].includes(formData.program_type);
        const isRequired = q.required || isClass12Req || q.level === 'Class 10';

        if (isRequired) {
          if (!q.board.trim()) newErrors[`qual_${q.id}_board`] = 'Board/University is required';
          if (!q.institution.trim()) newErrors[`qual_${q.id}_institution`] = 'School/Institution is required';
          if (!q.year || !/^\d{4}$/.test(q.year)) newErrors[`qual_${q.id}_year`] = 'Valid 4-digit Year is required';
          if (!q.percentage || isNaN(q.percentage) || Number(q.percentage) < 0 || Number(q.percentage) > 100) {
            newErrors[`qual_${q.id}_percentage`] = 'Percentage/CGPA must be 0-100';
          }
        }
      });
    }

    if (stepNumber === 5) {
      if (!formData.guardian_name.trim()) newErrors.guardian_name = 'Guardian Name is required';
      if (!formData.guardian_relationship) newErrors.guardian_relationship = 'Relationship is required';
      if (!formData.guardian_mobile.trim() || !/^[6-9]\d{9}$/.test(formData.guardian_mobile.trim())) {
        newErrors.guardian_mobile = 'Valid 10-digit Guardian Mobile is required';
      }
      if (formData.hostel_required === 'Yes' && !formData.hostel_location.trim()) {
        newErrors.hostel_location = 'Preferred Location is required when Hostel is requested';
      }
    }

    if (stepNumber === 6) {
      // Validate mandatory document uploads (must have real Supabase storage URL, no data: URLs)
      const docCards = getDocumentCardsList();
      docCards.forEach(doc => {
        const docMeta = formData.documents ? formData.documents[doc.type] : null;
        const isInvalid = !docMeta || !docMeta.file_url || docMeta.file_url.startsWith('data:');
        if (doc.required && isInvalid) {
          newErrors[`doc_${doc.type}`] = `Please upload ${doc.title} to continue`;
        }
      });
    }

    if (stepNumber === 7) {
      if (!formData.declaration_accepted) {
        newErrors.declaration_accepted = 'You must accept the declaration to submit your application';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    const isValid = validateStep(currentStep);
    console.log(`Step ${currentStep} validation result:`, isValid, errors);
    if (isValid) {
      const nextStepNum = currentStep + 1;
      setCurrentStep(nextStepNum);
      saveDraftToLocalStorage(formData, nextStepNum, false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    const prevStepNum = currentStep - 1;
    setCurrentStep(prevStepNum);
    saveDraftToLocalStorage(formData, prevStepNum, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleManualSaveDraft = () => {
    saveDraftToLocalStorage(formData, currentStep, true);
  };

  // Helper list for document cards with conditional requirement logic
  const getDocumentCardsList = () => {
    const isUGorPGorNursing = ['UG Degree', 'PG Degree', 'Nursing'].includes(formData.program_type);
    const isPG = formData.program_type === 'PG Degree';
    const isReservedCategory = ['OBC', 'SC', 'ST', 'EWS'].includes(formData.category);

    return [
      { type: 'passport_photo', title: 'Passport Photo', desc: 'Clear front-facing passport photograph', required: true },
      { type: 'marksheet_10th', title: '10th Marksheet', desc: 'High School / Class 10 passing marksheet', required: true },
      { type: 'marksheet_12th', title: '12th Marksheet', desc: 'Higher Secondary / Class 12 marksheet', required: isUGorPGorNursing },
      { type: 'graduation_marksheet', title: 'Graduation Marksheet', desc: 'Bachelor degree marksheet for PG admissions', required: isPG },
      { type: 'id_proof', title: 'ID Proof (Aadhaar / PAN)', desc: 'Government issued Identity Card', required: true },
      { type: 'address_proof', title: 'Address Proof', desc: 'Utility bill, Passport or Ration Card', required: false },
      { type: 'category_certificate', title: 'Category Certificate', desc: 'Caste or EWS certificate if applicable', required: isReservedCategory },
      { type: 'transfer_certificate', title: 'Transfer Certificate (TC)', desc: 'School / Institution leaving certificate', required: false },
      { type: 'migration_certificate', title: 'Migration Certificate', desc: 'Board or University migration certificate', required: false },
      { type: 'other', title: 'Other Document', desc: 'Any additional supporting academic document', required: false },
    ];
  };

  // Final Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    let isValid = true;
    for (let s = 1; s <= 7; s++) {
      if (!validateStep(s)) {
        isValid = false;
        setCurrentStep(s);
        break;
      }
    }

    if (!isValid) return;

    setSubmitting(true);
    setSubmittingProgress('Submitting application details...');

    try {
      const sessionId = getSessionId();
      const finalSource = formData.source || getLeadSource() || 'admission-form';

      const payload = {
        name: formData.full_name,
        phone: formData.primary_mobile,
        email: formData.email,
        interested_college_ids: [],
        source: finalSource,
        session_id: sessionId,
        admission_form_data: JSON.stringify(sanitizeFormData(formData))
      };

      // 1. POST /leads
      const response = await fetch(`${API}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Failed to submit application.');
      }

      const newLeadId = resData.id;
      let applicationRef = resData.application_ref || (`BCN-${newLeadId.substring(0, 8).toUpperCase()}`);

      // 2. POST /admission-applications (Relational Application Schema)
      try {
        setSubmittingProgress('Creating relational admission records...');
        const appPayload = {
          lead_id: newLeadId,
          student_user_id: resData.student_user_id || null,
          program_type: formData.program_type,
          course: formData.course,
          specialization: formData.specialization || null,
          preferred_college_type: formData.preferred_college_type || null,
          academic_session: formData.academic_session || '2025-26',
          category: formData.category || 'General',
          
          full_name: formData.full_name,
          father_name: formData.father_name,
          mother_name: formData.mother_name,
          dob: formData.dob || null,
          gender: formData.gender,
          nationality: formData.nationality || 'Indian',
          blood_group: formData.blood_group || null,
          aadhaar_number: formData.aadhaar_number || null,
          photo_url: formData.photo_url || null,
          
          primary_mobile: formData.primary_mobile,
          alternate_mobile: formData.alternate_mobile || null,
          email: formData.email || null,
          perm_address_line1: formData.permanent_address?.address_line_1 || null,
          perm_address_line2: formData.permanent_address?.address_line_2 || null,
          perm_city: formData.permanent_address?.city || null,
          perm_district: formData.permanent_address?.district || null,
          perm_state: formData.permanent_address?.state || null,
          perm_pin: formData.permanent_address?.pincode || null,
          corr_same_as_perm: Boolean(formData.same_as_permanent),
          corr_address_line1: !formData.same_as_permanent ? formData.correspondence_address?.address_line_1 : null,
          corr_address_line2: !formData.same_as_permanent ? formData.correspondence_address?.address_line_2 : null,
          corr_city: !formData.same_as_permanent ? formData.correspondence_address?.city : null,
          corr_district: !formData.same_as_permanent ? formData.correspondence_address?.district : null,
          corr_state: !formData.same_as_permanent ? formData.correspondence_address?.state : null,
          corr_pin: !formData.same_as_permanent ? formData.correspondence_address?.pincode : null,
          
          guardian_name: formData.guardian_name || null,
          guardian_relationship: formData.guardian_relationship || null,
          guardian_mobile: formData.guardian_mobile || null,
          hostel_required: formData.hostel_required === 'Yes',
          hostel_location: formData.hostel_required === 'Yes' ? (formData.hostel_location || null) : null,
          scholarship_required: formData.scholarship_required === 'Yes',
          heard_about_us: formData.hear_about_us || formData.heard_about_us || null,
          source: finalSource,
          
          qualifications: Array.isArray(formData.qualifications) ? formData.qualifications.map((q, idx) => ({
            examination: q.level || q.examination || '',
            board_institution: [q.board, q.institution].filter(Boolean).join(' / ') || q.board || q.institution || '',
            year_of_passing: String(q.year || q.year_of_passing || ''),
            stream_subjects: q.stream || q.stream_subjects || '',
            percentage_cgpa: String(q.percentage || q.percentage_cgpa || ''),
            division: q.division || '',
            sort_order: idx
          })) : []
        };

        const appRes = await fetch(`${API}/admission-applications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appPayload)
        });

        if (appRes.ok) {
          const appData = await appRes.json();
          if (appData.application_ref) {
            applicationRef = appData.application_ref;
          }
        }
      } catch (appErr) {
        console.warn('Relational application creation error:', appErr);
      }

      // 3. Save each uploaded document via POST /admission-documents
      if (newLeadId && formData.documents) {
        setSubmittingProgress('Linking uploaded documents...');
        const docEntries = Object.entries(formData.documents);

        for (const [docType, docMeta] of docEntries) {
          if (docMeta && docMeta.file_url) {
            try {
              await fetch(`${API}/admission-documents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  lead_id: newLeadId,
                  document_type: docType,
                  document_name: docMeta.document_name || `${docType}.pdf`,
                  file_url: docMeta.file_url,
                  file_size: docMeta.file_size || null
                })
              });
            } catch (docErr) {
              console.error(`Error saving document ${docType}:`, docErr);
            }
          }
        }
      }

      // 4. Link session to lead
      if (newLeadId) {
        linkLeadToSession(newLeadId);
      }

      // 5. Clear draft from localStorage
      localStorage.removeItem('admission_draft');
      setSubmittedLead({
        ...resData,
        application_ref: applicationRef
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrors({ submit: err.message || 'Server error. Please try again.' });
    } finally {
      setSubmitting(false);
      setSubmittingProgress('');
    }
  };

  // Confirmation Screen
  if (submittedLead) {
    const refNum = submittedLead.application_ref || (submittedLead.id || 'SUBMITTED').substring(0, 8).toUpperCase();
    const submitDate = new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const defaultDobPassword = submittedLead.student_credentials?.default_password || formatDobToDDMMYYYY(formData.dob) || formData.primary_mobile.trim();

    const handleGoToDashboard = async () => {
      try {
        const studentEmail = `${formData.primary_mobile.trim()}@student.ictehub`.toLowerCase();
        const res = await fetch(`${API}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: studentEmail,
            password: defaultDobPassword
          })
        });

        if (res.ok) {
          const authData = await res.json();
          localStorage.setItem('token', authData.token);
          if (authData.user) {
            localStorage.setItem('user', JSON.stringify(authData.user));
          }
          navigate('/student/dashboard');
          return;
        }
      } catch (e) {
        console.warn('Auto-login exception:', e);
      }
      navigate('/login');
    };

    const handleShareWhatsApp = () => {
      const portalUrl = `${window.location.origin}/login`;
      const text = `🎓 *Buddha College of Nursing Admission Application*\n\n` +
        `👤 *Applicant:* ${formData.full_name}\n` +
        `📚 *Course:* ${formData.course} (${formData.program_type})\n` +
        `🆔 *Application ID:* ${refNum}\n` +
        `📅 *Session:* ${formData.academic_session}\n\n` +
        `🔐 *Student Portal Login:*\n` +
        `• Phone: ${formData.primary_mobile}\n` +
        `• Default Password: ${defaultDobPassword} (DOB in DDMMYYYY)\n` +
        `• Login Link: ${portalUrl}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-blue-500/20">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center mb-6 shadow-xl animate-bounce">
                <CheckCircle2 size={48} className="text-white" />
              </div>
              <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-widest text-emerald-100 mb-3 border border-white/20">
                Application Received
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
                Application Submitted Successfully!
              </h1>
              <p className="text-emerald-100 font-medium text-sm sm:text-base max-w-md">
                Your admission application, documents, and student account have been created.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-10 space-y-8">
            
            {/* Reference Header */}
            <div className="bg-[#EEF2FF] border border-blue-200/60 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block mb-1">
                  Application Reference Number
                </span>
                <span className="text-2xl font-black text-[#1E40FF] tracking-wider font-mono">
                  {refNum}
                </span>
              </div>
              <div className="h-10 w-px bg-blue-200 hidden sm:block"></div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block mb-1">
                  Submitted Date / Time
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {submitDate}
                </span>
              </div>
            </div>

            {/* Student Login Credentials Box */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-4">
              <div className="flex items-center gap-2">
                <Key className="text-blue-300" size={22} />
                <h3 className="text-lg font-black tracking-tight text-white">
                  Your Student Dashboard Login Credentials:
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-xs">
                <div>
                  <span className="text-blue-200 text-[10px] font-extrabold uppercase tracking-wider block">Registered Phone (Login ID)</span>
                  <span className="text-base font-black text-white font-mono mt-0.5 block">+91 {formData.primary_mobile}</span>
                </div>
                <div>
                  <span className="text-blue-200 text-[10px] font-extrabold uppercase tracking-wider block">Default Password (DOB in DDMMYYYY)</span>
                  <span className="text-base font-black text-emerald-300 font-mono mt-0.5 block">{defaultDobPassword}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs text-blue-200 font-medium bg-white/5 p-3 rounded-xl border border-white/10">
                <Shield size={16} className="text-amber-300 shrink-0 mt-0.5" />
                <span>
                  <strong>Important:</strong> Your default password is your Date of Birth in DDMMYYYY format ({defaultDobPassword}). Please log in to your Student Dashboard and change your password to secure your account.
                </span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleGoToDashboard}
                  className="flex-1 py-4 px-6 rounded-2xl bg-[#1E40FF] hover:bg-blue-600 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 cursor-pointer border-none"
                >
                  <Sparkles size={16} /> Go to My Dashboard <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer border-none"
                >
                  <MessageCircle size={16} /> Share via WhatsApp
                </button>
              </div>
            </div>

            {/* Application Summary */}
            <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-200 pb-3 flex items-center gap-2">
                <FileText size={16} className="text-[#1E40FF]" /> Application Summary
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Applicant Name</span>
                  <span className="font-bold text-slate-900">{formData.full_name}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Selected Course</span>
                  <span className="font-bold text-slate-900">{formData.course} ({formData.program_type})</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Academic Session</span>
                  <span className="font-bold text-slate-900">{formData.academic_session}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Registered Mobile</span>
                  <span className="font-bold text-slate-900">+91 {formData.primary_mobile}</span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-6">
              <h4 className="text-base font-extrabold text-amber-900 mb-2 flex items-center gap-2">
                <Info size={20} className="text-amber-600" /> What happens next?
              </h4>
              <p className="text-sm font-medium text-amber-800 leading-relaxed">
                Thank you for applying to Buddha College of Nursing. Our counselor will contact you within <strong>24 hours</strong> on your registered mobile number <strong>+91 {formData.primary_mobile}</strong>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-4 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm uppercase tracking-wider transition-all shadow-md text-center cursor-pointer border-none"
              >
                Go to Home
              </button>
              <button
                onClick={handleGoToDashboard}
                className="flex-1 py-4 px-6 rounded-xl bg-[#1E40FF] hover:bg-blue-700 text-white font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-blue-500/20 text-center cursor-pointer border-none"
              >
                Open Student Portal
              </button>
            </div>

          </div>

        </div>
      </div>
    );
  }

  const stepsList = [
    { num: 1, title: 'Course Details', subtitle: 'Program & session' },
    { num: 2, title: 'Personal Details', subtitle: 'Basic information' },
    { num: 3, title: 'Contact & Address', subtitle: 'Communication' },
    { num: 4, title: 'Qualifications', subtitle: 'Academic records' },
    { num: 5, title: 'Additional Info', subtitle: 'Preferences & emergency' },
    { num: 6, title: 'Documents', subtitle: 'Upload certificates' },
    { num: 7, title: 'Review & Submit', subtitle: 'Final verification' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-blue-500/20">
      
      {savedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700">
          <Check size={18} className="text-emerald-400" />
          <span className="text-xs font-bold">{savedToast}</span>
        </div>
      )}

      {/* Saved Draft Banner */}
      {draftBannerVisible && (
        <div className="max-w-5xl mx-auto mb-6 bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-blue-700">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <RotateCcw size={20} className="text-blue-300" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white">You have a saved draft. Resume?</h4>
              <p className="text-xs text-blue-200">Resume your application including uploaded document links.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleResumeDraft}
              className="px-4 py-2 bg-white hover:bg-blue-50 text-[#1E40FF] rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-none shadow-sm"
            >
              Resume
            </button>
            <button
              onClick={handleStartFresh}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-white/20"
            >
              Start Fresh
            </button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Main Portal Header */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF2FF] text-[#1E40FF] text-[11px] font-extrabold uppercase tracking-wider mb-2">
              <Building size={14} /> Buddha College of Nursing Admissions Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Online Admission Application Form
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
              Please complete all required fields and upload your documents.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleManualSaveDraft}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
            >
              <Save size={16} className="text-[#1E40FF]" /> Save as Draft
            </button>
          </div>
        </div>

        {/* Progress Bar & Step Tracker */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Step {currentStep} of 7</span>
            <span className="text-[#1E40FF] font-extrabold">{Math.round((currentStep / 7) * 100)}% Completed</span>
          </div>

          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1E40FF] to-indigo-600 transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / 7) * 100}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {stepsList.map((step) => {
              const isDone = step.num < currentStep;
              const isCurrent = step.num === currentStep;

              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => {
                    if (isDone) setCurrentStep(step.num);
                  }}
                  disabled={!isDone && !isCurrent}
                  className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-[#EEF2FF] border-[#1E40FF] text-[#1E40FF] shadow-sm'
                      : isDone
                      ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      : 'bg-slate-50/50 border-slate-100 text-slate-300 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                      isDone
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-[#1E40FF] text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {isDone ? <Check size={12} /> : step.num}
                    </span>
                    {isDone && <span className="text-[9px] font-extrabold text-emerald-600 uppercase">Done</span>}
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold leading-tight">{step.title}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl flex items-center gap-3 text-sm font-semibold">
            <AlertCircle size={20} className="shrink-0 text-red-500" />
            <span>{errors.submit}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-10 space-y-8">
          
          {/* STEP 1: COURSE DETAILS */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="text-[#1E40FF]" size={24} /> Step 1 — Course Details
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Select your program for admission to Buddha College of Nursing.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Course *</label>
                  {loadingCourses ? (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-400 flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-[#1E40FF]" /> Loading institute courses...
                    </div>
                  ) : (
                    <select
                      value={formData.course}
                      onChange={(e) => {
                        const selectedCourseName = e.target.value;
                        const matched = instituteCourses.find(c => (c.name || c.title) === selectedCourseName);
                        setFormData(prev => ({
                          ...prev,
                          course: selectedCourseName,
                          program_type: matched?.program_type || matched?.category || 'Nursing'
                        }));
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-[#1E40FF] text-sm"
                    >
                      {instituteCourses.map((c) => (
                        <option key={c.id || c.name} value={c.name || c.title}>
                          {c.name || c.title} {c.duration ? `(${c.duration})` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {formData.course === 'MBA' && (
                  <div className="space-y-2 md:col-span-2 bg-[#EEF2FF]/60 p-4 rounded-2xl border border-blue-100">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1E40FF]">MBA Specialization (Optional)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      {['Finance', 'HR', 'Marketing', 'Operations'].map((spec) => (
                        <label
                          key={spec}
                          className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer font-bold text-xs ${
                            formData.specialization === spec
                              ? 'bg-[#1E40FF] text-white border-[#1E40FF]'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name="specialization"
                            value={spec}
                            checked={formData.specialization === spec}
                            onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                            className="hidden"
                          />
                          <span>{spec}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">Preferred College Type</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: 'Online', label: 'Online' },
                      { value: 'Offline', label: 'Offline' },
                      { value: 'Both', label: 'Both' }
                    ].map((mode) => (
                      <label
                        key={mode.value}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border cursor-pointer text-center ${
                          formData.preferred_college_type === mode.value
                            ? 'bg-[#EEF2FF] border-[#1E40FF] text-[#1E40FF] font-extrabold'
                            : 'bg-white border-slate-200 text-slate-600 font-semibold'
                        }`}
                      >
                        <input
                          type="radio"
                          name="preferred_college_type"
                          value={mode.value}
                          checked={formData.preferred_college_type === mode.value}
                          onChange={(e) => setFormData(prev => ({ ...prev, preferred_college_type: e.target.value }))}
                          className="hidden"
                        />
                        <span className="text-sm">{mode.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Academic Session *</label>
                  <select
                    value={formData.academic_session}
                    onChange={(e) => setFormData(prev => ({ ...prev, academic_session: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 text-sm"
                  >
                    <option value="2025-26">2025-26</option>
                    <option value="2026-27">2026-27</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 text-sm"
                  >
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PERSONAL DETAILS */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <User className="text-[#1E40FF]" size={24} /> Step 2 — Personal Details
                </h2>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-28 h-28 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex flex-col items-center justify-center overflow-hidden shrink-0 relative">
                  {formData.photo_url ? (
                    <img src={formData.photo_url} alt="Applicant" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2 text-slate-400">
                      <User size={32} className="mx-auto mb-1 opacity-50" />
                      <span className="text-[10px] font-bold block">Photo Preview</span>
                    </div>
                  )}
                  {uploadingPhoto && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold">Uploading...</div>}
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800 block">Passport-size Photograph *</label>
                  <p className="text-xs text-slate-500">Max 2MB. JPG, PNG, or WebP</p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E40FF] hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase cursor-pointer">
                      <Upload size={14} /> Upload Photo
                      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                    {formData.photo_url && (
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, photo_url: '' }))} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold uppercase border-none bg-transparent cursor-pointer">Remove Photo</button>
                    )}
                  </div>
                  {photoUploadError && <p className="text-xs text-red-500 font-semibold">{photoUploadError}</p>}
                  {errors.photo_url && <p className="text-xs text-red-500 font-semibold">{errors.photo_url}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Full Name (as per 10th certificate) *</label>
                  <input type="text" placeholder="Full Name" value={formData.full_name} onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold" />
                  {errors.full_name && <p className="text-xs text-red-500 font-semibold">{errors.full_name}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Father's Name *</label>
                  <input type="text" placeholder="Father's Name" value={formData.father_name} onChange={(e) => setFormData(prev => ({ ...prev, father_name: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold" />
                  {errors.father_name && <p className="text-xs text-red-500 font-semibold">{errors.father_name}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Mother's Name *</label>
                  <input type="text" placeholder="Mother's Name" value={formData.mother_name} onChange={(e) => setFormData(prev => ({ ...prev, mother_name: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold" />
                  {errors.mother_name && <p className="text-xs text-red-500 font-semibold">{errors.mother_name}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Date of Birth *</label>
                  <input type="date" value={formData.dob} onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold" />
                  {errors.dob && <p className="text-xs text-red-500 font-semibold">{errors.dob}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Gender *</label>
                  <select value={formData.gender} onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Nationality *</label>
                  <input type="text" value={formData.nationality} onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Blood Group *</label>
                  <select
                    value={formData.blood_group}
                    onChange={(e) => setFormData(prev => ({ ...prev, blood_group: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border font-semibold text-sm ${
                      errors.blood_group ? 'border-red-400 bg-red-50/20' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <option value="">-- Select Blood Group --</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                  {errors.blood_group && <p className="text-xs text-red-500 font-semibold">{errors.blood_group}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                    <span>Aadhaar Number (Optional)</span>
                    {formData.aadhaar_number.length === 12 && (
                      <button type="button" onClick={() => setShowFullAadhaar(!showFullAadhaar)} className="text-[10px] text-[#1E40FF] font-bold border-none bg-transparent cursor-pointer">
                        {showFullAadhaar ? 'Mask' : 'Unmask'}
                      </button>
                    )}
                  </label>
                  <input
                    type="text"
                    maxLength={12}
                    placeholder="12-digit Aadhaar"
                    value={
                      !showFullAadhaar && formData.aadhaar_number.length === 12
                        ? `•••• •••• ${formData.aadhaar_number.slice(8)}`
                        : formData.aadhaar_number
                    }
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                      setFormData(prev => ({ ...prev, aadhaar_number: val }));
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold"
                  />
                  {errors.aadhaar_number && <p className="text-xs text-red-500 font-semibold">{errors.aadhaar_number}</p>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CONTACT & ADDRESS */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <MapPin className="text-[#1E40FF]" size={24} /> Step 3 — Contact & Address
                </h2>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-extrabold uppercase text-slate-800 border-b border-slate-200 pb-2">Permanent Address</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Address Line 1 *</label>
                    <input type="text" placeholder="Address Line 1" value={formData.permanent_address.address_line_1} onChange={(e) => setFormData(prev => ({ ...prev, permanent_address: { ...prev.permanent_address, address_line_1: e.target.value } }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold" />
                    {errors.perm_line1 && <p className="text-xs text-red-500 font-semibold">{errors.perm_line1}</p>}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Address Line 2</label>
                    <input type="text" placeholder="Address Line 2" value={formData.permanent_address.address_line_2} onChange={(e) => setFormData(prev => ({ ...prev, permanent_address: { ...prev.permanent_address, address_line_2: e.target.value } }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">City/Town *</label>
                    <input type="text" placeholder="City" value={formData.permanent_address.city} onChange={(e) => setFormData(prev => ({ ...prev, permanent_address: { ...prev.permanent_address, city: e.target.value } }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold" />
                    {errors.perm_city && <p className="text-xs text-red-500 font-semibold">{errors.perm_city}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">District *</label>
                    <input type="text" placeholder="District" value={formData.permanent_address.district} onChange={(e) => setFormData(prev => ({ ...prev, permanent_address: { ...prev.permanent_address, district: e.target.value } }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold" />
                    {errors.perm_district && <p className="text-xs text-red-500 font-semibold">{errors.perm_district}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">State *</label>
                    <select value={formData.permanent_address.state} onChange={(e) => setFormData(prev => ({ ...prev, permanent_address: { ...prev.permanent_address, state: e.target.value } }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold">
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">PIN Code *</label>
                    <input type="text" maxLength={6} placeholder="6-digit PIN" value={formData.permanent_address.pincode} onChange={(e) => setFormData(prev => ({ ...prev, permanent_address: { ...prev.permanent_address, pincode: e.target.value.replace(/\D/g, '') } }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold" />
                    {errors.perm_pincode && <p className="text-xs text-red-500 font-semibold">{errors.perm_pincode}</p>}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="flex items-center gap-3 p-4 rounded-2xl bg-[#EEF2FF]/70 border border-blue-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.same_as_permanent}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      same_as_permanent: e.target.checked,
                      correspondence_address: e.target.checked ? { ...prev.permanent_address } : { ...prev.correspondence_address }
                    }))}
                    className="w-5 h-5 rounded text-[#1E40FF]"
                  />
                  <span className="text-sm font-bold text-slate-800">Correspondence address same as permanent address</span>
                </label>

                {!formData.same_as_permanent && (
                  <div className="space-y-4 pt-6">
                    <h3 className="text-sm font-extrabold uppercase text-slate-800 border-b border-slate-200 pb-2">Correspondence Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Address Line 1 *</label>
                        <input type="text" placeholder="Address Line 1" value={formData.correspondence_address.address_line_1} onChange={(e) => setFormData(prev => ({ ...prev, correspondence_address: { ...prev.correspondence_address, address_line_1: e.target.value } }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold" />
                        {errors.corr_line1 && <p className="text-xs text-red-500 font-semibold">{errors.corr_line1}</p>}
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Address Line 2</label>
                        <input type="text" placeholder="Address Line 2" value={formData.correspondence_address.address_line_2} onChange={(e) => setFormData(prev => ({ ...prev, correspondence_address: { ...prev.correspondence_address, address_line_2: e.target.value } }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">City/Town *</label>
                        <input type="text" placeholder="City" value={formData.correspondence_address.city} onChange={(e) => setFormData(prev => ({ ...prev, correspondence_address: { ...prev.correspondence_address, city: e.target.value } }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold" />
                        {errors.corr_city && <p className="text-xs text-red-500 font-semibold">{errors.corr_city}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">District *</label>
                        <input type="text" placeholder="District" value={formData.correspondence_address.district} onChange={(e) => setFormData(prev => ({ ...prev, correspondence_address: { ...prev.correspondence_address, district: e.target.value } }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold" />
                        {errors.corr_district && <p className="text-xs text-red-500 font-semibold">{errors.corr_district}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">State *</label>
                        <select value={formData.correspondence_address.state} onChange={(e) => setFormData(prev => ({ ...prev, correspondence_address: { ...prev.correspondence_address, state: e.target.value } }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold">
                          {INDIAN_STATES.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">PIN Code *</label>
                        <input type="text" maxLength={6} placeholder="6-digit PIN" value={formData.correspondence_address.pincode} onChange={(e) => setFormData(prev => ({ ...prev, correspondence_address: { ...prev.correspondence_address, pincode: e.target.value.replace(/\D/g, '') } }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold" />
                        {errors.corr_pincode && <p className="text-xs text-red-500 font-semibold">{errors.corr_pincode}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-extrabold uppercase text-slate-800 border-b border-slate-200 pb-2">Contact Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Primary Mobile *</label>
                    <input type="tel" maxLength={10} placeholder="10-digit mobile" value={formData.primary_mobile} onChange={(e) => setFormData(prev => ({ ...prev, primary_mobile: e.target.value.replace(/\D/g, '') }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold" />
                    {errors.primary_mobile && <p className="text-xs text-red-500 font-semibold">{errors.primary_mobile}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Alternate Mobile</label>
                    <input type="tel" maxLength={10} placeholder="Alternate mobile" value={formData.alternate_mobile} onChange={(e) => setFormData(prev => ({ ...prev, alternate_mobile: e.target.value.replace(/\D/g, '') }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Email Address *</label>
                    <input type="email" placeholder="name@example.com" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold" />
                    {errors.email && <p className="text-xs text-red-500 font-semibold">{errors.email}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: ACADEMIC QUALIFICATIONS */}
          {currentStep === 4 && (
            <div className="space-y-8">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <BookOpen className="text-[#1E40FF]" size={24} /> Step 4 — Academic Qualifications
                </h2>
                <button
                  type="button"
                  onClick={handleAddQualification}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EEF2FF] text-[#1E40FF] text-xs font-bold uppercase cursor-pointer border-none"
                >
                  <Plus size={16} /> Add Qualification
                </button>
              </div>

              <div className="space-y-6">
                {formData.qualifications.map((qual, idx) => {
                  const isClass12Req = qual.level === 'Class 12' && ['UG Degree', 'PG Degree', 'Nursing'].includes(formData.program_type);
                  const isRequired = qual.required || isClass12Req || qual.level === 'Class 10';

                  return (
                    <div key={qual.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-800 text-sm">{qual.level}</span>
                          {isRequired && <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-extrabold text-[10px]">Required</span>}
                        </div>
                        {qual.level !== 'Class 10' && qual.level !== 'Class 12' && (
                          <button type="button" onClick={() => handleRemoveQualification(qual.id)} className="p-2 text-red-500 border-none bg-transparent cursor-pointer"><Trash2 size={16} /></button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-slate-700">Examination/Board *</label>
                          <input type="text" placeholder="Board / University" value={qual.board} onChange={(e) => handleQualificationChange(qual.id, 'board', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold" />
                          {errors[`qual_${qual.id}_board`] && <p className="text-xs text-red-500 font-semibold">{errors[`qual_${qual.id}_board`]}</p>}
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-slate-700">School/Institution *</label>
                          <input type="text" placeholder="School / College" value={qual.institution} onChange={(e) => handleQualificationChange(qual.id, 'institution', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold" />
                          {errors[`qual_${qual.id}_institution`] && <p className="text-xs text-red-500 font-semibold">{errors[`qual_${qual.id}_institution`]}</p>}
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-slate-700">Year of Passing *</label>
                          <input type="text" maxLength={4} placeholder="YYYY" value={qual.year} onChange={(e) => handleQualificationChange(qual.id, 'year', e.target.value.replace(/\D/g, ''))} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold" />
                          {errors[`qual_${qual.id}_year`] && <p className="text-xs text-red-500 font-semibold">{errors[`qual_${qual.id}_year`]}</p>}
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-slate-700">Stream/Subjects</label>
                          <input type="text" placeholder="e.g. Science, PCMB" value={qual.stream} onChange={(e) => handleQualificationChange(qual.id, 'stream', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold" />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-slate-700">Percentage/CGPA *</label>
                          <input type="number" step="0.01" placeholder="e.g. 85.5" value={qual.percentage} onChange={(e) => handleQualificationChange(qual.id, 'percentage', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold" />
                          {errors[`qual_${qual.id}_percentage`] && <p className="text-xs text-red-500 font-semibold">{errors[`qual_${qual.id}_percentage`]}</p>}
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-slate-700">Division/Class</label>
                          <select value={qual.division} onChange={(e) => handleQualificationChange(qual.id, 'division', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold">
                            <option value="First">First</option>
                            <option value="Second">Second</option>
                            <option value="Third">Third</option>
                            <option value="Pass">Pass</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: ADDITIONAL INFORMATION */}
          {currentStep === 5 && (
            <div className="space-y-8">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Shield className="text-[#1E40FF]" size={24} /> Step 5 — Additional Information
                </h2>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-extrabold uppercase text-slate-800 border-b border-slate-200 pb-2">Guardian / Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-700">Guardian Name *</label>
                    <input type="text" placeholder="Guardian Name" value={formData.guardian_name} onChange={(e) => setFormData(prev => ({ ...prev, guardian_name: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold" />
                    {errors.guardian_name && <p className="text-xs text-red-500 font-semibold">{errors.guardian_name}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-700">Relationship *</label>
                    <select value={formData.guardian_relationship} onChange={(e) => setFormData(prev => ({ ...prev, guardian_relationship: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold">
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Relative">Relative</option>
                      <option value="Guardian">Guardian</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-700">Guardian Mobile *</label>
                    <input type="tel" maxLength={10} placeholder="Guardian Mobile" value={formData.guardian_mobile} onChange={(e) => setFormData(prev => ({ ...prev, guardian_mobile: e.target.value.replace(/\D/g, '') }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold" />
                    {errors.guardian_mobile && <p className="text-xs text-red-500 font-semibold">{errors.guardian_mobile}</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-extrabold uppercase text-slate-800 border-b border-slate-200 pb-2">Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-800 block">Hostel Required?</label>
                    <div className="flex items-center gap-6">
                      {['Yes', 'No'].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                          <input type="radio" name="hostel_required" value={opt} checked={formData.hostel_required === opt} onChange={(e) => setFormData(prev => ({ ...prev, hostel_required: e.target.value }))} className="w-4 h-4 text-[#1E40FF]" />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                    {formData.hostel_required === 'Yes' && (
                      <div className="pt-2">
                        <label className="text-xs font-bold uppercase text-slate-700 block mb-1">Preferred Location</label>
                        <input type="text" placeholder="Location" value={formData.hostel_location} onChange={(e) => setFormData(prev => ({ ...prev, hostel_location: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold" />
                        {errors.hostel_location && <p className="text-xs text-red-500 font-semibold">{errors.hostel_location}</p>}
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-800 block">Scholarship / Financial Aid Required?</label>
                    <div className="flex items-center gap-6">
                      {['Yes', 'No'].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                          <input type="radio" name="scholarship_required" value={opt} checked={formData.scholarship_required === opt} onChange={(e) => setFormData(prev => ({ ...prev, scholarship_required: e.target.value }))} className="w-4 h-4 text-[#1E40FF]" />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {!hasUrlSource ? (
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold uppercase text-slate-700">How did you hear about Buddha College of Nursing?</label>
                      <select value={formData.hear_about_us} onChange={(e) => setFormData(prev => ({ ...prev, hear_about_us: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold">
                        <option value="Google Search">Google Search</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Friend/Family">Friend/Family</option>
                        <option value="College Fair">College Fair</option>
                        <option value="Television">Television</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  ) : (
                    <div className="md:col-span-2 bg-[#EEF2FF] p-3 rounded-xl border border-blue-200 text-xs font-semibold text-blue-900">
                      Tracked Source: <strong>{formData.source}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: DOCUMENTS */}
          {currentStep === 6 && (
            <div className="space-y-8">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <FileCheck className="text-[#1E40FF]" size={24} /> Step 6 — Documents Upload
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Upload clear copies of required and optional documents. Accepted formats: JPG, JPEG, PNG, PDF (Max 5MB per document).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getDocumentCardsList().map((doc) => {
                  const uploadedMeta = formData.documents ? formData.documents[doc.type] : null;
                  const isUploading = uploadingDocs[doc.type];
                  const uploadError = docUploadErrors[doc.type];
                  const isPdf = uploadedMeta?.document_name?.toLowerCase().endsWith('.pdf') || (uploadedMeta?.file_url && uploadedMeta.file_url.includes('.pdf'));

                  return (
                    <div
                      key={doc.type}
                      className={`p-6 rounded-2xl border transition-all ${
                        uploadedMeta
                          ? 'bg-emerald-50/60 border-emerald-200 shadow-sm'
                          : doc.required
                          ? 'bg-white border-slate-200 hover:border-blue-300'
                          : 'bg-slate-50/70 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                            {uploadedMeta ? <CheckCircle2 size={18} className="text-emerald-600 shrink-0" /> : <File size={18} className="text-slate-400 shrink-0" />}
                            {doc.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">{doc.desc}</p>
                        </div>
                        {doc.required ? (
                          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-extrabold text-[10px] uppercase shrink-0">Required</span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-600 font-extrabold text-[10px] uppercase shrink-0">Optional</span>
                        )}
                      </div>

                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">
                        JPG, PNG, PDF • Max 5MB
                      </div>

                      {/* Card Content & Action State */}
                      {isUploading ? (
                        <div className="p-4 bg-white rounded-xl border border-blue-200 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-[#1E40FF]">
                            <span className="flex items-center gap-1.5">
                              <Loader2 size={14} className="animate-spin text-[#1E40FF]" /> Uploading... {uploadProgress[doc.type] || 0}%
                            </span>
                            <span>{uploadProgress[doc.type] || 0}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#1E40FF] transition-all duration-200"
                              style={{ width: `${uploadProgress[doc.type] || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : uploadedMeta ? (
                        <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-3">
                          <div className="flex items-center gap-3">
                            {isPdf ? (
                              <div className="w-12 h-12 rounded-lg bg-red-50 text-red-600 border border-red-200 flex items-center justify-center font-extrabold text-xs shrink-0">
                                PDF
                              </div>
                            ) : (
                              <img
                                src={uploadedMeta.file_url}
                                alt="Preview"
                                className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                  ✓ Uploaded
                                </span>
                              </div>
                              <span className="font-bold text-slate-800 text-xs truncate block" title={uploadedMeta.document_name}>
                                {uploadedMeta.document_name}
                              </span>
                              {uploadedMeta.file_size && (
                                <span className="text-[10px] text-slate-400 font-semibold block">
                                  {(uploadedMeta.file_size / (1024 * 1024)).toFixed(2)} MB
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                            <label className="text-[#1E40FF] hover:underline font-bold cursor-pointer inline-flex items-center gap-1">
                              <RefreshCw size={12} /> Replace
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,application/pdf"
                                onChange={(e) => handleDocumentUpload(doc.type, e)}
                                className="hidden"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => handleRemoveDocument(doc.type)}
                              className="text-red-500 hover:bg-red-50 px-2 py-1 rounded font-bold border-none bg-transparent cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border bg-white hover:bg-slate-50 font-bold text-xs uppercase cursor-pointer shadow-sm transition-all ${uploadError ? 'border-red-300 text-red-700' : 'border-slate-300 text-slate-700'}`}>
                            <Upload size={14} className="text-[#1E40FF]" /> {uploadError ? 'Try Again' : `Upload ${doc.title}`}
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,application/pdf"
                              onChange={(e) => handleDocumentUpload(doc.type, e)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      )}

                      {uploadError && (
                        <div className="mt-2 p-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center justify-between gap-2">
                          <span>Upload failed — try again</span>
                          <label className="text-[11px] font-bold underline cursor-pointer text-red-700 shrink-0">
                            Retry
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,application/pdf"
                              onChange={(e) => handleDocumentUpload(doc.type, e)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      )}
                      {errors[`doc_${doc.type}`] && <p className="text-xs text-red-500 font-semibold mt-2">{errors[`doc_${doc.type}`]}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 7: REVIEW & DECLARATION */}
          {currentStep === 7 && (
            <div className="space-y-8">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="text-[#1E40FF]" size={24} /> Step 7 — Review & Declaration
                </h2>
              </div>

              <div className="space-y-4">
                {/* Section 1 */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  <div className="bg-slate-50 p-4 flex items-center justify-between border-b border-slate-200">
                    <h3 className="text-sm font-extrabold text-slate-800">1. Course Details</h3>
                    <button type="button" onClick={() => setCurrentStep(1)} className="text-xs font-bold text-[#1E40FF] hover:underline border-none bg-transparent cursor-pointer flex items-center gap-1"><Edit3 size={14} /> Edit</button>
                  </div>
                  <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div><span className="text-slate-400 font-medium block">Program</span><span className="font-bold text-slate-800">{formData.program_type}</span></div>
                    <div><span className="text-slate-400 font-medium block">Course</span><span className="font-bold text-slate-800">{formData.course}</span></div>
                    {formData.specialization && <div><span className="text-slate-400 font-medium block">Specialization</span><span className="font-bold text-slate-800">{formData.specialization}</span></div>}
                    <div><span className="text-slate-400 font-medium block">Preferred Mode</span><span className="font-bold text-slate-800">{formData.preferred_college_type}</span></div>
                    <div><span className="text-slate-400 font-medium block">Academic Session</span><span className="font-bold text-slate-800">{formData.academic_session}</span></div>
                    <div><span className="text-slate-400 font-medium block">Category</span><span className="font-bold text-slate-800">{formData.category}</span></div>
                  </div>
                </div>

                {/* Section 2 */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  <div className="bg-slate-50 p-4 flex items-center justify-between border-b border-slate-200">
                    <h3 className="text-sm font-extrabold text-slate-800">2. Personal Details</h3>
                    <button type="button" onClick={() => setCurrentStep(2)} className="text-xs font-bold text-[#1E40FF] hover:underline border-none bg-transparent cursor-pointer flex items-center gap-1"><Edit3 size={14} /> Edit</button>
                  </div>
                  <div className="p-4 flex flex-col md:flex-row gap-4 items-start text-xs">
                    {formData.photo_url && <img src={formData.photo_url} alt="Applicant" className="w-16 h-16 rounded-xl object-cover border shrink-0" />}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 flex-1">
                      <div><span className="text-slate-400 font-medium block">Name</span><span className="font-bold text-slate-800">{formData.full_name}</span></div>
                      <div><span className="text-slate-400 font-medium block">Father's Name</span><span className="font-bold text-slate-800">{formData.father_name}</span></div>
                      <div><span className="text-slate-400 font-medium block">Mother's Name</span><span className="font-bold text-slate-800">{formData.mother_name}</span></div>
                      <div><span className="text-slate-400 font-medium block">DOB</span><span className="font-bold text-slate-800">{formData.dob}</span></div>
                      <div><span className="text-slate-400 font-medium block">Gender</span><span className="font-bold text-slate-800">{formData.gender}</span></div>
                      <div><span className="text-slate-400 font-medium block">Nationality</span><span className="font-bold text-slate-800">{formData.nationality}</span></div>
                    </div>
                  </div>
                </div>

                {/* Section 3 */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  <div className="bg-slate-50 p-4 flex items-center justify-between border-b border-slate-200">
                    <h3 className="text-sm font-extrabold text-slate-800">3. Contact & Address</h3>
                    <button type="button" onClick={() => setCurrentStep(3)} className="text-xs font-bold text-[#1E40FF] hover:underline border-none bg-transparent cursor-pointer flex items-center gap-1"><Edit3 size={14} /> Edit</button>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div><span className="text-slate-400 font-medium block">Mobile</span><span className="font-bold text-slate-800">+91 {formData.primary_mobile}</span></div>
                    <div><span className="text-slate-400 font-medium block">Email</span><span className="font-bold text-slate-800">{formData.email}</span></div>
                    <div className="md:col-span-2"><span className="text-slate-400 font-medium block">Permanent Address</span><span className="font-bold text-slate-800">{formData.permanent_address.address_line_1}, {formData.permanent_address.city}, {formData.permanent_address.district}, {formData.permanent_address.state} - {formData.permanent_address.pincode}</span></div>
                  </div>
                </div>

                {/* Section 4 */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  <div className="bg-slate-50 p-4 flex items-center justify-between border-b border-slate-200">
                    <h3 className="text-sm font-extrabold text-slate-800">4. Academic Qualifications</h3>
                    <button type="button" onClick={() => setCurrentStep(4)} className="text-xs font-bold text-[#1E40FF] hover:underline border-none bg-transparent cursor-pointer flex items-center gap-1"><Edit3 size={14} /> Edit</button>
                  </div>
                  <div className="p-4 space-y-2 text-xs">
                    {formData.qualifications.map(q => (
                      <div key={q.id} className="bg-slate-50 p-2.5 rounded-xl flex justify-between font-semibold">
                        <span>{q.level}: {q.institution} ({q.board})</span>
                        <span>{q.year} | {q.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 5 */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  <div className="bg-slate-50 p-4 flex items-center justify-between border-b border-slate-200">
                    <h3 className="text-sm font-extrabold text-slate-800">5. Preferences & Emergency Contact</h3>
                    <button type="button" onClick={() => setCurrentStep(5)} className="text-xs font-bold text-[#1E40FF] hover:underline border-none bg-transparent cursor-pointer flex items-center gap-1"><Edit3 size={14} /> Edit</button>
                  </div>
                  <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div><span className="text-slate-400 font-medium block">Guardian</span><span className="font-bold text-slate-800">{formData.guardian_name} ({formData.guardian_relationship})</span></div>
                    <div><span className="text-slate-400 font-medium block">Guardian Mobile</span><span className="font-bold text-slate-800">+91 {formData.guardian_mobile}</span></div>
                    <div><span className="text-slate-400 font-medium block">Hostel Required</span><span className="font-bold text-slate-800">{formData.hostel_required}</span></div>
                  </div>
                </div>

                {/* Section 6: Documents Summary */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  <div className="bg-slate-50 p-4 flex items-center justify-between border-b border-slate-200">
                    <h3 className="text-sm font-extrabold text-slate-800">6. Uploaded Documents</h3>
                    <button type="button" onClick={() => setCurrentStep(6)} className="text-xs font-bold text-[#1E40FF] hover:underline border-none bg-transparent cursor-pointer flex items-center gap-1"><Edit3 size={14} /> Edit</button>
                  </div>
                  <div className="p-4 space-y-2 text-xs">
                    {Object.keys(formData.documents || {}).length === 0 ? (
                      <span className="text-slate-400 italic">No documents uploaded</span>
                    ) : (
                      Object.entries(formData.documents).map(([dType, dMeta]) => (
                        <div key={dType} className="bg-slate-50 p-2.5 rounded-xl flex items-center justify-between font-semibold">
                          <span className="uppercase text-[10px] font-extrabold text-[#1E40FF] bg-blue-100 px-2 py-0.5 rounded">{dType.replace(/_/g, ' ')}</span>
                          <span className="truncate max-w-xs">{dMeta.document_name}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Declaration */}
              <div className="bg-[#EEF2FF] border border-blue-200 p-5 rounded-2xl space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.declaration_accepted}
                    onChange={(e) => setFormData(prev => ({ ...prev, declaration_accepted: e.target.checked }))}
                    className="w-5 h-5 rounded text-[#1E40FF] mt-0.5"
                  />
                  <span className="text-xs font-semibold text-slate-800 leading-relaxed">
                    I hereby declare that the information provided by me is true, correct and complete to the best of my knowledge. I understand that providing false information may result in cancellation of my application. I authorize Buddha College of Nursing to contact me via phone, SMS and email regarding my admission.
                  </span>
                </label>
                {errors.declaration_accepted && <p className="text-xs text-red-600 font-extrabold pl-8">{errors.declaration_accepted}</p>}
              </div>
            </div>
          )}

          {/* Controls Footer */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase cursor-pointer"
              >
                <ChevronLeft size={16} /> Back
              </button>
            ) : <div></div>}

            {currentStep < 7 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#1E40FF] hover:bg-blue-700 text-white font-bold text-xs uppercase cursor-pointer border-none shadow-lg shadow-blue-500/20"
              >
                Save & Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting || !formData.declaration_accepted}
                className={`inline-flex items-center gap-2 px-10 py-4 rounded-xl font-extrabold text-xs uppercase border-none ${
                  submitting || !formData.declaration_accepted
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/20 cursor-pointer'
                }`}
              >
                {submitting ? (submittingProgress || 'Submitting Application...') : 'Submit Application'}
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
}
