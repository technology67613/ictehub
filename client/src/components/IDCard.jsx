import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Download, FileText, Printer, CheckCircle2, AlertCircle,
  Sparkles, Shield, User, Droplet, ArrowRight, Loader2
} from 'lucide-react';

/**
 * Format DOB string into DD/MM/YYYY format for display
 */
function formatDisplayDob(dobStr) {
  if (!dobStr) return 'N/A';
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

export default function IDCard({ application, documents = [], onNavigateToDocuments }) {
  const cardRef = useRef(null);
  const [downloadingImg, setDownloadingImg] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const formData = application?.admission_form_data || {};
  
  // Resolve Passport Photo
  const passportDoc = documents.find(d => d.document_type === 'passport_photo');
  const photoUrl = passportDoc?.file_url || formData.photo_url || formData.documents?.passport_photo?.file_url || '';
  
  // Resolve Blood Group
  const bloodGroup = formData.blood_group ? formData.blood_group.trim() : '';

  // Readiness conditions
  const hasPhoto = Boolean(photoUrl);
  const hasBloodGroup = Boolean(bloodGroup);
  const isCardReady = hasPhoto && hasBloodGroup;

  // ID Data calculations
  const rawId = application?.id || '00000000';
  const shortId = rawId.substring(0, 8).toUpperCase();
  const idNumber = `BCN-${shortId}`;
  const studentName = formData.full_name || application?.name || 'Student Name';
  const fatherName = formData.father_name || formData.guardian_name || 'N/A';
  const course = formData.course || application?.course || 'GNM / ANM';
  const session = formData.academic_session || '2025-26';
  const dobFormatted = formatDisplayDob(formData.dob);

  // 1. Download as Image (PNG)
  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setDownloadingImg(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // High-resolution output (3x scale)
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `BCN-${shortId}-IDCard.png`;
      link.href = image;
      link.click();
    } catch (err) {
      console.error('Error generating ID card image:', err);
      alert('Could not download ID Card image. Please try again.');
    } finally {
      setDownloadingImg(false);
    }
  };

  // 2. Download as PDF
  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    setDownloadingPdf(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Standard credit card dimension in mm: 85.6mm x 54mm
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [85.6, 54],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 54);
      pdf.save(`BCN-${shortId}-IDCard.pdf`);
    } catch (err) {
      console.error('Error generating ID card PDF:', err);
      alert('Could not download ID Card PDF. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  // 3. Print ID Card
  const handlePrint = () => {
    window.print();
  };

  return (
    <section id="student-id-card-section" className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 text-[#1E40FF] text-[10px] font-black uppercase tracking-wider mb-1.5 border border-blue-100">
            <Sparkles size={12} /> Official Student Credential
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Student Identity Card
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Your verified institutional photo identity card issued by Buddha College of Nursing.
          </p>
        </div>

        {isCardReady && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold">
              <CheckCircle2 size={14} className="text-emerald-600" /> Active & Verified
            </span>
          </div>
        )}
      </div>

      {/* "Card Not Ready" State */}
      {!isCardReady ? (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/90 rounded-3xl p-6 sm:p-8 text-amber-900 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-300 flex items-center justify-center shrink-0 text-amber-700">
              <AlertCircle size={24} />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-base font-black text-amber-950">
                Your ID Card is Not Ready Yet
              </h3>
              <p className="text-xs text-amber-800 font-medium leading-relaxed">
                Your ID card will be generated once the following requirements are fulfilled:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
              hasPhoto
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                : 'bg-white/80 border-amber-200 text-amber-900'
            }`}>
              {hasPhoto ? (
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                  ✓
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0">
                  1
                </div>
              )}
              <div>
                <span className="text-xs font-bold block">Passport Photo</span>
                <span className="text-[11px] opacity-80">{hasPhoto ? 'Uploaded & Verified' : 'Passport photo is required'}</span>
              </div>
            </div>

            <div className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
              hasBloodGroup
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                : 'bg-white/80 border-amber-200 text-amber-900'
            }`}>
              {hasBloodGroup ? (
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                  ✓
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0">
                  2
                </div>
              )}
              <div>
                <span className="text-xs font-bold block">Blood Group</span>
                <span className="text-[11px] opacity-80">{hasBloodGroup ? `Provided (${bloodGroup})` : 'Blood group is missing'}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-amber-200/80">
            <p className="text-xs text-amber-800 font-semibold">
              Please complete your profile or upload your passport photograph to generate your official ID card.
            </p>
            {onNavigateToDocuments && (
              <button
                type="button"
                onClick={onNavigateToDocuments}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1E40FF] hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer border-none flex items-center justify-center gap-2 shrink-0"
              >
                Go to Documents <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ID Card Display & Download Options */
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 pt-2">
          
          {/* Visual ID Card Component (Exact Institutional Ratio: 342px x 216px) */}
          <div className="flex flex-col items-center shrink-0">
            <div
              ref={cardRef}
              id="student-id-card"
              className="print-id-card relative bg-white text-[#1A1A1A] select-none font-sans overflow-hidden shadow-2xl transition-all"
              style={{
                width: '342px',
                height: '216px',
                minWidth: '342px',
                minHeight: '216px',
                maxWidth: '342px',
                maxHeight: '216px',
                borderRadius: '12px',
                border: '2px solid #1E40FF',
                boxSizing: 'border-box',
                fontFamily: "'Inter', sans-serif",
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                backgroundColor: '#ffffff',
              }}
            >
              {/* Top Header Band */}
              <div
                style={{
                  backgroundColor: '#EEF2FF',
                  borderBottom: '1.5px solid #1E40FF',
                  padding: '5px 8px 4px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxSizing: 'border-box',
                }}
              >
                {/* College Logo */}
                <img
                  src="/logo.png"
                  alt="Buddha College of Nursing"
                  crossOrigin="anonymous"
                  style={{
                    height: '42px',
                    width: '42px',
                    objectFit: 'contain',
                    flexShrink: 0,
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #1E40FF',
                  }}
                />

                {/* College Header Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h1
                    style={{
                      fontSize: '11px',
                      fontWeight: '900',
                      color: '#1B2A4A',
                      margin: 0,
                      lineHeight: '1.1',
                      letterSpacing: '-0.2px',
                      textTransform: 'uppercase',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    BUDDHA COLLEGE OF NURSING
                  </h1>
                  <p
                    style={{
                      fontSize: '7px',
                      fontWeight: '600',
                      color: '#475569',
                      margin: '1.5px 0 0 0',
                      lineHeight: '1.1',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    (Behind Brahmanand Specialty Hospital, Tamulia)
                  </p>
                  <p
                    style={{
                      fontSize: '6.5px',
                      fontWeight: '700',
                      color: '#1E40FF',
                      margin: '1px 0 0 0',
                      lineHeight: '1.1',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Affiliated to JNRC Ranchi, Govt. of Jharkhand
                  </p>
                </div>
              </div>

              {/* Middle Body: Photo (Left) + Details (Right) */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 10px',
                  gap: '10px',
                  boxSizing: 'border-box',
                }}
              >
                {/* Student Photo */}
                <div
                  style={{
                    width: '70px',
                    height: '85px',
                    minWidth: '70px',
                    maxWidth: '70px',
                    borderRadius: '5px',
                    border: '1px solid #CBD5E1',
                    overflow: 'hidden',
                    backgroundColor: '#F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  }}
                >
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={studentName}
                      crossOrigin="anonymous"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '4px' }}>
                      <User size={24} color="#94A3B8" style={{ margin: '0 auto' }} />
                      <span style={{ fontSize: '7px', color: '#94A3B8', fontWeight: 'bold', display: 'block' }}>Photo</span>
                    </div>
                  )}
                </div>

                {/* Student Details Grid */}
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '2px',
                  }}
                >
                  {/* Row: Name */}
                  <div style={{ display: 'flex', alignItems: 'baseline', lineHeight: '1.15' }}>
                    <span style={{ width: '68px', fontSize: '8.5px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', flexShrink: 0 }}>
                      Name:
                    </span>
                    <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {studentName}
                    </span>
                  </div>

                  {/* Row: S/D/W of */}
                  <div style={{ display: 'flex', alignItems: 'baseline', lineHeight: '1.15' }}>
                    <span style={{ width: '68px', fontSize: '8.5px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', flexShrink: 0 }}>
                      S/D/W of:
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {fatherName}
                    </span>
                  </div>

                  {/* Row: Course */}
                  <div style={{ display: 'flex', alignItems: 'baseline', lineHeight: '1.15' }}>
                    <span style={{ width: '68px', fontSize: '8.5px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', flexShrink: 0 }}>
                      Course:
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#1E40FF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {course}
                    </span>
                  </div>

                  {/* Row: Session */}
                  <div style={{ display: 'flex', alignItems: 'baseline', lineHeight: '1.15' }}>
                    <span style={{ width: '68px', fontSize: '8.5px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', flexShrink: 0 }}>
                      Session:
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: '#1E293B' }}>
                      {session}
                    </span>
                  </div>

                  {/* Row: DOB */}
                  <div style={{ display: 'flex', alignItems: 'baseline', lineHeight: '1.15' }}>
                    <span style={{ width: '68px', fontSize: '8.5px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', flexShrink: 0 }}>
                      DOB:
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: '#1E293B' }}>
                      {dobFormatted}
                    </span>
                  </div>

                  {/* Row: Blood Group */}
                  <div style={{ display: 'flex', alignItems: 'baseline', lineHeight: '1.15' }}>
                    <span style={{ width: '68px', fontSize: '8.5px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', flexShrink: 0 }}>
                      Blood Group:
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: '900', color: '#DC2626' }}>
                      {bloodGroup || 'N/A'}
                    </span>
                  </div>

                  {/* Row: ID No */}
                  <div style={{ display: 'flex', alignItems: 'baseline', lineHeight: '1.15' }}>
                    <span style={{ width: '68px', fontSize: '8.5px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', flexShrink: 0 }}>
                      ID No:
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: '900', color: '#0F172A', letterSpacing: '0.3px', fontFamily: 'monospace' }}>
                      {idNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Band */}
              <div
                style={{
                  borderTop: '1.5px solid #1E40FF',
                  padding: '4px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#FFFFFF',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ fontSize: '8px', fontWeight: '800', color: '#1E40FF', textTransform: 'uppercase' }}>
                  Valid: <span style={{ color: '#0F172A' }}>{session}</span>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <div
                    style={{
                      fontFamily: 'cursive, serif',
                      fontSize: '9px',
                      fontWeight: 'bold',
                      color: '#0F172A',
                      lineHeight: '1',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Principal
                  </div>
                  <div
                    style={{
                      fontSize: '6.5px',
                      fontWeight: '700',
                      color: '#64748B',
                      borderTop: '0.5px solid #94A3B8',
                      paddingTop: '1px',
                      marginTop: '1px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Authorized Signatory
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 font-semibold mt-3 flex items-center gap-1.5">
              <Shield size={12} className="text-[#1E40FF]" /> Standard ISO/IEC 7810 ID-1 (85.6mm × 54mm)
            </p>
          </div>

          {/* Download & Print Action Controls */}
          <div className="flex-1 max-w-sm space-y-4 w-full">
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Download size={14} className="text-[#1E40FF]" /> Download & Print Actions
              </h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Export your high-resolution institutional photo ID card directly to your device or print a physical copy.
              </p>

              <div className="space-y-2.5 pt-2">
                {/* 1. Download as Image (PNG) */}
                <button
                  type="button"
                  onClick={handleDownloadImage}
                  disabled={downloadingImg || downloadingPdf}
                  className="w-full py-3 px-4 rounded-xl bg-[#1E40FF] hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer border-none disabled:opacity-60"
                >
                  {downloadingImg ? (
                    <><Loader2 size={16} className="animate-spin" /> Generating PNG...</>
                  ) : (
                    <><Download size={16} /> Download as Image (PNG)</>
                  )}
                </button>

                {/* 2. Download as PDF */}
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={downloadingImg || downloadingPdf}
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-[#1E40FF] border-2 border-[#1E40FF] font-extrabold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {downloadingPdf ? (
                    <><Loader2 size={16} className="animate-spin" /> Generating PDF...</>
                  ) : (
                    <><FileText size={16} /> Download as PDF</>
                  )}
                </button>

                {/* 3. Print ID Card */}
                <button
                  type="button"
                  onClick={handlePrint}
                  disabled={downloadingImg || downloadingPdf}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer border-none"
                >
                  <Printer size={16} /> Print ID Card
                </button>
              </div>
            </div>

            {/* Verification Metadata Box */}
            <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 text-[11px] text-blue-900 space-y-1.5 font-medium">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Student Ref ID:</span>
                <span className="font-mono text-[#1E40FF]">{idNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Blood Group:</span>
                <span className="font-bold text-slate-900">{bloodGroup}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Academic Session:</span>
                <span className="font-bold text-slate-900">{session}</span>
              </div>
            </div>

          </div>

        </div>
      )}

    </section>
  );
}
