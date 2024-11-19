import './App.css'
import InFavForm from './components/InFavForm'
import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SubmittedData from './components/SubmittedData';
import Login from "./components/Login.tsx";
import Register from "./components/Register.tsx";
import LinkedInCallback from "./components/LinkedInCallback.tsx";
import UserDashboard from './components/UserDashboard.tsx';
import Home from "./components/Home.tsx";

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/form" element={<InFavForm />} />
                <Route path="/submitted" element={<SubmittedData />} />
                <Route path="/linkedin/callback" element={<LinkedInCallback />} />
            </Routes>
        </Router>
    );
};

export default App
