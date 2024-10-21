import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Server, Cpu, Wifi, Settings, AlertCircle } from 'lucide-react';
import DeviceList from './components/DeviceList';
import DeviceDetails from './components/DeviceDetails';
import Header from './components/Header';
import ApiSettings from './components/ApiSettings';
import MessageList from './components/MessageList';
import SensorMonitor from './components/SensorMonitor';

export interface Device {
  product_name: string;
  device_name: string;
  secret: string;
  device_status: {
    online: boolean;
  };
  last_status_update: number;
  status: string;
}

function App() {
  const [apiUrl, setApiUrl] = useState<string>(localStorage.getItem('apiUrl') || '');
  const [defaultProductName, setDefaultProductName] = useState<string>(localStorage.getItem('defaultProductName') || '');
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (apiUrl && defaultProductName) {
      fetchDevices();
    } else {
      setError('Please set up the API URL and default product name in the settings.');
    }
  }, [apiUrl, defaultProductName]);

  const fetchDevices = async () => {
    try {
      const response = await fetch(`${apiUrl}/devices/${defaultProductName}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDevices(data);
      setError(null);
    } catch (error) {
      console.error('获取设备列表时出错:', error);
      setError('获取设备失败。请检查您的API设置并重试。');
    }
  };

  const handleDeviceUpdate = async () => {
    await fetchDevices();
    if (selectedDevice) {
      const updatedDevice = devices.find(d => d.device_name === selectedDevice.device_name);
      setSelectedDevice(updatedDevice || null);
    }
  };

  const handleDeviceDelete = async () => {
    await fetchDevices();
    setSelectedDevice(null);
  };

  const renderContent = () => {
    if (error) {
      return (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <div className="flex items-center">
            <AlertCircle className="mr-2" />
            <p>{error}</p>
          </div>
          <Link to="/settings" className="text-red-700 underline mt-2 inline-block">
            Go to Settings
          </Link>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <DeviceList 
            devices={devices} 
            onSelectDevice={setSelectedDevice} 
            apiUrl={apiUrl}
            defaultProductName={defaultProductName}
            onDeviceCreated={fetchDevices}
          />
        </div>
        <div className="md:col-span-2">
          {selectedDevice ? (
            <DeviceDetails 
              device={selectedDevice} 
              apiUrl={apiUrl} 
              onDeviceUpdate={handleDeviceUpdate}
              onDeviceDelete={handleDeviceDelete}
            />
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">IoT Hub Overview</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Server className="text-blue-500 mr-2" />
                  <span>设备总数: {devices.length}</span>
                </div>
                <div className="flex items-center">
                  <Cpu className="text-green-500 mr-2" />
                  <span>已激活设备数量： {devices.filter(d => d.status === 'active').length}</span>
                </div>
                <div className="flex items-center">
                  <Wifi className="text-red-500 mr-2" />
                  <span>已禁止设备数量: {devices.filter(d => d.status === 'suspended').length}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={renderContent()} />
            <Route path="/settings" element={
              <ApiSettings 
                apiUrl={apiUrl} 
                setApiUrl={setApiUrl}
                defaultProductName={defaultProductName}
                setDefaultProductName={setDefaultProductName}
              />
            } />
            <Route path="/messages" element={<MessageList apiUrl={apiUrl} defaultProductName={defaultProductName} />} />
            <Route path="/sensors" element={<SensorMonitor apiUrl={apiUrl} defaultProductName={defaultProductName} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;