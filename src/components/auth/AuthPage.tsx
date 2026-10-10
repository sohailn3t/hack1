import React, { useState } from 'react';
import { Eye, EyeOff, Shield, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthPage: React.FC = () => {
  const { login, signup, error: authError } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (mode === 'signup' && password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'login') await login(email, password);
      else await signup(fullName, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to complete authentication.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-[#14213D] p-7 text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center"><Shield /></div>
            <div><h1 className="font-extrabold tracking-wider">HEATSHIELD AI</h1><p className="text-xs text-slate-300">Hyperlocal Heat Intelligence</p></div>
          </div>
        </div>
        <form onSubmit={submit} className="p-7 space-y-4">
          <div><h2 className="text-xl font-bold text-[#14213D]">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2><p className="text-xs text-slate-500 mt-1">Secure access to your heat-safety workspace.</p></div>
          {mode === 'signup' && <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className="w-full px-3 py-2.5 border rounded-lg text-sm" />}
          <input required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" type={mode === 'login' ? 'text' : 'email'} className="w-full px-3 py-2.5 border rounded-lg text-sm" />
          <div className="relative"><input required minLength={mode === 'signup' ? 8 : undefined} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type={showPassword ? 'text' : 'password'} className="w-full px-3 py-2.5 border rounded-lg text-sm pr-10" /><button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-2.5 text-slate-400">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
          {mode === 'signup' && <input required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" type="password" className="w-full px-3 py-2.5 border rounded-lg text-sm" />}
          {mode === 'login' && <div className="text-[11px] text-slate-500 bg-blue-50 border border-blue-100 rounded-lg p-2">Demo access: <strong>demo</strong> / <strong>demo</strong></div>}
          {(error || authError) && <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">{error || authError}</div>}
          <button disabled={busy} className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-semibold text-sm disabled:opacity-60">{busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}</button>
          <button type="button" onClick={() => { setMode((v) => v === 'login' ? 'signup' : 'login'); setError(''); }} className="w-full text-sm text-blue-700 font-semibold flex justify-center items-center gap-2">{mode === 'login' ? <><UserPlus size={16} /> Create an account</> : 'Back to login'}</button>
        </form>
      </div>
    </main>
  );
};
