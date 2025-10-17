import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// ✅ Importar funções de teste globais (disponíveis no console)
import './utils/global-test-functions.ts';

createRoot(document.getElementById('root')!).render(<App />);
