import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, FileText, Printer, Loader2 } from 'lucide-react';

/**
 * Format DOB string into DD/MM/YYYY format for display
 */
function formatDisplayDob(dobStr) {
  if (!dobStr) return '';
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

export default function IDCard({ application, documents = [] }) {
  const cardRef = useRef(null);
  const [downloadingImg, setDownloadingImg] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Extract application / admission_form_data fields
  const formData = application?.admission_form_data || {};
  const leadId = application?.lead_id || application?.id || '00000000';
  const shortLeadId = String(leadId).substring(0, 8).toUpperCase();
  const formNo = `BCN-${shortLeadId}`;

  const course = formData.course || application?.course || 'GNM / ANM';
  const session = formData.academic_session || application?.academic_session || '';
  const batch = formData.batch || application?.batch || '';
  const rollNo = formData.roll_no || application?.roll_no || '';

  const fullName = formData.full_name || application?.full_name || application?.name || '';
  const fatherName = formData.father_name || application?.father_name || '';
  const motherName = formData.mother_name || application?.mother_name || '';
  const dobRaw = formData.dob || application?.dob || '';
  const dobFormatted = formatDisplayDob(dobRaw);
  const primaryMobile = formData.primary_mobile || application?.primary_mobile || formData.mobile || application?.mobile || '';

  const addrLine1 = formData.perm_address_line1 || formData.address_line1 || application?.perm_address_line1 || application?.address_line1 || '';
  const addrLine2 = formData.perm_address_line2 || formData.address_line2 || application?.perm_address_line2 || application?.address_line2 || '';
  const address = [addrLine1, addrLine2].filter(Boolean).join(', ');

  const city = formData.perm_city || application?.perm_city || formData.city || '';
  const state = formData.perm_state || application?.perm_state || formData.state || '';
  const pin = formData.perm_pin || application?.perm_pin || formData.pin || formData.pincode || '';

  // Passport Photo
  const passportDoc = documents.find(d => d.document_type === 'passport_photo');
  const photoUrl = passportDoc?.file_url || formData.photo_url || formData.documents?.passport_photo?.file_url || '';

  const examCentre = formData.exam_centre || application?.exam_centre || '';
  const dateOfExamination = formData.date_of_examination || application?.date_of_examination || '';

  // 1. Download as Image (PNG)
  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setDownloadingImg(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `${formNo}-IDCard.png`;
      link.href = image;
      link.click();
    } catch (err) {
      console.error('Error generating ID card image:', err);
      alert('Could not download ID Card image. Please try again.');
    } finally {
      setDownloadingImg(false);
    }
  };

  // 2. Download as PDF (A5 Landscape)
  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    setDownloadingPdf(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);

      // A5 Landscape format: 210mm x 148mm
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a5',
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 210, 148);
      pdf.save(`${formNo}-IDCard.pdf`);
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
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f8fafc' }}>
      {/* Embedded CSS for clean printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .print-id-card, .print-id-card * {
            visibility: visible !important;
          }
          .print-id-card {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Official ID Card Component */}
      <div
        ref={cardRef}
        className="print-id-card"
        style={{
          width: '800px',
          height: 'auto',
          backgroundColor: '#ffffff',
          color: '#000000',
          border: '2px solid #000000',
          padding: '20px',
          boxSizing: 'border-box',
          fontFamily: "'Times New Roman', Times, serif",
          fontSize: '14px',
          lineHeight: '1.4',
        }}
      >
        {/* Header Section */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          {/* Left: College circular logo */}
          <div
            style={{
              width: '90px',
              height: '90px',
              minWidth: '90px',
              borderRadius: '50%',
              border: '2px solid #000000',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px',
              flexShrink: 0,
              backgroundColor: '#ffffff',
            }}
          >
            <img
              src="/logo.png"
              alt="Buddha College Logo"
              crossOrigin="anonymous"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </div>

          {/* Center text block */}
          <div style={{ flex: 1, textAlign: 'center', color: '#000000' }}>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 'bold',
                margin: 0,
                lineHeight: '1.1',
                letterSpacing: '0.5px',
                fontFamily: "'Times New Roman', Times, serif",
                textTransform: 'uppercase',
                color: '#000000',
              }}
            >
              BUDDHA COLLEGE OF NURSING
            </h1>
            <p
              style={{
                fontSize: '13px',
                fontStyle: 'italic',
                fontWeight: 'bold',
                margin: '3px 0 0 0',
                fontFamily: "'Times New Roman', Times, serif",
              }}
            >
              (Behind Brahmanand Narayanan Specialty Hospital)
            </p>
            <p
              style={{
                fontSize: '13px',
                fontWeight: 'bold',
                margin: '2px 0 0 0',
                fontFamily: "'Times New Roman', Times, serif",
              }}
            >
              Dist.: Seraikela-Kharsawan, Jharkhand – 831020
            </p>
            <p
              style={{
                fontSize: '13px',
                fontWeight: 'bold',
                margin: '2px 0 0 0',
                fontFamily: "'Times New Roman', Times, serif",
              }}
            >
              Email: buddhacollegeofnursingsn@gmail.com
            </p>
            <p
              style={{
                fontSize: '12px',
                fontWeight: 'bold',
                margin: '3px 0 0 0',
                fontFamily: "'Times New Roman', Times, serif",
              }}
            >
              (Affiliated by Health Education & Family Welfare Department, JNRC Ranchi, Govt. of Jharkhand)
            </p>
          </div>
        </div>

        {/* Two thick horizontal black lines below header */}
        <div style={{ borderTop: '3px solid #000000', margin: '8px 0 2px 0' }} />
        <div style={{ borderTop: '1px solid #000000', margin: '0 0 10px 0' }} />

        {/* ID CARD Banner */}
        <div
          style={{
            backgroundColor: '#000000',
            color: '#ffffff',
            textAlign: 'center',
            padding: '6px 0',
            fontSize: '20px',
            fontWeight: 'bold',
            letterSpacing: '3px',
            marginBottom: '14px',
            fontFamily: "'Times New Roman', Times, serif",
            textTransform: 'uppercase',
          }}
        >
          ID CARD
        </div>

        {/* Main Body (bordered box with rounded corners) */}
        <div
          style={{
            border: '2px solid #000000',
            borderRadius: '8px',
            padding: '14px 16px',
            backgroundColor: '#ffffff',
            fontFamily: "'Times New Roman', Times, serif",
          }}
        >
          {/* Top row & photo box layout */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, marginRight: '16px' }}>
              {/* Top row (single line): Course, Session, Batch */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: '12px',
                  fontSize: '14px',
                }}
              >
                <div>
                  <span style={{ fontWeight: 'bold' }}>Course: </span>
                  <span style={{ fontWeight: 'bold' }}>{course}</span>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Session: </span>
                  <span
                    style={{
                      flex: 1,
                      borderBottom: '1px solid #000000',
                      marginLeft: '4px',
                      paddingLeft: '4px',
                      fontWeight: 'bold',
                      minWidth: '60px',
                      display: 'inline-block',
                    }}
                  >
                    {session}
                  </span>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Batch: </span>
                  <span
                    style={{
                      flex: 1,
                      borderBottom: '1px solid #000000',
                      marginLeft: '4px',
                      paddingLeft: '4px',
                      fontWeight: 'bold',
                      minWidth: '60px',
                      display: 'inline-block',
                    }}
                  >
                    {batch}
                  </span>
                </div>
              </div>

              {/* Dashed line separating Course/Session/Batch row from Form No. row */}
              <div style={{ borderTop: '2px dashed #000000', margin: '10px 0' }} />

              {/* Second row: Form No., Roll No. */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '20px', fontSize: '14px' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Form No.: </span>
                  <span
                    style={{
                      flex: 1,
                      borderBottom: '1px solid #000000',
                      marginLeft: '4px',
                      paddingLeft: '4px',
                      fontWeight: 'bold',
                    }}
                  >
                    {formNo}
                  </span>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Roll No.: </span>
                  <span
                    style={{
                      flex: 1,
                      borderBottom: '1px solid #000000',
                      marginLeft: '4px',
                      paddingLeft: '4px',
                      fontWeight: 'bold',
                    }}
                  >
                    {rollNo}
                  </span>
                </div>
              </div>
            </div>

            {/* Right side: passport photo box (100px x 120px) */}
            <div
              style={{
                width: '100px',
                height: '120px',
                minWidth: '100px',
                minHeight: '120px',
                border: '2px solid #000000',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '4px',
                boxSizing: 'border-box',
                flexShrink: 0,
              }}
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Candidate Photograph"
                  crossOrigin="anonymous"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              ) : (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#000000',
                    lineHeight: '1.2',
                  }}
                >
                  Paste your recent passport size photograph
                </span>
              )}
            </div>
          </div>

          {/* Stacked rows (each full-width with bold label + underline value) */}
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
            {/* Name of Candidate */}
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', marginRight: '6px' }}>Name of Candidate:</span>
              <span style={{ flex: 1, borderBottom: '1px solid #000000', paddingLeft: '6px', fontWeight: 'bold' }}>
                {fullName}
              </span>
            </div>

            {/* Father's Name */}
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', marginRight: '6px' }}>Father's Name:</span>
              <span style={{ flex: 1, borderBottom: '1px solid #000000', paddingLeft: '6px', fontWeight: 'bold' }}>
                {fatherName}
              </span>
            </div>

            {/* Mother's Name */}
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', marginRight: '6px' }}>Mother's Name:</span>
              <span style={{ flex: 1, borderBottom: '1px solid #000000', paddingLeft: '6px', fontWeight: 'bold' }}>
                {motherName}
              </span>
            </div>

            {/* Date of Birth */}
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', marginRight: '6px' }}>Date of Birth:</span>
              <span style={{ flex: 1, borderBottom: '1px solid #000000', paddingLeft: '6px', fontWeight: 'bold' }}>
                {dobFormatted}
              </span>
            </div>

            {/* Contact No. */}
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', marginRight: '6px' }}>Contact No.:</span>
              <span style={{ flex: 1, borderBottom: '1px solid #000000', paddingLeft: '6px', fontWeight: 'bold' }}>
                {primaryMobile}
              </span>
            </div>

            {/* Address */}
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', marginRight: '6px' }}>Address:</span>
              <span style={{ flex: 1, borderBottom: '1px solid #000000', paddingLeft: '6px', fontWeight: 'bold' }}>
                {address}
              </span>
            </div>

            {/* City, State, Pin */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', marginRight: '6px' }}>City:</span>
                <span style={{ flex: 1, borderBottom: '1px solid #000000', paddingLeft: '6px', fontWeight: 'bold' }}>
                  {city}
                </span>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', marginRight: '6px' }}>State:</span>
                <span style={{ flex: 1, borderBottom: '1px solid #000000', paddingLeft: '6px', fontWeight: 'bold' }}>
                  {state}
                </span>
              </div>
              <div style={{ width: '160px', display: 'flex', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', marginRight: '6px' }}>Pin:</span>
                <span style={{ flex: 1, borderBottom: '1px solid #000000', paddingLeft: '6px', fontWeight: 'bold' }}>
                  {pin}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bordered section */}
        <div
          style={{
            border: '2px solid #000000',
            borderRadius: '8px',
            padding: '12px 16px',
            marginTop: '12px',
            backgroundColor: '#ffffff',
            fontFamily: "'Times New Roman', Times, serif",
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', fontSize: '13px' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', marginRight: '6px' }}>Exam Centre:</span>
              <span style={{ flex: 1, borderBottom: '1px solid #000000', paddingLeft: '6px', fontWeight: 'bold' }}>
                {examCentre}
              </span>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', marginRight: '6px' }}>Date of Examination:</span>
              <span style={{ flex: 1, borderBottom: '1px solid #000000', paddingLeft: '6px', fontWeight: 'bold' }}>
                {dateOfExamination}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginTop: '28px', fontSize: '13px' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', marginRight: '6px' }}>Signature of Candidate:</span>
              <span style={{ flex: 1, borderBottom: '1px solid #000000' }}></span>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', marginRight: '6px' }}>Signature of Principal:</span>
              <span style={{ flex: 1, borderBottom: '1px solid #000000' }}></span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            backgroundColor: '#000000',
            color: '#ffffff',
            textAlign: 'center',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 'bold',
            marginTop: '12px',
            fontFamily: "'Times New Roman', Times, serif",
          }}
        >
          Note: Candidate must bring this ID card along with a valid ID proof.
        </div>
      </div>

      {/* Download & Print Action Buttons */}
      <div className="no-print" style={{ width: '800px', marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
        {/* Download as PNG */}
        <button
          type="button"
          onClick={handleDownloadImage}
          disabled={downloadingImg || downloadingPdf}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: '#000000',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer',
            opacity: downloadingImg || downloadingPdf ? 0.7 : 1,
          }}
        >
          {downloadingImg ? (
            <><Loader2 size={18} className="animate-spin" /> Generating PNG...</>
          ) : (
            <><Download size={18} /> Download as PNG</>
          )}
        </button>

        {/* Download as PDF */}
        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={downloadingImg || downloadingPdf}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: '#ffffff',
            color: '#000000',
            border: '2px solid #000000',
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer',
            opacity: downloadingImg || downloadingPdf ? 0.7 : 1,
          }}
        >
          {downloadingPdf ? (
            <><Loader2 size={18} className="animate-spin" /> Generating PDF...</>
          ) : (
            <><FileText size={18} /> Download as PDF</>
          )}
        </button>

        {/* Print */}
        <button
          type="button"
          onClick={handlePrint}
          disabled={downloadingImg || downloadingPdf}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: '#000000',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          <Printer size={18} /> Print
        </button>
      </div>
    </div>
  );
}

