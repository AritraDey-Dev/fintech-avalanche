import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Homepage from "./components/logic/homepage";
import Dashboard from "./components/logic/Dashboard";
import Recent from "./components/logic/Recent";
import { UserProvider } from "./context/user/index.jsx";
import SignIn from "./components/logic/SignIn";
import Statement from "./components/logic/statement";

import ComplaintsHistory from "./components/logic/complaintView";
const RouteTitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const routeToTitle = {
      "/": "SafeUPI - Dashboard",
      "/dashboard": "SafeUPI - Dashboard",
      "/send-money": "SafeUPI - Send Money",
      "/transactions": "SafeUPI - Transactions",
      "/statements": "SafeUPI - Statements",
      "/complaints-history": "SafeUPI - Complaints History",
      "/complaint": "SafeUPI - Complaint",
    };

    const title = routeToTitle[location.pathname] || "SafeUPI";
    document.title = title;
  }, [location]);

  return null;
};
import RouteGuard from "./components/routeGuard";
import Complaint from "./components/logic/complain";
const App = () => {
  return (
    <UserProvider>
      <Router>
        <RouteTitleUpdater />
        <Routes>
          <Route path="/" element={<RouteGuard element={<Dashboard />} />} />
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
            element={<RouteGuard element={<Statement />} />}
          />
          <Route
            path="/complaint"
            element={<RouteGuard element={<Complaint />} />}
          />
          <Route
            path="/complaints-history"
            element={<RouteGuard element={<ComplaintsHistory />} />}
          />
          <Route path="/auth" element={<RouteGuard element={<SignIn />} />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
