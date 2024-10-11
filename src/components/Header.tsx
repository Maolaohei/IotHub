import React from 'react';
import { Link } from 'react-router-dom';
import { Cloud, MessageSquare } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <Cloud className="mr-2" size={24} />
          <h1 className="text-2xl font-bold">IoT Hub Management</h1>
        </Link>
        <nav>
          <Link to="/messages" className="flex items-center hover:underline">
            <MessageSquare className="mr-2" size={20} />
            <span>Messages</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;