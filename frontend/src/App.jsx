import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WebSocketProvider } from './context/WebSocketContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import AppLayout from './components/layout/AppLayout';
import Workspace from './pages/Workspace';
import Documents from './pages/Documents';
import KnowledgeBase from './pages/KnowledgeBase';
import Models from './pages/Models';
import Tools from './pages/Tools';
import Tasks from './pages/Tasks';
import AuditLogs from './pages/AuditLogs';
import Security from './pages/Security';
import Settings from './pages/Settings';

export const App = () => {
  return (
    <BrowserRouter>
      <WebSocketProvider>
        <WorkspaceProvider>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Workspace />} />
              <Route path="workspace" element={<Workspace />} />
              <Route path="documents" element={<Documents />} />
              <Route path="knowledge-base" element={<KnowledgeBase />} />
              <Route path="models" element={<Models />} />
              <Route path="tools" element={<Tools />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="security" element={<Security />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </WorkspaceProvider>
      </WebSocketProvider>
    </BrowserRouter>
  );
};

export default App;
