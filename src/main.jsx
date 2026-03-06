import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Ensure Tailwind/Global CSS is loaded here
import { 
  createBrowserRouter, 
  RouterProvider, 
  Navigate 
} from "react-router-dom";

// Layout and Core App
import App from "./App";

// Your Pages - Double check these folder paths match your project!
import Blacklists from "./pages/blacklists/Blacklists"; 
import Entries from "./pages/entries/Entries";
import Archives from "./pages/Archives"; // Ensure this file exists
import Distribution from "./pages/distribution/Distribution";
import AuditLogs from "./pages/audit/Audit";
import Settings from "./pages/Settings";

// His Pages
import Login from './pages/auth/Login';
import Otp from './pages/auth/Otp';
import ForgotPassword from './pages/auth/ForgotPassword';

const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
const router = createBrowserRouter([
  // 1. CHANGE THIS: Now when someone hits "localhost:5173/", they go to LOGIN
  { 
    path: "/", 
    element: isAuthenticated ? <Navigate to="/app/blacklists" replace /> : <Navigate to="/login" replace />
  },

  // 2. PUBLIC ROUTES (No Sidebar/Navbar)
  { path: "/login", element: <Login /> },
  { path: "/otp", element: <Otp /> },
  { path: "/forgot-password", element: <ForgotPassword /> },

  // 3. PRIVATE ROUTES (Wrapped in your App layout)
  // We move your dashboard under the "/app" path
  {
    path: "/app",
    element: <App />, 
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

  // 4. CATCH-ALL: If they type a wrong URL, send them to login
  {
    path: "*",
    element: <Navigate to="/login" replace />
  }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);