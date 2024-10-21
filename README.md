# 物联网中心管理系统

## 项目概述

物联网中心管理系统是一个功能强大的Web应用程序，旨在简化物联网设备的管理和监控过程。该系统提供了直观的用户界面，使用户能够轻松地管理设备、监控实时数据、查看历史消息，以及控制设备状态。

## 主要功能

1. **设备管理**
   - 查看所有已注册设备的列表
   - 添加新设备到系统
   - 删除现有设备
   - 更新设备信息和状态

2. **实时状态监控**
   - 监控设备的在线/离线状态
   - 实时更新设备连接状态
   - 显示最后状态更新时间

3. **消息历史**
   - 查看设备发送的历史消息
   - 按时间顺序显示消息
   - 支持消息内容的详细查看

4. **传感器监控**
   - 实时显示传感器数据（如温度）
   - 支持启动/停止设备操作
   - 显示设备命令执行状态

5. **API 设置**
   - 配置API URL
   - 设置默认产品名称
   - 保存设置到本地存储

## 技术栈

- **前端框架**：React 18
- **路由**：React Router 6
- **状态管理**：React Hooks (useState, useEffect, useCallback)
- **UI 组件**：自定义React组件
- **图标**：Lucide React
- **样式**：Tailwind CSS
- **HTTP 请求**：Fetch API 和 Axios
- **构建工具**：Create React App

## 项目结构

```
src/
├── components/
│   ├── ApiSettings.tsx
│   ├── DeviceDetails.tsx
│   ├── DeviceList.tsx
│   ├── Header.tsx
│   ├── MessageList.tsx
│   └── SensorMonitor.tsx
├── App.tsx
├── index.tsx
└── index.css
```

## 安装和运行

1. 确保您的系统已安装 Node.js (推荐版本 14.0.0 或更高)

2. 克隆仓库：
   ```
   git clone https://github.com/maolaohei/iot-hub-management.git
   ```

3. 进入项目目录：
   ```
   cd iot-hub-management
   ```

4. 安装依赖：
   ```
   npm install
   ```

5. 运行开发服务器：
   ```
   npm start
   ```

6. 在浏览器中打开 http://localhost:3000 查看应用

## 配置说明

1. 首次运行应用时，请点击导航栏中的"设置"选项。
2. 在设置页面中，输入有效的API URL和默认产品名称。
3. 点击"保存"按钮。这些设置将保存在浏览器的本地存储中。
4. 返回主页，系统将使用这些设置来获取和显示数据。

## API 要求

本应用需要与特定的后端API进行交互。API应提供以下端点：

- `GET /devices/{productName}`: 获取指定产品的所有设备列表
- `POST /devices`: 创建新设备
- `DELETE /devices/{productName}/{deviceName}`: 删除指定设备
- `PUT /devices/{productName}/{deviceName}/{action}`: 更新设备状态（激活/暂停）
- `GET /messages/{productName}/{deviceName}`: 获取指定设备的消息历史
- `POST /devices/{productName}/{deviceName}/command`: 向设备发送命令



