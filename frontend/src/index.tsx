import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'antd/dist/antd.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminLayout } from './layout/AdminLayout';
import { DashboardPage } from './pages/admin/DashboardPage';
import { SmartLocksPage } from './pages/admin/SmartLocksPage';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { store } from './state/Store'
import { AccountsPage } from './pages/admin/AccountsPage';
import { IntegrationsPage } from './pages/admin/IntegrationsPage';
import { ConfigurationsPage } from './pages/admin/ConfigurationsPage';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path='/admin' element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path='accounts' element={<AccountsPage />} />
            <Route path='locks' element={<SmartLocksPage />} />
            <Route path='integrations' element={<IntegrationsPage />} />
            <Route path='configuration' element={<ConfigurationsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
