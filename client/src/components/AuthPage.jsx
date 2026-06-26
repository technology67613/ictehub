import React, { useState } from 'react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'telecaller',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleToggle = (mode) => {
    setIsLogin(mode === 'login');
    setError('');
    setSuccess('');
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'telecaller',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    if (!isLogin && !formData.name) {
      setError('Please provide your name.');
      setIsLoading(false);
      return;
    }

    const endpoint = isLogin ? '/auth/login' : '/auth/signup';
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        };

    try {
      const response = await fetch(`https://ictehub.onrender.com${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong. Please try again.');
      }

      localStorage.setItem('token', data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      setSuccess(isLogin ? 'Login successful!' : 'Registration successful!');
      console.log('Authentication Successful:', data);
    } catch (err) {
      setError(err.message || 'Failed to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-academic-bg p-6 font-sans text-slate-600">
      <div className="w-full max-w-md bg-white border border-academic-border rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="text-3xl font-serif font-extrabold text-academic-navy tracking-tight mb-2">ictEHub</div>
          <p className="text-xs text-slate-400 uppercase tracking-widest">
            {isLogin ? 'Please log in to continue' : 'Create a new account'}
          </p>
        </div>

        <div className="flex border-b border-slate-200 mb-6">
          <button
            type="button"
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer text-center ${
              isLogin
                ? 'border-b-2 border-academic-gold text-academic-navy font-bold'
                : 'text-slate-400 hover:text-academic-navy'
            }`}
            onClick={() => handleToggle('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer text-center ${
              !isLogin
                ? 'border-b-2 border-academic-gold text-academic-navy font-bold'
                : 'text-slate-400 hover:text-academic-navy'
            }`}
            onClick={() => handleToggle('signup')}
          >
            Signup
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg p-3.5 mb-5 font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-lg p-3.5 mb-5 font-medium">
            {success}
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="John Doe"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-academic-gold focus:ring-4 focus:ring-academic-gold/10 transition-all duration-150 text-sm bg-academic-bg/25"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="name@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-academic-gold focus:ring-4 focus:ring-academic-gold/10 transition-all duration-150 text-sm bg-academic-bg/25"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-academic-gold focus:ring-4 focus:ring-academic-gold/10 transition-all duration-150 text-sm bg-academic-bg/25"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400" htmlFor="role">
                Assign Role
              </label>
              <select
                id="role"
                name="role"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 bg-white focus:outline-none focus:border-academic-gold focus:ring-4 focus:ring-academic-gold/10 transition-all duration-150 text-sm"
                value={formData.role}
                onChange={handleChange}
                required={!isLogin}
              >
                <option value="telecaller">Telecaller</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-xl bg-academic-navy text-white font-bold text-xs uppercase tracking-wider hover:bg-opacity-95 focus:outline-none active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            disabled={isLoading}
          >
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
