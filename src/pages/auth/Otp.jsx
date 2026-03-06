import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

export default function Otp() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (e, index) => {
    const value = e.target.value;
    
    // Only allow the last character entered (prevents double characters)
    const char = value.substring(value.length - 1);

    if (char === '' || /^[0-9]$/.test(char)) {
      const newOtp = [...otp];
      newOtp[index] = char;
      setOtp(newOtp);

      // Move focus forward if a digit was entered
      if (char !== '' && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    // If Backspace is pressed and the current field is empty, move back
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newOtp = [...otp];
      pasted.split('').forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      const nextFocus = Math.min(pasted.length, 5);
      inputRefs.current[nextFocus]?.focus();
    }
  };

  const handleSubmit = (e) => {
  e.preventDefault();
  const code = otp.join('');
  if (code.length === 6) {
    // 1. SAVE THE LOGIN STATE
    localStorage.setItem("isAuthenticated", "true"); 

    // 2. MOVE TO THE APP
    navigate("/app/blacklists"); 
  }
};
  const handleResend = () => {
    alert("Nouveau code envoyé (simulation)");
    setOtp(['', '', '', '', '', '']);          
    inputRefs.current[0]?.focus();             
  };

  const isComplete = otp.every(digit => digit !== '');

  return (
    <div className="auth-page-wrapper">
    <div className="login-container">
      <div className="login-box">
        <div className="Title">
          <div className="Logo">
            {/* Fixed image path for Vite/Public folder */}
            <img src='/security.png' height={40} alt="Logo" />
          </div>
          <p className="subtitle">Security Verification</p>
        </div>

        <form onSubmit={handleSubmit} className="otp-form">
          <p className="subtitleV">Enter the 6-digit code sent to your email</p>
          
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit} // Ensures the input displays what is in state
                ref={el => inputRefs.current[index] = el}
                onChange={e => handleChange(e, index)}
                onKeyDown={e => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className="otp-digit"
                inputMode="numeric"
              />
            ))}
          </div>

          <button
            type="submit" // Fixed trailing space
            className={`btn-verify ${isComplete ? 'active' : ''}`}
            disabled={!isComplete}
          >
            Verify
          </button>

          <div className="resend-section">
            <p>You haven't received the code?</p>
            <button type="button" className="resend-link" onClick={handleResend}>
              Resend code
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
}