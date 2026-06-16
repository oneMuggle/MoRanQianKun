import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/styles/tailwind.css';
import './src/styles/mobileDevice.css';
// NSFW 模块注册移至 App.tsx 内 useEffect，按 gameConfig 异步激活
import App from '@/App';
import { bindBrowserErrorMonitor } from '@/utils/browserErrorMonitor';

// 启动期挂载全局错误监控（早于 ReactDOM.createRoot，捕获启动期错误）
bindBrowserErrorMonitor();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
