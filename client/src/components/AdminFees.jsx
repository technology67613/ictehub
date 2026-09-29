import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  IndianRupee, Search, Filter, Download, Plus, Trash2, CheckCircle2,
  Calendar, CreditCard, ShieldCheck, Printer, X, Loader2, ArrowUpRight,
  TrendingUp, FileText, User, Phone, Check, Copy
} from 'lucide-react';
import { API } from '../api';

const FEE_TYPES = ['Tuition Fee', 'Admission Fee', 'Exam Fee', 'Hostel Fee', 'Uniform/Kit Fee', 'Other'];
const PAYMENT_MODES = ['UPI', 'Cash', 'Bank Transfer', 'Demand Draft', 'Cheque'];

export default function AdminFees({ token }) {
  const [feeRecords, setFeeRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [feeTypeFilter, setFeeTypeFilter] = useState('All');
  const [paymentModeFilter, setPaymentModeFilter] = useState('All');

  // Modal State for new record
  const [showModal, setShowModal] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [feeType, setFeeType] = useState('Tuition Fee');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactionRef, setTransactionRef] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [copiedReceiptId, setCopiedReceiptId] = useState(null);
  const printRef = useRef(null);

  useEffect(() => {
    fetchFeeRecords();
  }, [token]);

  const fetchFeeRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/fee-records`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load fee records');
      const data = await res.json();
      setFeeRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFeeRecord = async (e) => {
    e.preventDefault();
    if (!studentName.trim() || !amount || parseFloat(amount) <= 0) {
      setFormError('Please provide student name and a valid positive amount.');
      return;
    }
    setSubmitting(true);
    setFormError('');

    try {
      const res = await fetch(`${API}/fee-records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          student_name: studentName.trim(),
          phone: phone.trim() || null,
          amount: parseFloat(amount),
          fee_type: feeType,
          payment_mode: paymentMode,
          payment_date: paymentDate,
          transaction_ref: transactionRef.trim() || null,
          remarks: remarks.trim() || null
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to save fee record');
      }

      const created = await res.json();
      setFeeRecords(prev => [created, ...prev]);
      setShowModal(false);
      resetForm();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Are you sure you want to delete this fee record? This action cannot be undone.')) return;
    try {
      const res = await fetch(`${API}/fee-records/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setFeeRecords(prev => prev.filter(r => r.id !== id));
      }
    } catch (err) {
      alert('Could not delete fee record: ' + err.message);
    }
  };

  const resetForm = () => {
    setStudentName('');
    setPhone('');
    setAmount('');
    setFeeType('Tuition Fee');
    setPaymentMode('UPI');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setTransactionRef('');
    setRemarks('');
    setFormError('');
  };

  const copyReceipt = (receiptNo, id) => {
    navigator.clipboard.writeText(receiptNo);
    setCopiedReceiptId(id);
    setTimeout(() => setCopiedReceiptId(null), 2000);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const exportToCSV = () => {
    const headers = ['Receipt No', 'Student Name', 'Phone', 'Amount (INR)', 'Fee Type', 'Payment Mode', 'Date', 'Transaction Ref', 'Recorded By'];
    const rows = filteredRecords.map(r => [
      `"${r.receipt_number || ''}"`,
      `"${(r.student_name || '').replace(/"/g, '""')}"`,
      `"${r.phone || ''}"`,
      r.amount || 0,
      `"${r.fee_type || ''}"`,
      `"${r.payment_mode || ''}"`,
      `"${r.payment_date || ''}"`,
      `"${(r.transaction_ref || '').replace(/"/g, '""')}"`,
      `"${(r.recorded_by || '').replace(/"/g, '""')}"`
    ]);
    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bcn_fee_records_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const filteredRecords = useMemo(() => {
    return feeRecords.filter(record => {
      const q = searchVal.trim().toLowerCase();
      const matchSearch = !q ||
        (record.student_name || '').toLowerCase().includes(q) ||
        (record.phone || '').includes(q) ||
        (record.receipt_number || '').toLowerCase().includes(q) ||
        (record.transaction_ref || '').toLowerCase().includes(q);

      const matchType = feeTypeFilter === 'All' || record.fee_type === feeTypeFilter;
      const matchMode = paymentModeFilter === 'All' || record.payment_mode === paymentModeFilter;

      return matchSearch && matchType && matchMode;
    });
  }, [feeRecords, searchVal, feeTypeFilter, paymentModeFilter]);

  // Key metrics
  const totalAmountCollected = useMemo(() => {
    return feeRecords.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
  }, [feeRecords]);

  const thisMonthAmount = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    return feeRecords.reduce((sum, r) => {
      if (r.payment_date && r.payment_date.startsWith(currentMonth)) {
        return sum + (parseFloat(r.amount) || 0);
      }
      return sum;
    }, 0);
  }, [feeRecords]);

  const upiCount = useMemo(() => {
    return feeRecords.filter(r => r.payment_mode === 'UPI').length;
  }, [feeRecords]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="text-[#1E40FF] animate-spin" />
          <p className="text-slate-600 font-semibold text-sm">Loading fee management records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFC] font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Financial Operations</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">Fee Management & Tracking</h1>
            <p className="text-xs font-semibold text-slate-500">Record tuition, admission, and kit payments for Buddha College of Nursing</p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={exportToCSV}
              className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="px-4 py-2.5 bg-[#1E40FF] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer border-none"
            >
              <Plus size={15} /> Record Payment
            </button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <IndianRupee size={22} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Collected</div>
              <div className="text-xl font-black text-slate-900 leading-tight mt-0.5">
                ₹{totalAmountCollected.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
              <TrendingUp size={22} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">This Month</div>
              <div className="text-xl font-black text-slate-900 leading-tight mt-0.5">
                ₹{thisMonthAmount.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
              <FileText size={22} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Receipts</div>
              <div className="text-xl font-black text-slate-900 leading-tight mt-0.5">
                {feeRecords.length}
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
              <CreditCard size={22} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">UPI Payments</div>
              <div className="text-xl font-black text-slate-900 leading-tight mt-0.5">
                {upiCount} ({feeRecords.length ? Math.round((upiCount / feeRecords.length) * 100) : 0}%)
              </div>
            </div>
          </div>
        </div>

        {/* ── Search and Filter Controls ── */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1 min-w-0">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search by student name, phone, receipt #, or transaction ref..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:border-blue-400 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <select
              value={feeTypeFilter}
              onChange={e => setFeeTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none cursor-pointer shrink-0"
            >
              <option value="All">All Fee Types</option>
              {FEE_TYPES.map(ft => (
                <option key={ft} value={ft}>{ft}</option>
              ))}
            </select>

            <select
              value={paymentModeFilter}
              onChange={e => setPaymentModeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none cursor-pointer shrink-0"
            >
              <option value="All">All Modes</option>
              {PAYMENT_MODES.map(pm => (
                <option key={pm} value={pm}>{pm}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Records Table ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="hidden md:grid md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_auto] gap-3 px-5 py-3.5 bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
            <div>Student / Phone</div>
            <div>Receipt No</div>
            <div>Fee Type</div>
            <div>Mode</div>
            <div>Amount</div>
            <div>Date</div>
            <div className="text-right">Actions</div>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <IndianRupee size={32} className="mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-600">No fee records found.</p>
              <p className="text-xs text-slate-400">Click "Record Payment" to add the first fee entry.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredRecords.map(record => (
                <div
                  key={record.id}
                  className="flex flex-col md:grid md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_auto] gap-3 items-start md:items-center px-5 py-4 hover:bg-slate-50/70 transition-colors text-xs"
                >
                  {/* Student */}
                  <div>
                    <div className="font-extrabold text-slate-900">{record.student_name}</div>
                    {record.phone && (
                      <div className="text-[11px] text-slate-400 font-semibold mt-0.5">{record.phone}</div>
                    )}
                  </div>

                  {/* Receipt */}
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-700">
                    <span>{record.receipt_number || '—'}</span>
                    {record.receipt_number && (
                      <button
                        onClick={() => copyReceipt(record.receipt_number, record.id)}
                        className="p-1 rounded hover:bg-slate-200 text-slate-400 border-none bg-transparent cursor-pointer"
                        title="Copy Receipt Number"
                      >
                        {copiedReceiptId === record.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                    )}
                  </div>

                  {/* Fee Type */}
                  <div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-[#1E40FF] border border-blue-100">
                      {record.fee_type || 'Tuition Fee'}
                    </span>
                  </div>

                  {/* Mode */}
                  <div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                      {record.payment_mode || 'Cash'}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="font-extrabold text-slate-900 text-sm">
                    ₹{parseFloat(record.amount || 0).toLocaleString('en-IN')}
                  </div>

                  {/* Date */}
                  <div className="text-slate-500 font-semibold">
                    {record.payment_date ? new Date(record.payment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1.5 shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t border-slate-100 md:border-none">
                    <button
                      onClick={() => setSelectedReceipt(record)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border-none cursor-pointer"
                      title="View & Print Receipt"
                    >
                      <Printer size={13} />
                      <span className="md:hidden">Print Receipt</span>
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(record.id)}
                      className="p-1.5 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors border-none cursor-pointer"
                      title="Delete Record"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredRecords.length > 0 && (
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 text-[11px] font-bold text-slate-400">
              Showing {filteredRecords.length} of {feeRecords.length} recorded payments
            </div>
          )}
        </div>

      </div>

      {/* ── Record Payment Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <IndianRupee size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Record New Fee Payment</h3>
                  <p className="text-[11px] font-semibold text-slate-400">Generate receipt for student admission fees</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 border-none bg-transparent cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateFeeRecord} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Student Name *</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={e => setStudentName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="e.g. 35000"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-black text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={e => setPaymentDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Fee Category</label>
                  <select
                    value={feeType}
                    onChange={e => setFeeType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-blue-500"
                  >
                    {FEE_TYPES.map(ft => (
                      <option key={ft} value={ft}>{ft}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={e => setPaymentMode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-blue-500"
                  >
                    {PAYMENT_MODES.map(pm => (
                      <option key={pm} value={pm}>{pm}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Transaction Ref / Cheque No.</label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={e => setTransactionRef(e.target.value)}
                  placeholder="e.g. UPI / IMPS Ref ID or Cheque / DD number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Remarks / Notes</label>
                <textarea
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="Optional payment notes or installment details..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium outline-none focus:border-blue-500 resize-none h-18"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold border-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border-none cursor-pointer shadow-sm"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Receipt Slip View & Print Modal ── */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Official Receipt Preview</span>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 border-none bg-transparent cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Printable Receipt Box */}
            <div ref={printRef} className="p-5 border-2 border-dashed border-slate-200 rounded-2xl bg-white space-y-4 font-sans">
              <div className="text-center border-b pb-3 border-slate-200">
                <h2 className="text-base font-black text-slate-900 tracking-tight">Buddha College of Nursing</h2>
                <p className="text-[10px] text-slate-500">Excellence in Nursing Education &bull; Patna, Bihar</p>
                <div className="mt-2 inline-block px-3 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] tracking-wider uppercase">
                  Fee Payment Receipt
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block font-semibold">Receipt No:</span>
                  <strong className="text-slate-900 font-mono">{selectedReceipt.receipt_number}</strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block font-semibold">Date:</span>
                  <strong className="text-slate-900">{selectedReceipt.payment_date}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Student Name:</span>
                  <strong className="text-slate-900">{selectedReceipt.student_name}</strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block font-semibold">Phone:</span>
                  <strong className="text-slate-900">{selectedReceipt.phone || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Fee Type:</span>
                  <strong className="text-slate-900">{selectedReceipt.fee_type}</strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block font-semibold">Mode:</span>
                  <strong className="text-slate-900">{selectedReceipt.payment_mode}</strong>
                </div>
                {selectedReceipt.transaction_ref && (
                  <div className="col-span-2">
                    <span className="text-slate-400 block font-semibold">Txn / Ref ID:</span>
                    <span className="text-slate-700 font-mono">{selectedReceipt.transaction_ref}</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Amount Received</div>
                <div className="text-2xl font-black text-emerald-600 mt-0.5">
                  ₹{parseFloat(selectedReceipt.amount).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="flex justify-between items-end pt-4 border-t border-slate-100 text-[10px] text-slate-400">
                <div>
                  <div>Issued by: {selectedReceipt.recorded_by || 'Admin Accounts'}</div>
                  <div>Status: Confirmed</div>
                </div>
                <div className="text-right">
                  <div className="w-24 h-6 border-b border-slate-300 mb-1" />
                  <div>Authorized Signatory</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border-none cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handlePrintReceipt}
                className="px-4 py-2 bg-[#1E40FF] hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border-none cursor-pointer shadow-sm"
              >
                <Printer size={14} /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
