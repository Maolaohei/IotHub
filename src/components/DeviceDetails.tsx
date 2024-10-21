import React, { useEffect } from 'react';
import { Cpu, Battery, Key, Trash2, Play, Pause, Clock, Lock, Unlock } from 'lucide-react';
import { Device } from '../App';

interface DeviceDetailsProps {
  device: Device;
  apiUrl: string;
  onDeviceUpdate: () => void;
  onDeviceDelete: () => void;
}

const DeviceDetails: React.FC<DeviceDetailsProps> = ({ device, apiUrl, onDeviceUpdate, onDeviceDelete }) => {
  const toggleDeviceStatus = async () => {
    const action = device.status === 'active' ? 'suspend' : 'resume';
    try {
      const response = await fetch(`${apiUrl}/devices/${device.product_name}/${device.device_name}/${action}`, {
        method: 'PUT',
      });
      if (response.ok) {
        await updateDeviceStatus(); // 立即更新设备状态
      } else {
        console.error('切换设备状态失败');
      }
    } catch (error) {
      console.error(`切换设备状态时出错:`, error);
    }
  };

  const deleteDevice = async () => {
    try {
      await fetch(`${apiUrl}/devices/${device.product_name}/${device.device_name}`, {
        method: 'DELETE',
      });
      onDeviceDelete();
      await updateDeviceStatus(); // 立即更新设备状态
    } catch (error) {
      console.error('删除设备时出错:', error);
    }
  };

  const updateDeviceStatus = async () => {
    try {
      const response = await fetch(`${apiUrl}/devices/${device.product_name}/${device.device_name}/status`, {
        method: 'PUT',
      });
      if (response.ok) {
        onDeviceUpdate(); // 在成功更新状态后调用更新
      } else {
        console.error('更新设备状态失败');
      }
    } catch (error) {
      console.error(`更新设备状态时出错:`, error);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      updateDeviceStatus();
    }, 5000); // 每5秒更新一次状态

    return () => clearInterval(intervalId); // 组件卸载时清除定时器
  }, [device.product_name, device.device_name]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">设备ID:{device.device_name}</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center">
          <Cpu className="text-blue-500 mr-2" size={20} />
          <span>激活状态: {device.status}</span>
        </div>
        <div className="flex items-center">
          <Battery className="text-green-500 mr-2" size={20} />
          <span>产品: {device.product_name}</span>
        </div>
        {device.secret && (
          <div className="col-span-2 flex items-center">
            <Key className="text-red-500 mr-2" size={20} />
            <span>密钥: {device.secret}</span>
          </div>
        )}
        <div className="col-span-2 flex items-center">
          <Clock className="text-purple-500 mr-2" size={20} />
          <span>最后状态更新: {new Date(device.last_status_update).toLocaleString()}</span>
        </div>
        <div className="col-span-2 flex items-center">
          <span>在线状态: {device.connected ? '在线' : '离线'}</span>
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <button
          onClick={updateDeviceStatus}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          更新状态
        </button>
        <button
          onClick={toggleDeviceStatus}
          className={`px-3 py-1 rounded ${
            device.status === 'active' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
          } text-white`}
        >
          {device.status === 'active' ? <Lock size={20} /> : <Unlock size={20} />}
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
