import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { userService } from '../../services/userService';

function ConfirmAccount() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const triggerConfirmation = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid or missing confirmation token.');
        return;
      }

      try {
        const response = await userService.confirmAccount(token);
        setStatus('success');
        setMessage(response.message || 'Your account has been successfully activated!');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Failed to confirm account. The link may be expired or invalid.');
      }
    };

    triggerConfirmation();
  }, [token]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#011530] font-sans">
      <div className="w-full max-w-md p-6">
        <div className="bg-white rounded-3xl shadow-2xl px-10 py-12 text-center">
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-[#011530] rounded-3xl flex justify-center items-center mb-4 transform -rotate-6 shadow-xl">
              <img src='/security.png' className="w-12 h-12 object-contain" alt="Logo" />
            </div>
            <h2 className="text-[#011530] text-3xl font-bold tracking-tight">Account Activation</h2>
            <p className="text-slate-400 mt-2">SIMS Security Verification</p>
          </div>

          <div className="py-8 px-4 rounded-2xl bg-slate-50 border border-slate-100 mb-8">
            {status === 'loading' && (
              <div className="flex flex-col items-center">
                <Loader2 className="w-12 h-12 text-[#ff5925] animate-spin mb-4" />
                <p className="text-slate-600 font-medium text-lg text-center">Verifying your token...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center">
                <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
                <p className="text-slate-800 font-bold text-xl mb-2">Activation Successful!</p>
                <p className="text-slate-500 text-center">{message}</p>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center">
                <XCircle className="w-16 h-16 text-red-500 mb-4" />
                <p className="text-slate-800 font-bold text-xl mb-2">Activation Failed</p>
                <p className="text-slate-500 text-center">{message}</p>
              </div>
            )}
          </div>

          {(status === 'success' || status === 'error') && (
            <Link 
              to="/login"
              className="w-full py-4 px-6 rounded-2xl bg-[#ff5925] hover:bg-[#e04e1e] text-white text-[1.1rem] font-bold cursor-pointer transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group"
            >
              Go to Login Page
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          )}

          <p className="mt-8 text-sm text-slate-400">
            Need help? Contact <a href="mailto:admin@sims.com" className="text-[#031124] font-bold hover:underline">Support</a>
          </p>

        </div>
      </div>
    </div>
  );
}

export default ConfirmAccount;
