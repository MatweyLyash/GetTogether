import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme/theme';
import App from './App';
import './index.scss';

// Service Worker регистрируется только по требованию при включении push уведомлений
// Это избегает ошибок SSL сертификата при автоматической регистрации

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);

