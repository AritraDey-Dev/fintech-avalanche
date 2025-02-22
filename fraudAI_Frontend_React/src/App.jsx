import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Homepage from './components/logic/homepage';
import Dashboard from './components/logic/Dashboard';
import PredictForm from '../PredictForm'
import Recent from './components/logic/Recent'
import Complain from './components/logic/complain'
import ComplaintsHistory from './components/logic/complaintView';
const RouteTitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const routeToTitle = {
      '/': 'SafePayAI - Home',
      '/dashboard': 'SafePayAI - Dashboard',
      '/send-money': 'SafePayAI - Send Money',
      '/transactions': 'SafePayAI - Transactions',
      '/statements': 'SafePayAI - Statements',
      '/beneficiaries': 'SafePayAI - Beneficiaries',
      '/settings': 'SafePayAI - Settings',
      '/help-support': 'SafePayAI - Help & Support',
    };

    const title = routeToTitle[location.pathname] || 'SafePayAI';
    document.title = title;
  }, [location]);

  return null; // This component does not render anything
};

const App = () => {
  return (
    <Router>
      <RouteTitleUpdater />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/send-money" element={<Homepage />} />
        <Route path="/transactions" element={<Recent />} />
        <Route path="/statements" element={<Homepage />} />
        <Route path="/beneficiaries" element={<Homepage />} />
        <Route path="/settings" element={<PredictForm />} />
        <Route path="/help-support" element={<ComplaintsHistory />} />
        <Route path="/complaint" element={<Complain />} /> 
      </Routes>
    </Router>
    
  );
};

export default App;
