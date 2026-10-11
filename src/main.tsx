import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent unwanted iOS Safari pinch zoom and gesture zoom triggers
if (typeof window !== 'undefined') {
  document.addEventListener(
    'gesturestart',
    (e) => {
      e.preventDefault();
    },
    { passive: false }
  );
  document.addEventListener(
    'gesturechange',
    (e) => {
      e.preventDefault();
    },
    { passive: false }
  );
}

createRoot(document.getElementById('root')!).render(<App />);
