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

  // ── Data extraction ──────────────────────────────────────────────────
  const formData = application?.admission_form_data || {};
  const appData = application || {};

  const studentName = appData.full_name || formData.full_name || application?.name || '';
  const fatherName = appData.father_name || formData.father_name || '';
  const motherName = appData.mother_name || formData.mother_name || '';
  const course = appData.course || formData.course || '';
  const session = appData.academic_session || formData.academic_session || '';
  const batch = appData.batch || '';
  const rollNumber = appData.roll_number || '';
  const dobFormatted = formatDisplayDob(appData.dob || formData.dob);
  const primaryMobile = appData.primary_mobile || formData.primary_mobile || application?.phone || '';
  const city = appData.perm_city || formData.city || '';
  const state = appData.perm_state || formData.state || '';
  const pin = appData.perm_pin || formData.pin_code || '';
  const address = [
    appData.perm_address_line1 || formData.address_line1,
    appData.perm_address_line2 || formData.address_line2,
  ].filter(Boolean).join(', ');

  const idNumber = 'BCN-' + (application?.id || '00000000').substring(0, 8).toUpperCase();
  const shortId = (application?.id || '00000000').substring(0, 8).toUpperCase();

  // Passport Photo
  const photoUrl =
    documents?.find((d) => d.document_type === 'passport_photo')?.file_url ||
    appData.photo_url ||
    formData.photo_url ||
    '';

  // ── 1. Download as PNG ───────────────────────────────────────────────
  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setDownloadingImg(true);
    try {
      await document.fonts.ready;
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 15000,
        scrollY: 0,
        scrollX: 0,
      });
      const link = document.createElement('a');
      link.download = `BCN-${shortId}-IDCard.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('PNG download error:', err);
      alert('Download failed. Please try again.');
    } finally {
      setDownloadingImg(false);
    }
  };

  // ── 2. Download as PDF (Centered on A4) ──────────────────────────────
  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    setDownloadingPdf(true);
    try {
      await document.fonts.ready;
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 15000,
        scrollY: 0,
        scrollX: 0,
      });
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const margin = 8; // 8mm margin
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
      pdf.save(`BCN-${shortId}-IDCard.pdf`);
    } catch (err) {
      console.error('PDF download error:', err);
      alert('PDF download failed. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  // ── 3. Print ID Card (Isolated 1-Page Iframe Print) ───────────────────
  const handlePrint = () => {
    if (!cardRef.current) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>BCN ID Card - ${shortId}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              font-family: "Times New Roman", "Georgia", serif;
            }
            body {
              background: #ffffff;
              display: flex;
              justify-content: center;
              align-items: flex-start;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .card-wrapper {
              width: 100%;
              max-width: 794px;
            }
            table {
              border-collapse: collapse;
            }
          </style>
        </head>
        <body>
          <div class="card-wrapper">
            ${cardRef.current.outerHTML}
          </div>
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(function() {
                if (window.frameElement && window.frameElement.parentNode) {
                  window.frameElement.parentNode.removeChild(window.frameElement);
                }
              }, 1500);
            };
          </script>
        </body>
      </html>
    `);
    doc.close();
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: '#f8fafc',
        boxSizing: 'border-box',
      }}
    >
      {/* Responsive scroll wrapper for card */}
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          overflowY: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          paddingTop: '8px',
          paddingBottom: '8px',
        }}
      >
        <div
          style={{
            transformOrigin: 'top center',
            flexShrink: 0,
          }}
        >
          {/* ═══════════ ID CARD (all inline styles — no Tailwind) ═══════════ */}
          <div
            ref={cardRef}
            className="print-id-card"
            style={{
              width: '794px',
              backgroundColor: '#ffffff',
              padding: '24px',
              fontFamily: '"Times New Roman", "Georgia", serif',
              color: '#000000',
              boxSizing: 'border-box',
              lineHeight: '1.25',
            }}
          >
            {/* ── HEADER ── */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
              <tbody>
                <tr>
                  <td style={{ width: '85px', verticalAlign: 'middle', paddingRight: '12px' }}>
                    <img
                      src="/logo.png"
                      alt="Logo"
                      crossOrigin="anonymous"
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  </td>
                  <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                    <div
                      style={{
                        fontSize: '26px',
                        fontWeight: 'bold',
                        letterSpacing: '1px',
                        lineHeight: '1.15',
                      }}
                    >
                      BUDDHA COLLEGE OF NURSING
                    </div>
                    <div style={{ fontSize: '13px', fontStyle: 'italic', marginTop: '2px' }}>
                      (Behind Brahmanand Narayanan Specialty Hospital)
                    </div>
                    <div style={{ fontSize: '13px', marginTop: '2px' }}>
                      Tamulia, P.S.: Kadali, Dist.: Seraikela-Kharsawan, Jharkhand – 831020
                    </div>
                    <div style={{ fontSize: '13px', marginTop: '2px' }}>
                      E-mail: buddhacollegeofnursingsn@gmail.com
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '3px' }}>
                      (Affiliated by: Health Education &amp; Family Welfare Department, JNRC Ranchi,
                      Govt. of Jharkhand)
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* ── Double horizontal line ── */}
            <div style={{ borderTop: '3px solid #000000', marginBottom: '3px' }}></div>
            <div style={{ borderTop: '1px solid #000000', marginBottom: '10px' }}></div>

            {/* ── ID CARD BANNER ── */}
            <div
              style={{
                backgroundColor: '#000000',
                color: '#ffffff',
                textAlign: 'center',
                padding: '6px 0',
                fontSize: '18px',
                fontWeight: 'bold',
                letterSpacing: '4px',
                marginBottom: '10px',
              }}
            >
              ID CARD
            </div>

            {/* ── MAIN BODY ── */}
            <div
              style={{
                border: '2px solid #000000',
                borderRadius: '4px',
                padding: '12px 14px',
                marginBottom: '8px',
              }}
            >
              {/* Row 1: Course, Session, Batch + Photo */}
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  marginBottom: '6px',
                  borderBottom: '1px dashed #000000',
                }}
              >
                <tbody>
                  <tr>
                    {/* Left Column: Course, Session & Batch */}
                    <td style={{ verticalAlign: 'top', paddingRight: '16px', paddingBottom: '8px' }}>
                      {/* Course */}
                      <table
                        style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          marginBottom: '8px',
                        }}
                      >
                        <tbody>
                          <tr>
                            <td
                              style={{
                                width: '65px',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                padding: '4px 0',
                                verticalAlign: 'bottom',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Course:
                            </td>
                            <td
                              style={{
                                borderBottom: '1px solid #000000',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                fontSize: '14px',
                                padding: '4px 8px',
                                verticalAlign: 'bottom',
                              }}
                            >
                              {course}
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Session & Batch */}
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                          <tr>
                            <td
                              style={{
                                width: '65px',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                padding: '4px 0',
                                verticalAlign: 'bottom',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Session:
                            </td>
                            <td
                              style={{
                                borderBottom: '1px solid #000000',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                padding: '4px 8px',
                                verticalAlign: 'bottom',
                                minWidth: '90px',
                              }}
                            >
                              {session}
                            </td>
                            <td style={{ width: '20px' }}></td>
                            <td
                              style={{
                                width: '50px',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                padding: '4px 0',
                                verticalAlign: 'bottom',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Batch:
                            </td>
                            <td
                              style={{
                                borderBottom: '1px solid #000000',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                padding: '4px 8px',
                                verticalAlign: 'bottom',
                                minWidth: '80px',
                              }}
                            >
                              {batch || ''}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>

                    {/* Right Column: Photo Box */}
                    <td
                      style={{
                        width: '105px',
                        verticalAlign: 'top',
                        paddingBottom: '8px',
                      }}
                    >
                      <div
                        style={{
                          width: '105px',
                          height: '125px',
                          border: '1px solid #888888',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#f8f8f8',
                          overflow: 'hidden',
                          boxSizing: 'border-box',
                        }}
                      >
                        {photoUrl ? (
                          <img
                            src={photoUrl}
                            alt="Student"
                            crossOrigin="anonymous"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              textAlign: 'center',
                              fontSize: '10px',
                              color: '#666666',
                              padding: '6px',
                              lineHeight: '1.25',
                            }}
                          >
                            Paste your recent passport size photograph
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Row 2: Form No & Roll No */}
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  marginBottom: '6px',
                }}
              >
                <tbody>
                  <tr>
                    <td
                      style={{
                        width: '85px',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        padding: '4px 0',
                        verticalAlign: 'bottom',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Form No.:
                    </td>
                    <td
                      style={{
                        borderBottom: '1px solid #000000',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        padding: '4px 8px',
                        verticalAlign: 'bottom',
                      }}
                    >
                      {idNumber}
                    </td>
                    <td style={{ width: '24px' }}></td>
                    <td
                      style={{
                        width: '75px',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        padding: '4px 0',
                        verticalAlign: 'bottom',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Roll No.:
                    </td>
                    <td
                      style={{
                        borderBottom: '1px solid #000000',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        padding: '4px 8px',
                        verticalAlign: 'bottom',
                      }}
                    >
                      {rollNumber || ''}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Stacked field rows: Name, Parents, DOB, Contact, Address */}
              {[
                { label: 'Name of Candidate:', value: studentName },
                { label: "Father's Name:", value: fatherName },
                { label: "Mother's Name:", value: motherName },
                { label: 'Date of Birth:', value: dobFormatted },
                { label: 'Contact No.:', value: primaryMobile },
                { label: 'Address:', value: address },
              ].map((field, i) => (
                <table
                  key={i}
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginBottom: '6px',
                  }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          width: '165px',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          padding: '4px 0',
                          verticalAlign: 'bottom',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {field.label}
                      </td>
                      <td
                        style={{
                          borderBottom: '1px solid #000000',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          padding: '4px 8px',
                          verticalAlign: 'bottom',
                        }}
                      >
                        {field.value || ''}
                      </td>
                    </tr>
                  </tbody>
                </table>
              ))}

              {/* City, State, Pin row */}
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  marginBottom: '4px',
                }}
              >
                <tbody>
                  <tr>
                    <td
                      style={{
                        width: '45px',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        padding: '4px 0',
                        verticalAlign: 'bottom',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      City:
                    </td>
                    <td
                      style={{
                        borderBottom: '1px solid #000000',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        padding: '4px 8px',
                        verticalAlign: 'bottom',
                      }}
                    >
                      {city || ''}
                    </td>
                    <td style={{ width: '16px' }}></td>
                    <td
                      style={{
                        width: '48px',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        padding: '4px 0',
                        verticalAlign: 'bottom',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      State:
                    </td>
                    <td
                      style={{
                        borderBottom: '1px solid #000000',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        padding: '4px 8px',
                        verticalAlign: 'bottom',
                      }}
                    >
                      {state || ''}
                    </td>
                    <td style={{ width: '16px' }}></td>
                    <td
                      style={{
                        width: '38px',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        padding: '4px 0',
                        verticalAlign: 'bottom',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Pin:
                    </td>
                    <td
                      style={{
                        borderBottom: '1px solid #000000',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        padding: '4px 8px',
                        verticalAlign: 'bottom',
                        width: '120px',
                      }}
                    >
                      {pin || ''}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ── BOTTOM SECTION ── */}
            <div
              style={{
                border: '2px solid #000000',
                borderRadius: '4px',
                padding: '12px 14px',
                marginBottom: '8px',
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  marginBottom: '16px',
                }}
              >
                <tbody>
                  <tr>
                    <td
                      style={{
                        width: '105px',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        padding: '4px 0',
                        verticalAlign: 'bottom',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Exam Centre:
                    </td>
                    <td
                      style={{
                        borderBottom: '1px solid #000000',
                        padding: '4px 8px',
                        verticalAlign: 'bottom',
                        height: '24px',
                      }}
                    ></td>
                    <td style={{ width: '24px' }}></td>
                    <td
                      style={{
                        width: '155px',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        padding: '4px 0',
                        verticalAlign: 'bottom',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Date of Examination:
                    </td>
                    <td
                      style={{
                        borderBottom: '1px solid #000000',
                        padding: '4px 8px',
                        verticalAlign: 'bottom',
                        height: '24px',
                      }}
                    ></td>
                  </tr>
                </tbody>
              </table>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
                <tbody>
                  <tr>
                    <td
                      style={{
                        width: '175px',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        padding: '4px 0',
                        verticalAlign: 'bottom',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Signature of Candidate:
                    </td>
                    <td
                      style={{
                        borderBottom: '1px solid #000000',
                        padding: '4px 8px',
                        verticalAlign: 'bottom',
                        height: '24px',
                      }}
                    ></td>
                    <td style={{ width: '24px' }}></td>
                    <td
                      style={{
                        width: '165px',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        padding: '4px 0',
                        verticalAlign: 'bottom',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Signature of Principal:
                    </td>
                    <td
                      style={{
                        borderBottom: '1px solid #000000',
                        padding: '4px 8px',
                        verticalAlign: 'bottom',
                        height: '24px',
                      }}
                    ></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ── FOOTER NOTE ── */}
            <div
              style={{
                backgroundColor: '#000000',
                color: '#ffffff',
                textAlign: 'center',
                padding: '6px',
                fontSize: '12px',
                fontWeight: 'bold',
              }}
            >
              Note: Candidate must bring this ID card along with a valid ID proof.
            </div>
          </div>
          {/* ═══════════ END ID CARD ═══════════ */}
        </div>
      </div>

      {/* ── Download & Print Action Buttons ── */}
      <div
        className="no-print"
        style={{
          width: '100%',
          maxWidth: '800px',
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        {/* Download as PNG */}
        <button
          type="button"
          onClick={handleDownloadImage}
          disabled={downloadingImg || downloadingPdf}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 20px',
            backgroundColor: '#000000',
            color: '#ffffff',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '14px',
            minHeight: '44px',
            cursor: 'pointer',
            border: 'none',
            opacity: downloadingImg || downloadingPdf ? 0.7 : 1,
            transition: 'all 0.2s ease',
          }}
        >
          {downloadingImg ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Generating
              PNG...
            </>
          ) : (
            <>
              <Download size={18} /> Download as PNG
            </>
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
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 20px',
            backgroundColor: '#ffffff',
            color: '#000000',
            border: '2px solid #000000',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '14px',
            minHeight: '44px',
            cursor: 'pointer',
            opacity: downloadingImg || downloadingPdf ? 0.7 : 1,
            transition: 'all 0.2s ease',
          }}
        >
          {downloadingPdf ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Generating
              PDF...
            </>
          ) : (
            <>
              <FileText size={18} /> Download as PDF
            </>
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
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 20px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '14px',
            minHeight: '44px',
            cursor: 'pointer',
            border: 'none',
            opacity: downloadingImg || downloadingPdf ? 0.7 : 1,
            transition: 'all 0.2s ease',
          }}
        >
          <Printer size={18} /> Print
        </button>
      </div>

      {/* Spin animation for loader icons */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
