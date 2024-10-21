import React, { useState, useEffect } from 'react';
import { MessageSquare, ChevronDown } from 'lucide-react';

interface Message {
  product_name: string;
  device_name: string;
  message_id: string;
  payload: string;
  data_type?: string;
  timestamp?: string; // 保留timestamp,因为它可能在某些消息中存在
}

interface MessageListProps {
  apiUrl: string;
  defaultProductName: string;
}

interface ApiResponse {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ apiUrl, defaultProductName }) => {
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [productName, setProductName] = useState(defaultProductName);
  const [deviceName, setDeviceName] = useState('');
  const [messageId, setMessageId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const messagesPerPage = 10; // 每页显示的消息数量
  const [devices, setDevices] = useState<string[]>([]);

  useEffect(() => {
    fetchMessages();
  }, [productName]);

  useEffect(() => {
    if (allMessages.length > 0) {
      const uniqueDevices = Array.from(new Set(allMessages.map(msg => msg.device_name)));
      setDevices(uniqueDevices);
    }
  }, [allMessages]);

  useEffect(() => {
    filterMessages();
  }, [allMessages, deviceName, messageId]);

  const fetchMessages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let url = `${apiUrl}/messages/${productName}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ApiResponse = await response.json();
      
      if (Array.isArray(data.messages)) {
        setAllMessages(data.messages);
      } else {
        setAllMessages([]);
        console.error('Unexpected data format:', data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('加载消息失败，请稍后重试。');
    } finally {
      setIsLoading(false);
    }
  };

  const filterMessages = () => {
    let filtered = [...allMessages]; // 创建一个新数组以避免修改原始数据
    if (deviceName) {
      filtered = filtered.filter(msg => msg.device_name === deviceName);
    }
    if (messageId) {
      filtered = filtered.filter(msg => msg.message_id.includes(messageId));
    }
    // 对消息进行倒序排序
    filtered.sort((a, b) => {
      // 假设消息有 timestamp 字段，如果没有，可以使用 message_id 或其他合适的字段
      return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
    });
    setFilteredMessages(filtered);
    setTotalPages(Math.ceil(filtered.length / messagesPerPage));
    setPage(1); // 重置到第一页
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const paginatedMessages = filteredMessages.slice(
    (page - 1) * messagesPerPage,
    page * messagesPerPage
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">消息列表</h2>
      <div className="mb-4 grid grid-cols-3 gap-4">
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="产品名称"
          className="border rounded px-2 py-1"
        />
        <div className="relative">
          <select
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            className="appearance-none border rounded px-2 py-1 w-full"
          >
            <option value="">所有设备</option>
            {devices.map((device) => (
              <option key={device} value={device}>
                {device}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        </div>
        <input
          type="text"
          value={messageId}
          onChange={(e) => setMessageId(e.target.value)}
          placeholder="消息 ID"
          className="border rounded px-2 py-1"
        />
      </div>
      {isLoading && <p>正在加载消息...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!isLoading && !error && filteredMessages.length === 0 && <p>没有找到消息。</p>}
      {filteredMessages.length > 0 && (
        <>
          <ul className="space-y-4">
            {paginatedMessages.map((message) => (
              <li key={message.message_id} className="border-b pb-2">
                <div className="flex items-center mb-1">
                  <MessageSquare className="text-blue-500 mr-2" size={16} />
                  <span className="font-semibold">{message.device_name}</span>
                  <span className="text-gray-500 text-sm ml-2">
                    ID: {message.message_id}
                  </span>
                  {message.timestamp && (
                    <span className="text-gray-500 text-sm ml-2">
                      {new Date(message.timestamp).toLocaleString()}
                    </span>
                  )}
                  {message.data_type && (
                    <span className="text-gray-500 text-sm ml-2">
                      类型: {message.data_type}
                    </span>
                  )}
                </div>
                <p className="text-gray-700">{message.payload}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              上一页
            </button>
            <span>第 {page} 页，共 {totalPages} 页</span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              下一页
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MessageList;
