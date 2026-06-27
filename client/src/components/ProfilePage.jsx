import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Camera, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const API = 'https://ictehub.onrender.com';

export default function ProfilePage({ user, token, onProfileUpdate }) {
  const [name, setName] = useState(user.name || '');
  const [profilePictureUrl, setProfilePictureUrl] = useState(user.profile_picture_url || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setName(user.name || '');
    setProfilePictureUrl(user.profile_picture_url || '');
  }, [user]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'profile-picture');

    try {
      const res = await fetch(`${API}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setProfilePictureUrl(data.url);
      setSuccess('Profile picture uploaded successfully! Save changes to apply.');
    } catch (err) {
      setError('Could not upload profile picture.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          profile_picture_url: profilePictureUrl || null
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update profile');
      }

      const updatedUser = await res.json();
      onProfileUpdate(updatedUser);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const initials = (name || user.email || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFC] font-sans py-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">My Profile</h1>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">Manage your account information and preferences</p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2.5 text-red-700 text-xs font-bold animate-in fade-in">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-2.5 text-emerald-700 text-xs font-bold animate-in fade-in">
            <CheckCircle2 size={15} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-8">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group cursor-pointer">
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover bg-slate-50 border-2 border-slate-100 shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1E40FF] to-indigo-600 flex items-center justify-center text-2xl font-extrabold text-white shadow-md border-2 border-white">
                  {initials}
                </div>
              )}

              {/* Upload overlay */}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="profile-upload-input"
              />
              <label
                htmlFor="profile-upload-input"
                className="absolute inset-0 bg-black/40 hover:bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {uploading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Camera size={20} />
                )}
              </label>
            </div>
            <div className="text-center">
              <h2 className="font-bold text-slate-800 text-base">{user.name || 'Set your name'}</h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1E40FF] bg-[#EEF2FF] px-2 py-0.5 rounded-full uppercase tracking-wider mt-1">
                <Shield size={10} /> {user.role}
              </span>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Email (Read Only) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Mail size={12} /> Email Address
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-400 outline-none cursor-not-allowed"
              />
              <p className="text-[10px] font-semibold text-slate-400 mt-1">Email address cannot be changed.</p>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <User size={12} /> Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E40FF]/50 focus:ring-2 focus:ring-[#1E40FF]/15 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none transition-all"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving || uploading}
              className="w-full py-3 bg-[#1E40FF] hover:bg-[#1E40FF]/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#1E40FF]/25 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              Save Profile Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
