import React from 'react';
import { Link } from 'react-router-dom';
import { Cloud, MessageSquare, Thermometer, Settings } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <Cloud className="mr-2" size={24} />
          <h1 className="text-2xl font-bold">物联网中心管理</h1>
        </Link>
        <nav className="flex space-x-4">
          <Link to="/messages" className="flex items-center hover:underline">
            <MessageSquare className="mr-2" size={20} />
            <span>历史消息</span>
          </Link>
          <Link to="/sensors" className="flex items-center hover:underline">
            <Thermometer className="mr-2" size={20} />
            <span>传感器监控</span>
          </Link>
          <Link to="/settings" className="flex items-center hover:underline">
            <Settings className="mr-2" size={20} />
            <span>设置</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;