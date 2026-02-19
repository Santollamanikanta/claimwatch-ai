
import React from 'react';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

interface HeaderProps {
    onLogoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={onLogoClick}
          >
            <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-800">ClaimWatch AI</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-600 hover:text-blue-600 font-medium">Dashboard</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 font-medium">Reports</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 font-medium">Alerts</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 font-medium">Settings</a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
