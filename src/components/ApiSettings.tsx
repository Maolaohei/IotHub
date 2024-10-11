import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ApiSettingsProps {
  apiUrl: string;
  setApiUrl: (url: string) => void;
  defaultProductName: string;
  setDefaultProductName: (name: string) => void;
}

const ApiSettings: React.FC<ApiSettingsProps> = ({ 
  apiUrl, 
  setApiUrl, 
  defaultProductName, 
  setDefaultProductName 
}) => {
  const [tempApiUrl, setTempApiUrl] = useState(apiUrl);
  const [tempProductName, setTempProductName] = useState(defaultProductName);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApiUrl(tempApiUrl);
    setDefaultProductName(tempProductName);
    localStorage.setItem('apiUrl', tempApiUrl);
    localStorage.setItem('defaultProductName', tempProductName);
    navigate('/');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">API Settings</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700">
            API URL
          </label>
          <input
            type="text"
            id="apiUrl"
            value={tempApiUrl}
            onChange={(e) => setTempApiUrl(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="https://api.example.com"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="productName" className="block text-sm font-medium text-gray-700">
            Default Product Name
          </label>
          <input
            type="text"
            id="productName"
            value={tempProductName}
            onChange={(e) => setTempProductName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter default product name"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default ApiSettings;