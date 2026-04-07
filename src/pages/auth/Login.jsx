import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { UserRound, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import OtpModal from './OtpModal';

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpMeta, setOtpMeta] = useState({
    delivery: 'email',
    localOtp: '',
    localOtpExpiresAt: '',
    warning: ''
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address");
      setTouched(true);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await authService.login(email);
      const payload = response?.data || {};
      const data = payload?.data && typeof payload.data === 'object' ? payload.data : payload;
      const normalizedDelivery = String(data.delivery || '').toLowerCase();
      const isLocalMode = normalizedDelivery === 'local' || Boolean(data.otpCode);

      setOtpMeta({
        delivery: isLocalMode ? 'local' : 'email',
        localOtp: isLocalMode ? String(data.otpCode || '') : '',
        localOtpExpiresAt: isLocalMode ? data.otpExpiresAt || '' : '',
        warning: isLocalMode ? data.warning || '' : ''
      });
      setShowOtpModal(true);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send OTP right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const getInputClasses = (hasError) => {
    const baseClasses = "w-full pl-10 pr-4 py-3 border-2 rounded-xl text-[#343a43] transition-all duration-200 focus:outline-none";
    
    if (hasError && touched) {
      return `${baseClasses} border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 bg-red-50/50`;
    }
    return `${baseClasses} border-slate-100 focus:border-[#ff6b6b] focus:ring-4 focus:ring-[#ff6b6b]/10`;
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#011530] font-sans">
      <div className="w-full max-w-md p-6">
        <div className="bg-white rounded-3xl shadow-2xl px-10 py-12 text-center">
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-[#011530] rounded-3xl flex justify-center items-center mb-4 transform -rotate-6 shadow-xl">
              <img src='/security.png' className="w-12 h-12 object-contain" alt="Logo" />
            </div>
            <h2 className="text-[#011530] text-3xl font-bold tracking-tight">SIMS Security</h2>
            <p className="text-slate-400 mt-2">Intelligence Management System</p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="text-left">
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1" htmlFor="email">Work Email</label>
              <div className="relative">
                <UserRound 
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                    error && touched ? 'text-red-500' : 'text-slate-400'
                  }`}
                  size={20} 
                />
                <input
                  className={getInputClasses(!!error)}
                  type="email" 
                  id="email" 
                  placeholder="name@bank-domain.com" 
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => setTouched(true)}
                  required
                />
                {error && touched && (
                  <AlertCircle 
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-red-500"
                    size={20} 
                  />
                )}
              </div>
              <div className="min-h-[1.25rem] mt-2 ml-1">
                {error && touched && (
                  <p className="text-red-500 text-xs font-semibold flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-500"></span>
                    {error}
                  </p>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-2xl text-[1.1rem] font-bold cursor-pointer transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed ${
                isSubmitting ? 'bg-slate-400' : 'bg-[#ff5925] hover:bg-[#e04e1e] text-white shadow-[#fd6f44]/30'
              }`}
            >
              {isSubmitting ? "Processing..." : "Get OTP Code"}
            </button>
          </form>

          <p className="mt-8 text-sm text-slate-400">
            Forgot access? Contact <a href="mailto:admin@sims.com" className="text-[#031124] font-bold hover:underline">Support</a>
          </p>

        </div>
      </div>

      {showOtpModal && (
        <OtpModal 
          email={email} 
          delivery={otpMeta.delivery}
          localOtp={otpMeta.localOtp}
          localOtpExpiresAt={otpMeta.localOtpExpiresAt}
          warning={otpMeta.warning}
          onClose={() => setShowOtpModal(false)}
          onVerified={() => {
            setShowOtpModal(false);
          }}
        />
      )}
    </div>
  );
}

export default Login;