import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Profile from "./Profile";

import Messages from "./Messages";

import Achievements from "./Achievements";

import Onboarding from "./Onboarding";

import NonprofitDetails from "./NonprofitDetails";

import Volunteering from "./Volunteering";

import Donating from "./Donating";

import NonprofitsDirectory from "./NonprofitsDirectory";

import LandingPage from "./LandingPage";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Profile: Profile,
    
    Messages: Messages,
    
    Achievements: Achievements,
    
    Onboarding: Onboarding,
    
    NonprofitDetails: NonprofitDetails,
    
    Volunteering: Volunteering,
    
    Donating: Donating,
    
    NonprofitsDirectory: NonprofitsDirectory,
    
    LandingPage: LandingPage,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Messages" element={<Messages />} />
                
                <Route path="/Achievements" element={<Achievements />} />
                
                <Route path="/Onboarding" element={<Onboarding />} />
                
                <Route path="/NonprofitDetails" element={<NonprofitDetails />} />
                
                <Route path="/Volunteering" element={<Volunteering />} />
                
                <Route path="/Donating" element={<Donating />} />
                
                <Route path="/NonprofitsDirectory" element={<NonprofitsDirectory />} />
                
                <Route path="/LandingPage" element={<LandingPage />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}