import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

export default function Otp() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  const handleChange = (e, index) => {
    const value = e.target.value;
    const char = value.substring(value.length - 1);
    if (char === '' || /^[0-9]$/.test(char)) {
      const newOtp = [...otp];
      newOtp[index] = char;
      setOtp(newOtp);
      if (char !== '' && index < 5) inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.every(d => d !== '')) {
      sessionStorage.setItem("isAuthenticated", "true"); 
      navigate("/app/blacklists"); 
    }
  };

  const isComplete = otp.every(digit => digit !== '');

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#011530]  font-semibold">
      <div className="w-105 p-2.5">
        <div className="bg-white rounded-xl shadow-2xl px-8 py-10 text-center">
          
          <div className="flex flex-col items-center mb-2">
            <div className="w-17.5 h-17.5 bg-[#011530] rounded-full flex justify-center items-center mb-3">
              <img src='/security.png' className="w-10 h-10 object-contain" alt="Logo" />
            </div>
            <p className="text-[#011530] text-2xl mb-8">Security Verification</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col mt-1">
            <p className="text-[#011530]/60 text-sm -mt-7 mb-4">Enter the 6-digit code sent to your email</p>
            
            <div className="flex justify-center gap-2.5 mb-9">
              {otp.map((digit, index) => (
                <input
                  key={index} type="text" maxLength={1} value={digit}
                  ref={el => inputRefs.current[index] = el}
                  onChange={e => handleChange(e, index)}
                  onKeyDown={e => handleKeyDown(e, index)}
                  className="w-11.25 h-15 text-xl font-bold text-center bg-[#1e293b] border-2 border-[#334155] rounded-xl text-white focus:outline-none focus:border-[#ff5925] focus:ring-4 focus:ring-[#ff5925]/25 transition-all"
                  inputMode="numeric"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={!isComplete}
              className={`py-3.5 rounded-lg text-[1.1rem] font-bold transition-all ${isComplete ? 'bg-[#ff5925] text-white hover:bg-[#e04e1e] hover:-translate-y-0.5 shadow-lg shadow-[#fd6f44]/35' : 'bg-[#4a5568] opacity-70 cursor-not-allowed text-white'}`}
            >
              Verify
            </button>

            <div className="mt-5 text-[0.95rem] text-[#94a3b8]">
              <p>You haven't received the code?</p>
              <button type="button" className="text-[#ff5925] font-medium underline hover:text-[#ff7a3d]" onClick={() => alert("Code resent!")}>
                Resend code
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}