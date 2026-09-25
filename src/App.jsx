import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Common/Navbar';
import Footer from './components/Common/Footer';
import Landing from './pages/Landing';
import CreateCard from './pages/CreateCard';
import ShareEnvelope from './pages/ShareEnvelope';
import ViewCard from './pages/ViewCard';

// MainLayout provides the global header/footer structure
function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">{children}</div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page (uses cozy main navbar and footer layout) */}
        <Route
          path="/"
          element={
            <MainLayout>
              <Landing />
            </MainLayout>
          }
        />
        
        {/* Immersive studio & receiver pages */}
        <Route path="/create" element={<CreateCard />} />
        <Route path="/share" element={<ShareEnvelope />} />
        <Route path="/share/:id" element={<ShareEnvelope />} />
        <Route path="/view" element={<ViewCard />} />
        <Route path="/view/:id" element={<ViewCard />} />
      </Routes>
    </Router>
  );
}

export default App;
