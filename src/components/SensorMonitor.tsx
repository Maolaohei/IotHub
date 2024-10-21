import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Wifi, WifiOff, Play, Pause, Settings, X, Sun, Palette } from 'lucide-react';
import axios from 'axios';

interface SensorMonitorProps {
  apiUrl: string;
  defaultProductName: string;
}

interface SensorData {
  deviceId: string;
  lastMessage: string;
  isOnline: boolean;
  commandStatus: string | null;
  deviceStatus: '启动' | '停止' | '离线';  // 将 '继续' 改为 '启动'
  lastUpdateTime: string | null;
}

interface DeviceData {
  product_name: string;
  device_name: string;
  secret: string;
  device_status: Record<string, unknown>;
  last_status_update: number;
  connected: boolean;
  status: string;
}

interface MessageItem {
  data_type: string;
  device_name: string;
  message_id: string;
  payload: string;
  product_name: string;
}

interface MessageResponse {
  messages: MessageItem[];
}

const SensorMonitor: React.FC<SensorMonitorProps> = ({ apiUrl, defaultProductName }) => {
  const [sensorsData, setSensorsData] = useState<SensorData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [customCommand, setCustomCommand] = useState('');
  const [customData, setCustomData] = useState('');
  const [presetCommand, setPresetCommand] = useState<'setColor' | 'setBrightness' | null>(null);
  const [colorValue, setColorValue] = useState('#000000');
  const [brightnessValue, setBrightnessValue] = useState(1);

  const fetchSensorsData = useCallback(async () => {
    try {
      // 获取指定产品的所有设备列表
      const devicesResponse = await fetch(`${apiUrl}/devices/${defaultProductName}`);
      if (!devicesResponse.ok) {
        throw new Error(`获取设备列表失败: ${devicesResponse.status} ${devicesResponse.statusText}`);
      }
      const devicesData: DeviceData[] = await devicesResponse.json();
      console.log('设备数据:', devicesData);

      const currentTime = new Date().toLocaleString('zh-CN');

      const data = await Promise.all(devicesData.map(async (device) => {
        try {
          // 获取特定设备的消息
          const messagesResponse = await fetch(`${apiUrl}/messages/${defaultProductName}/${device.device_name}`);
          if (!messagesResponse.ok) {
            throw new Error(`获取设备 ${device.device_name} 的消息失败: ${messagesResponse.status} ${messagesResponse.statusText}`);
          }
          const messageData = await messagesResponse.json();
          console.log(`设备 ${device.device_name} 的原始消息数据:`, messageData);

          let lastMessage = '无数据';
          if (messageData && messageData.message) {
            const message = messageData.message;
            if (message.data_type === "temperature" && message.payload) {
              try {
                const tempData = JSON.parse(message.payload);
                if (tempData.temperature) {
                  lastMessage = `temperature:${tempData.temperature}`;
                } else {
                  lastMessage = message.payload;
                }
              } catch (e) {
                lastMessage = message.payload;
              }
            } else {
              lastMessage = message.payload;
            }
          }

          console.log(`设备 ${device.device_name} 的处理后消息:`, lastMessage);

          return {
            deviceId: device.device_name,
            lastMessage,
            isOnline: device.connected,
            deviceStatus: device.connected ? '启动' : '离线',  // 将 '继续' 改为 '启动'
            lastUpdateTime: device.connected ? currentTime : null,
            commandStatus: null
          };
        } catch (err) {
          console.error(`获取设备 ${device.device_name} 数据时出错:`, err);
          return {
            deviceId: device.device_name,
            lastMessage: '获取失败',
            isOnline: device.connected,
            deviceStatus: device.connected ? '启动' : '离线',  // 将 '继续' 改为 '启动'
            lastUpdateTime: device.connected ? currentTime : null,
            commandStatus: null
          };
        }
      }));

      // 更新状态，保留现有的设备状态
      setSensorsData((prevData) => {
        return data.map(newSensor => {
          const existingSensor = prevData.find(s => s.deviceId === newSensor.deviceId);
          return {
            ...newSensor,
            deviceStatus: newSensor.isOnline ? 
              (existingSensor ? existingSensor.deviceStatus : '启动') : 
              '离线',
            lastUpdateTime: newSensor.isOnline ? newSensor.lastUpdateTime : null  // 确保离线设备的最后更新时间为 null
          };
        });
      });

      setError(null);
    } catch (err) {
      console.error('获取传感器数据时出错:', err);
      setError(`获取传感器数据时出错: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, defaultProductName]);

  useEffect(() => {
    fetchSensorsData();
    const intervalId = setInterval(fetchSensorsData, 5000); // 每5秒更新一次

    return () => clearInterval(intervalId);
  }, [fetchSensorsData]);

  const sendCommand = async (deviceName: string, command: '启动' | '停止') => {
    // 更新状态以显示正在发送命令
    setSensorsData(prevData => prevData.map(sensor => 
      sensor.deviceId === deviceName ? { ...sensor, commandStatus: '正在发送命令...', deviceStatus: command } : sensor
    ));

    const MAX_RETRIES = 3;
    const RETRY_DELAY = 2000; // 2秒

    const sendRequest = async (retries = 0) => {
      try {
        // 修改 URL 构造
        const url = `${apiUrl}/devices/${defaultProductName}/${deviceName}/command`;
        const formData = {
          command: "ping",
          data: command,
          encoding: "plain",
          ttl: "10"
        };

        console.log('发送请求：', url, formData);

        const response = await axios.post(url, formData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('命令发送成功:', response.data);
        return response.data;
      } catch (error) {
        console.error('发送命令时出错:', error);
        if (error.response) {
          console.error('响应状态码:', error.response.status);
          console.error('响应头:', JSON.stringify(error.response.headers, null, 2));
          console.error('响应体:', JSON.stringify(error.response.data, null, 2));
        }
        if (retries < MAX_RETRIES) {
          console.log(`${retries + 1}秒后重试...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return sendRequest(retries + 1);
        } else {
          throw new Error('达到最大重试次数，放弃重试。');
        }
      }
    };

    try {
      const result = await sendRequest();
      console.log(`命令 ${command} 已发送到设备 ${deviceName}，请求ID: ${result.request_id}`);
      // 更新状态以显示命令发送成功
      setSensorsData(prevData => prevData.map(sensor => 
        sensor.deviceId === deviceName ? { ...sensor, commandStatus: '命令发送成功', deviceStatus: command } : sensor
      ));
      // 立即刷新数据
      await fetchSensorsData();
      // 3秒后清除命令状态
      setTimeout(() => {
        setSensorsData(prevData => prevData.map(sensor => 
          sensor.deviceId === deviceName ? { ...sensor, commandStatus: null } : sensor
        ));
      }, 3000);
    } catch (err) {
      console.error(`发送命令到设备 ${deviceName} 时出错:`, err);
      // 更新状态以显示命令发送失败
      setSensorsData(prevData => prevData.map(sensor => 
        sensor.deviceId === deviceName ? { ...sensor, commandStatus: '命令发送失败' } : sensor
      ));
      // 3秒后清除命令状态
      setTimeout(() => {
        setSensorsData(prevData => prevData.map(sensor => 
          sensor.deviceId === deviceName ? { ...sensor, commandStatus: null } : sensor
        ));
      }, 3000);
    }
  };

  const sendCustomCommand = async (deviceName: string) => {
    // 更新状态以显示正在发送命令
    setSensorsData(prevData => prevData.map(sensor => 
      sensor.deviceId === deviceName ? { ...sensor, commandStatus: '正在发送自定义命令...' } : sensor
    ));

    try {
      const url = `${apiUrl}/devices/${defaultProductName}/${deviceName}/command`;
      const formData = {
        command: customCommand,
        data: customData,
        encoding: "plain",
        ttl: "10"
      };

      console.log('发送自定义命令请求：', url, formData);

      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('自定义命令发送成功:', response.data);
      setSensorsData(prevData => prevData.map(sensor => 
        sensor.deviceId === deviceName ? { ...sensor, commandStatus: '自定义命令发送成功' } : sensor
      ));
      await fetchSensorsData();
      setTimeout(() => {
        setSensorsData(prevData => prevData.map(sensor => 
          sensor.deviceId === deviceName ? { ...sensor, commandStatus: null } : sensor
        ));
      }, 3000);
    } catch (err) {
      console.error(`发送自定义命令到设备 ${deviceName} 时出错:`, err);
      setSensorsData(prevData => prevData.map(sensor => 
        sensor.deviceId === deviceName ? { ...sensor, commandStatus: '自定义命令发送失败' } : sensor
      ));
      setTimeout(() => {
        setSensorsData(prevData => prevData.map(sensor => 
          sensor.deviceId === deviceName ? { ...sensor, commandStatus: null } : sensor
        ));
      }, 3000);
    }
  };

  const sendPresetCommand = async (deviceName: string) => {
    let command = '';
    let data = '';

    if (presetCommand === 'setColor') {
      command = 'setColor';
      data = colorValue;
    } else if (presetCommand === 'setBrightness') {
      command = 'setBrightness';
      data = brightnessValue.toString();
    }

    setSensorsData(prevData => prevData.map(sensor => 
      sensor.deviceId === deviceName ? { ...sensor, commandStatus: '正在发送预设命令...' } : sensor
    ));

    try {
      const url = `${apiUrl}/devices/${defaultProductName}/${deviceName}/command`;
      const formData = {
        command,
        data,
        encoding: "plain",
        ttl: "10"
      };

      console.log('发送预设命令请求：', url, formData);

      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('预设命令发送成功:', response.data);
      setSensorsData(prevData => prevData.map(sensor => 
        sensor.deviceId === deviceName ? { ...sensor, commandStatus: '预设命令发送成功' } : sensor
      ));
      await fetchSensorsData();
      setTimeout(() => {
        setSensorsData(prevData => prevData.map(sensor => 
          sensor.deviceId === deviceName ? { ...sensor, commandStatus: null } : sensor
        ));
      }, 3000);
    } catch (err) {
      console.error(`发送预设命令到设备 ${deviceName} 时出错:`, err);
      setSensorsData(prevData => prevData.map(sensor => 
        sensor.deviceId === deviceName ? { ...sensor, commandStatus: '预设命令发送失败' } : sensor
      ));
      setTimeout(() => {
        setSensorsData(prevData => prevData.map(sensor => 
          sensor.deviceId === deviceName ? { ...sensor, commandStatus: null } : sensor
        ));
      }, 3000);
    }
  };

  if (isLoading) {
    return <div>正在加载传感器数据...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (sensorsData.length === 0) {
    return <div>没有找到任何设备数据</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sensorsData.map((sensor) => (
          <div key={sensor.deviceId} className="bg-white p-4 rounded-lg shadow-md transition-all duration-300 ease-in-out">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">设备ID: {sensor.deviceId}</h3>
              {sensor.isOnline ? (
                <Wifi className="text-green-500" size={20} />
              ) : (
                <WifiOff className="text-red-500" size={20} />
              )}
            </div>
            <div className="flex items-center mb-2">
              <MessageSquare className="text-blue-500 mr-2" size={16} />
              <p className="text-sm text-gray-600 truncate">
                最新数据：
                {sensor.lastMessage === '无数据' ? '无数据' : 
                 sensor.lastMessage === '获取失败' ? '获取失败' : 
                 sensor.lastMessage.startsWith('temperature:') ? 
                 `${sensor.lastMessage.split(':')[1]}°C` : 
                 sensor.lastMessage}
              </p>
            </div>
            <div className="text-sm text-gray-500 mb-2">
              最后更新时间：{sensor.lastUpdateTime || '未知'}
            </div>
            <div className="text-sm font-semibold mb-2">
              设备状态：
              <span className={
                sensor.deviceStatus === '启动' ? 'text-green-500' : 
                sensor.deviceStatus === '停止' ? 'text-red-500' : 
                'text-gray-500'
              }>
                {sensor.deviceStatus}
              </span>
            </div>
            {sensor.isOnline ? (
              <div className="flex flex-col mt-2">
                <div className="flex justify-around mb-2">
                  <button
                    onClick={() => sendCommand(sensor.deviceId, '启动')}
                    className="bg-green-500 text-white px-3 py-1 rounded-md flex items-center"
                  >
                    <Play size={16} className="mr-1" />
                    启动
                  </button>
                  <button
                    onClick={() => sendCommand(sensor.deviceId, '停止')}
                    className="bg-yellow-500 text-white px-3 py-1 rounded-md flex items-center"
                  >
                    <Pause size={16} className="mr-1" />
                    停止
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDevice(sensor.deviceId);
                      setIsModalOpen(true);
                    }}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md flex items-center"
                  >
                    <Settings size={16} className="mr-1" />
                    更多命令
                  </button>
                </div>
                {sensor.commandStatus && (
                  <div className={`text-center text-sm ${
                    sensor.commandStatus === '命令发送成功' ? 'text-green-500' : 
                    sensor.commandStatus === '命令发送失败' ? 'text-red-500' : 
                    'text-blue-500'
                  }`}>
                    {sensor.commandStatus}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500 mt-2">
                设备离线，无法发送命令
              </div>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">发送命令</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold mb-2">预设命令：</h3>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => setPresetCommand('setColor')}
                  className="bg-purple-500 text-white px-4 py-2 rounded-md flex items-center justify-center"
                >
                  <Palette size={16} className="mr-2" />
                  设置颜色
                </button>
                <button
                  onClick={() => setPresetCommand('setBrightness')}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-md flex items-center justify-center"
                >
                  <Sun size={16} className="mr-2" />
                  设置亮度
                </button>
              </div>
            </div>
            {presetCommand === 'setColor' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">选择颜色：</label>
                <input
                  type="color"
                  value={colorValue}
                  onChange={(e) => setColorValue(e.target.value)}
                  className="mt-1 block w-full"
                />
              </div>
            )}
            {presetCommand === 'setBrightness' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">设置亮度（1-3）：</label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="1"
                  value={brightnessValue}
                  onChange={(e) => setBrightnessValue(parseInt(e.target.value))}
                  className="mt-1 block w-full"
                />
                <span className="text-sm text-gray-500">当前值：{brightnessValue}</span>
              </div>
            )}
            {presetCommand && (
              <button
                onClick={() => {
                  if (selectedDevice) {
                    sendPresetCommand(selectedDevice);
                    setIsModalOpen(false);
                  }
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-md w-full mb-4"
              >
                发送预设命令
              </button>
            )}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">自定义命令：</h3>
              <input
                type="text"
                placeholder="命令"
                value={customCommand}
                onChange={(e) => setCustomCommand(e.target.value)}
                className="w-full p-2 mb-2 border rounded"
              />
              <input
                type="text"
                placeholder="数据"
                value={customData}
                onChange={(e) => setCustomData(e.target.value)}
                className="w-full p-2 mb-4 border rounded"
              />
              <button
                onClick={() => {
                  if (selectedDevice) {
                    sendCustomCommand(selectedDevice);
                    setIsModalOpen(false);
                  }
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-md w-full"
              >
                发送自定义命令
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SensorMonitor;
