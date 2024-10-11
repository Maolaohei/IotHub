import React from 'react';
import { Cpu, Battery, Thermometer, Trash2, Play, Pause } from 'lucide-react';
import { Device } from '../App';

interface DeviceDetailsProps {
  device: Device;
  apiUrl: string;
}

const DeviceDetails: React.FC<DeviceDetailsProps> = ({ device, apiUrl }) => {
  const toggleDeviceStatus = async () => {
    const action = device.status === 'active' ? 'suspend' : 'resume';
    try {
      await fetch(`${apiUrl}/devices/${device.product_name}/${device.device_name}/${action}`, {
        method: 'PUT',
      });
      // Refresh device data here
    } catch (error) {
      console.error(`Error ${action}ing device:`, error);
    }
  };

  const deleteDevice = async () => {
    try {
      await fetch(`${apiUrl}/devices/${device.product_name}/${device.device_name}`, {
        method: 'DELETE',
      });
      // Handle device deletion (e.g., remove from list, show message)
    } catch (error) {
      console.error('Error deleting device:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">{device.device_name}</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center">
          <Cpu className="text-blue-500 mr-2" size={20} />
          <span>Status: {device.status}</span>
        </div>
        <div className="flex items-center">
          <Battery className="text-green-500 mr-2" size={20} />
          <span>Product: {device.product_name}</span>
        </div>
        {device.secret && (
          <div className="col-span-2 flex items-center">
            <Thermometer className="text-red-500 mr-2" size={20} />
            <span>Secret: {device.secret}</span>
          </div>
        )}
      </div>
      <div className="flex justify-end space-x-2">
        <button
          onClick={toggleDeviceStatus}
          className={`px-3 py-1 rounded ${
            device.status === 'active' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
          } text-white`}
        >
          {device.status === 'active' ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button
          onClick={deleteDevice}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default DeviceDetails;