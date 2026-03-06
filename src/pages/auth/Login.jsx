import React from 'react';
import { useNavigate } from "react-router-dom";
import "./auth.css"
function Login() {
  const navigate = useNavigate();
  const handleSubmit = (e) => {
  e.preventDefault();

  navigate("/otp");
};
  return (
    <div className='auth-page-wrapper'>
    <div className="login-container">
      
      <div className="login-box">
        
        <div className="Title">
          <div className="Logo">
            <img src='public/security.png' height={40}></img>
          </div>
          <p className="subtitle">Bank Security System</p>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          
          <div className="form-group" >
            <label htmlFor="identifier">Email Adress</label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              placeholder="name@bank-domaine.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="extra-links">
            <a href="#" onClick={(e) => {
              e.preventDefault();           // empêche le rechargement
              navigate("/forgot-password"); // navigation
            }}
            >Forgot password?</a>
          </div>

          <button type="submit" className="btn-login">Login</button>

        </form>

      </div>
    </div>
    </div>
  );
}

export default Login;