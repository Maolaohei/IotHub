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
  const [error, setError] = useState<string | null>(null);

  const createDevice = async () => {
    try {
      const response = await fetch(`${apiUrl}/devices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_name: defaultProductName }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const newDevice = await response.json();
      
      // 激活新创建的设备
      const activateResponse = await fetch(`${apiUrl}/devices/${newDevice.product_name}/${newDevice.device_name}/resume`, {
        method: 'PUT',
      });
      if (!activateResponse.ok) {
        console.warn('激活新设备失败，但设备已创建');
      }

      onSelectDevice(newDevice);
      setError(null);
      onDeviceCreated();
    } catch (error) {
      console.error('创建设备时出错:', error);
      setError('创建设备失败。请重试。');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">设备列表</h2>
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <div className="flex items-center">
            <AlertCircle className="mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}
      <div className="mb-4">
        <button
          onClick={createDevice}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
        >
          <Plus size={20} className="mr-2" />
          注册设备
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
              {device.connected ? (
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
