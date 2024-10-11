import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  product_name: string;
  device_name: string;
  timestamp: string;
  content: string;
}

interface MessageListProps {
  apiUrl: string;
  defaultProductName: string;
}

const MessageList: React.FC<MessageListProps> = ({ apiUrl, defaultProductName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [productName, setProductName] = useState(defaultProductName);
  const [deviceName, setDeviceName] = useState('');
  const [messageId, setMessageId] = useState('');

  useEffect(() => {
    fetchMessages();
  }, [productName, deviceName, messageId]);

  const fetchMessages = async () => {
    try {
      let url = `${apiUrl}/messages/${productName}`;
      const params = new URLSearchParams();
      if (deviceName) params.append('device_name', deviceName);
      if (messageId) params.append('message_id', messageId);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Messages</h2>
      <div className="mb-4 grid grid-cols-3 gap-4">
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Product Name"
          className="border rounded px-2 py-1"
        />
        <input
          type="text"
          value={deviceName}
          onChange={(e) => setDeviceName(e.target.value)}
          placeholder="Device Name"
          className="border rounded px-2 py-1"
        />
        <input
          type="text"
          value={messageId}
          onChange={(e) => setMessageId(e.target.value)}
          placeholder="Message ID"
          className="border rounded px-2 py-1"
        />
      </div>
      <ul className="space-y-4">
        {messages.map((message) => (
          <li key={message.id} className="border-b pb-2">
            <div className="flex items-center mb-1">
              <MessageSquare className="text-blue-500 mr-2" size={16} />
              <span className="font-semibold">{message.device_name}</span>
              <span className="text-gray-500 text-sm ml-2">
                {new Date(message.timestamp).toLocaleString()}
              </span>
            </div>
            <p className="text-gray-700">{message.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MessageList;