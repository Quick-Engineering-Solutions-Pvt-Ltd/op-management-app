import React from 'react';

type SidebarProps = {
  isOpen: boolean;
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  return (
    <div className={`bg-white text-gray-800 h-screen transition-all duration-300 ${isOpen ? 'w-64 p-6' : 'w-0 p-0 overflow-hidden'} shadow-[5px_5px_15px_#d1d9e6,-5px_-5px_15px_#ffffff] rounded-r-lg`}>
      {isOpen && (
        <ul className="space-y-4">
          {[
            { name: 'Dashboard', icon: '🏠' },
            { name: 'Tasks', icon: '📋' },
            { name: 'Activity', icon: '📊' },
            { name: 'Users', icon: '👨🏻‍💻' },
            { name: 'Settings', icon: '⚙️' },
          ].map((item) => (
            <li key={item.name} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer flex items-center">
              <span className="mr-2">{item.icon}</span>
              <span>{item.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Sidebar;
