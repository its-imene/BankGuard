import React from 'react';
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/otp");
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
          
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="text-left">
              <label className="block ml-1 mb-1 text-black text-xs" htmlFor="identifier">Email Address</label>
              <input
                className="w-full px-3.5 py-3 border border-[#2d3748] rounded-lg text-[#343a43] focus:outline-none focus:border-[#ff6b6b] focus:ring-4 focus:ring-[#ff6b6b]/40 transition-all"
                type="text" id="identifier" placeholder="name@bank-domaine.com" required
              />
            </div>

            <div className="text-left">
              <label className="block ml-1 mb-1 text-black text-xs" htmlFor="password">Password</label>
              <input
                className="w-full px-3.5 py-3 border border-[#2d3748] rounded-lg text-[#343a43] focus:outline-none focus:border-[#ff6b6b] focus:ring-4 focus:ring-[#ff6b6b]/40 transition-all"
                type="password" id="password" placeholder="••••••••" required
              />
            </div>

            <div className="flex justify-end -mt-2 -mb-2 text-[0.75rem]">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate("/forgot-password"); }} className="text-[#FF5925] hover:underline">
                Forgot password?
              </a>
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