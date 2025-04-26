import React, { useState } from 'react';
import HeaderNav from './components/HeaderNav';
import Topology from './pages/Topology';

const App = () => {
  const [page, setPage] = useState('topology');

  return (
    <div className="min-h-screen bg-gray-100">
      <HeaderNav current={page} onNavigate={setPage} />
      <main className="max-w-7xl mx-auto px-4">
        {page === 'topology' && <Topology />}
        {page === 'block' && (
          <div className="p-8 text-xl text-gray-600">Block Traffic (Coming soon)</div>
        )}
        {page === 'alert' && (
          <div className="p-8 text-xl text-gray-600">Alert (Coming soon)</div>
        )}
      </main>
    </div>
  );
};

export default App;
