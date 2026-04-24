// import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TicketProvider } from './context/TicketContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PassengerDashboard from './pages/passenger/PassengerDashboard';
import BookTicket from './pages/passenger/BookTicket';
import MyTickets from './pages/passenger/MyTickets';
import Profile from './pages/passenger/Profile';
import DriverDashboard from './pages/driver/DriverDashboard';
import ScanTicket from './pages/driver/ScanTicket';
import DriverProfile from './pages/driver/Profile';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TicketProvider>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Passenger Routes */}
              <Route path="/passenger/dashboard" element={<PassengerDashboard />} />
              <Route path="/passenger/book" element={<BookTicket />} />
              <Route path="/passenger/tickets" element={<MyTickets />} />
              <Route path="/passenger/profile" element={<Profile />} />
              
              {/* Driver Routes */}
              <Route path="/driver/dashboard" element={<DriverDashboard />} />
              <Route path="/driver/scan" element={<ScanTicket />} />
              <Route path="/driver/profile" element={<DriverProfile />} />
            </Routes>
          </Router>
        </TicketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
