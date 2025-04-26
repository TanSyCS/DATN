import React from 'react';

type HeaderNavProps = {
  current: string;
  onNavigate: (page: string) => void;
};

const NAVS = [
  { key: 'topology', label: 'Network Topology' },
  { key: 'block', label: 'Block Traffic' },
  { key: 'alert', label: 'Alert' },
];

const HeaderNav: React.FC<HeaderNavProps> = ({ current, onNavigate }) => (
  <nav className="bg-white shadow mb-6">
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex h-16 items-center justify-between">
        <div className="flex space-x-4">
          {NAVS.map((nav) => (
            <button
              key={nav.key}
              className={`px-4 py-2 rounded font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors duration-150
                ${current === nav.key ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'}`}
              aria-current={current === nav.key ? 'page' : undefined}
              aria-label={nav.label}
              tabIndex={0}
              onClick={() => onNavigate(nav.key)}
              onKeyDown={(e) => e.key === 'Enter' && onNavigate(nav.key)}
            >
              {nav.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  </nav>
);

export default HeaderNav; 