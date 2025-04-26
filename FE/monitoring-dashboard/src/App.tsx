import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HeaderNav from './components/HeaderNav';
import Topology from './pages/Topology';
import SwitchDetail from './pages/SwitchDetail';

const App = () => {
  const [page, setPage] = useState('topology');

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <HeaderNav current={page} onNavigate={setPage} />
        <main className="max-w-7xl mx-auto px-4">
          <Routes>
            <Route path="/" element={<Topology />} />
            <Route path="/switch/:id" element={<SwitchDetail />} />
            <Route path="/block" element={<div className="p-8 text-xl text-gray-600">Block Traffic (Coming soon)</div>} />
            <Route path="/alert" element={<div className="p-8 text-xl text-gray-600">Alert (Coming soon)</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
