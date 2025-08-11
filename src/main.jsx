import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// ألوان الشريط حسب الثيم
const DARK = '#0b0b0b';
const LIGHT = '#ffffff';

function setIOSBars(isDark) {
  // status bar (iOS PWA)
  let status = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (!status) {
    status = document.createElement('meta');
    status.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
    document.head.appendChild(status);
  }
  status.setAttribute('content', isDark ? 'black-translucent' : 'default');

  // theme-color (Safari/Android)
  let theme = document.querySelector('meta[name="theme-color"]');
  if (!theme) {
    theme = document.createElement('meta');
    theme.setAttribute('name', 'theme-color');
    document.head.appendChild(theme);
  }
  theme.setAttribute('content', isDark ? DARK : LIGHT);
}

// مزامنة أولية مع وضع الصفحة الحالي (.dark على <html>)
function syncBarsWithDOM() {
  const isDark = document.documentElement.classList.contains('dark');
  setIOSBars(isDark);
}

// استمع لتغيّر النظام نفسه
try {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener?.('change', e => setIOSBars(e.matches));
} catch (_) {}

// نادِ المزامنة وقت الإقلاع
syncBarsWithDOM();

// وفّر دالة عامة تستدعيها عند تبديل الثيم من داخل App.jsx
export function onThemeChanged(isDark) {
  // (اختياري) ثبّت كلاس .dark على <html> إن تحب تتحكم فيه من هنا
  document.documentElement.classList.toggle('dark', isDark);
  setIOSBars(isDark);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
