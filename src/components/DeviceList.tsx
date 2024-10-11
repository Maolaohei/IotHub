import React, { useState } from 'react';
import { Wifi, WifiOff, Plus, AlertCircle } from 'lucide-react';
import { Device } from '../App';

interface DeviceListProps {
  devices: Device[];
  onSelectDevice: (device: Device) => void;
  apiUrl: string;
  defaultProductName: string;
  onDeviceCreated: () => void;
}

const DeviceList: React.FC<DeviceListProps> = ({ devices, onSelectDevice, apiUrl, defaultProductName, onDeviceCreated }) => {
  const [newDeviceName, setNewDeviceName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const createDevice = async () => {
    try {
      const response = await fetch(`${apiUrl}/devices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_name: defaultProductName, device_name: newDeviceName }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const newDevice = await response.json();
      onSelectDevice(newDevice);
      setNewDeviceName('');
      setError(null);
      onDeviceCreated();
    } catch (error) {
      console.error('Error creating device:', error);
      setError('Failed to create device. Please try again.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Devices</h2>
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <div className="flex items-center">
            <AlertCircle className="mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}
      <div className="mb-4 flex">
        <input
          type="text"
          value={newDeviceName}
          onChange={(e) => setNewDeviceName(e.target.value)}
          placeholder="Enter device name"
          className="flex-grow border rounded-l px-2 py-1"
        />
        <button
          onClick={createDevice}
          className="bg-blue-500 text-white px-3 py-1 rounded-r hover:bg-blue-600"
        >
          <Plus size={20} />
        </button>
      </div>
      <ul className="space-y-2">
        {devices.map((device) => (
          <li
            key={`${device.product_name}-${device.device_name}`}
            className="flex items-center justify-between p-2 hover:bg-gray-100 rounded cursor-pointer"
            onClick={() => onSelectDevice(device)}
          >
            <span className="flex items-center">
              {device.status === 'active' ? (
                <Wifi className="text-green-500 mr-2" size={16} />
              ) : (
                <WifiOff className="text-red-500 mr-2" size={16} />
              )}
              {device.device_name}
            </span>
            <span className="text-sm text-gray-500">{device.product_name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DeviceList;