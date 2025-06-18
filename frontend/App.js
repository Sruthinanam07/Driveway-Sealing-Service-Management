import React from 'react'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Register from './components/Register'
import SignIn from './components/Signin'
import Dashboard from './components/dashboard'
import DavidSmithDashboard from './components/Davidsmith'
import RespondQuote from './components/respond'
import WorkOrders from './components/workorder'
import ChatBox from './components/Chatbox'
import Bills from './components/Bills'
import RevenueReport from './components/Revenuereport'
import DifficultClients from './components/DifficultClients'
import ThisMonthQuotes from './components/Acceptedquotes'
import ProspectiveClients from './components/Prospective'
import './App.css'



function App() {
  return (
    <Router>
      <Routes>
            <Route  path='/register'element={<Register />} />
            <Route path= '/signin' element={<SignIn />} />
            <Route path= '/dashboard' element={<Dashboard />} />
            <Route path= '/Davidsmith' element={<DavidSmithDashboard />} />
            <Route path= '/respond' element={<RespondQuote />} />
            <Route path='/workorder' element={<WorkOrders />} />
            <Route path='/Bills' element={<Bills />} />
            <Route path='/Chatbox' element={<ChatBox />} />
            <Route path='/DifficultClients' element={<DifficultClients />} />
            <Route path='/Acceptedquotes' element={<ThisMonthQuotes />} />
            <Route path='/Prospective' element={<ProspectiveClients />} />
            <Route path='/Revenuereport' element={<RevenueReport />} />
      </Routes>
    </Router>
  );
}

export default App;