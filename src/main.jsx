import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import App from "./App";
import Blacklists from "./pages/blacklists/Blacklists"; 
import Users from "./pages/users/Users";
import Archives from "./pages/archives/Archives";
import Distribution from "./pages/distribution/Distribution";
import AuditLogs from "./pages/audit/Audit";
import Settings from "./pages/Settings";
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ConfirmAccount from './pages/auth/ConfirmAccount';
import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/layout/ProtectedRoute";

const router = createBrowserRouter([
  { 
    path: "/", 
    element: <Navigate to="/app/blacklists" replace /> 
  },
  { path: "/login", element: <Login /> },
  { path: "/confirm-account", element: <ConfirmAccount /> },
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
     
      { path: "archives", element: <Archives /> },
      { path: "distribution", element: <Distribution /> },
      { path: "logs", element: <AuditLogs /> },
       { path: "users", element: <Users /> },
      { path: "settings", element: <Settings /> },
    ],
  },
  { path: "*", element: <Navigate to="/login" replace /> }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);