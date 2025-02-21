import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Homepage from "./components/logic/homepage";
import Dashboard from "./components/logic/Dashboard";
import PredictForm from "../PredictForm";
import Recent from "./components/logic/Recent";
import { UserProvider } from "./context/user/index.jsx";
import SignIn from "./components/logic/SignIn";

const RouteTitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const routeToTitle = {
      "/": "SafePayAI - Home",
      "/dashboard": "SafePayAI - Dashboard",
      "/send-money": "SafePayAI - Send Money",
      "/transactions": "SafePayAI - Transactions",
      "/statements": "SafePayAI - Statements",
      "/beneficiaries": "SafePayAI - Beneficiaries",
      "/settings": "SafePayAI - Settings",
      "/help-support": "SafePayAI - Help & Support",
    };

    const title = routeToTitle[location.pathname] || "SafePayAI";
    document.title = title;
  }, [location]);

  return null; // This component does not render anything
};
import RouteGuard from "./components/routeGuard";
import Complaint from "./components/logic/complain";
const App = () => {
  return (
    <UserProvider>
      <Router>
        <RouteTitleUpdater />
        <Routes>
          <Route path="/" element={<RouteGuard element={<Homepage />} />} />
          <Route
            path="/dashboard"
            element={<RouteGuard element={<Dashboard />} />}
          />
          <Route
            path="/send-money"
            element={
              <RouteGuard element={<RouteGuard element={<Homepage />} />} />
            }
          />
          <Route path="/transactions" element={<Recent />} />
          <Route
            path="/statements"
            element={<RouteGuard element={<Homepage />} />}
          />
          <Route path="/beneficiaries" element={<Homepage />} />
          {/* <Route path="/settings" element={<PredictForm />} /> */}
          <Route
            path="/help-support"
            element={<RouteGuard element={<Homepage />} />}
          />
          <Route
            path="/complaint"
            element={<RouteGuard element={<Complaint />} />}
          />
          <Route path="/auth" element={<RouteGuard element={<SignIn />} />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
