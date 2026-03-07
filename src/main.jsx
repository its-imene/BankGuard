import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import App from "./App";
import Blacklists from "./pages/blacklists/Blacklists"; 
import Entries from "./pages/entries/Entries";
import Archives from "./pages/Archives";
import Distribution from "./pages/distribution/Distribution";
import AuditLogs from "./pages/audit/Audit";
import Settings from "./pages/Settings";
import Login from './pages/auth/Login';
import Otp from './pages/auth/Otp';
import ForgotPassword from './pages/auth/ForgotPassword';

// 🛡️ The Gatekeeper: This checks login status on every single navigation
const ProtectedRoute = ({ children }) => {
  // Switch from localStorage to sessionStorage
  const auth = sessionStorage.getItem("isAuthenticated") === "true";
  return auth ? children : <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
  { 
    path: "/", 
    element: <Navigate to="/app/blacklists" replace /> 
  },
  { path: "/login", element: <Login /> },
  { path: "/otp", element: <Otp /> },
  { path: "/forgot-password", element: <ForgotPassword /> },

  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ), 
    children: [
      { index: true, element: <Navigate to="blacklists" replace /> },
      { path: "blacklists", element: <Blacklists /> },
      { path: "entries", element: <Entries /> },
      { path: "archives", element: <Archives /> },
      { path: "distribution", element: <Distribution /> },
      { path: "logs", element: <AuditLogs /> },
      { path: "settings", element: <Settings /> },
    ],
  },
  { path: "*", element: <Navigate to="/login" replace /> }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);