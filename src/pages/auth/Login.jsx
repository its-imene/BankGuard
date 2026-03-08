import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { UserRound, Lock, AlertCircle } from 'lucide-react';

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  
  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = { email: '', password: '' };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = "Please enter your email address";
      isValid = false;
    }
    if (!password.trim()) {
      newErrors.password = "Please enter your password";
      isValid = false;
    }

    setErrors(newErrors);
    setTouched({ email: true, password: true });

    if (isValid) {
      navigate("/otp");
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const getInputClasses = (field, hasError) => {
    const baseClasses = "w-full pl-10 pr-4 py-3 border rounded-lg text-[#343a43] transition-all duration-200 focus:outline-none";
    
    if (hasError && touched[field]) {
      return `${baseClasses} border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/30 bg-red-50/50`;
    }
    return `${baseClasses} border-[#2d3748] focus:border-[#ff6b6b] focus:ring-4 focus:ring-[#ff6b6b]/40`;
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#011530] font-semibold">
      <div className="w-105 p-2.5">
        <div className="bg-white rounded-xl shadow-2xl px-8 py-10 text-center">
          
          <div className="flex flex-col items-center mb-2">
            <div className="w-17.5 h-17.5 bg-[#011530] rounded-full flex justify-center items-center mb-3">
              <img src='/security.png' className="w-10 h-10 object-contain" alt="Logo" />
            </div>
            <p className="text-[#011530] text-2xl mb-6">Bank Security System</p>
          </div>
          
          <form className="flex flex-col gap-0" onSubmit={handleSubmit}>
            <div className="text-left">
              <label className="block ml-1 mb-1 text-black text-base" htmlFor="identifier">Email Address</label>
              <div className="relative">
                <UserRound 
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                    errors.email && touched.email ? 'text-red-500' : 'text-gray-500'
                  }`}
                  size={20} 
                />
                <input
                  className={getInputClasses('email', !!errors.email)}
                  type="email" 
                  id="identifier" 
                  placeholder="name@bank-domaine.com" 
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => handleBlur('email')}
                />
                {errors.email && touched.email && (
                  <AlertCircle 
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-red-500"
                    size={20} 
                  />
                )}
              </div>
              <div className="min-h-[1.25rem] mt-1 ml-1 flex items-center gap-1">
                {errors.email && touched.email && (
                  <>
                    <div className="w-1 h-1 rounded-full bg-red-500 mr-1"></div>
                    <p className="text-red-500 text-sm text-xs">{errors.email}</p>
                  </>
                )}
              </div>
            </div>

            <div className="text-left">
              <label className="block ml-1 mb-1 text-black text-base" htmlFor="password">Password</label>
              <div className="relative">
                <Lock 
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                    errors.password && touched.password ? 'text-red-500' : 'text-gray-500'
                  }`}
                  size={20} 
                />
                <input
                  className={getInputClasses('password', !!errors.password)}
                  type="password" 
                  id="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => handleBlur('password')}
                />
                {errors.password && touched.password && (
                  <AlertCircle 
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-red-500"
                    size={20} 
                  />
                )}
              </div>
              <div className="min-h-[1.5rem] mt-1 ml-1 flex items-center justify-between mb-6">
                <div className="flex items-center gap-1">
                  {errors.password && touched.password && (
                    <>
                      <div className="w-1 h-1 rounded-full bg-red-500 mr-1"></div>
                      <p className="text-red-500 text-sm text-xs">{errors.password}</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button type="submit" className="bg-[#ff5925] text-white py-3.5 px-6 rounded-lg text-[1.05rem] font-bold cursor-pointer transition-all hover:bg-[#e04e1e] hover:-translate-y-0.5 shadow-lg shadow-[#fd6f44]/35">
              Login
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

export default Login;