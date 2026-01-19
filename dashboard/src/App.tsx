import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import {
  Dashboard,
  NewResearch,
  Workflows,
  WorkflowDetail,
  Agents,
  Approvals,
  History,
  Settings,
  Login,
  Trash,
} from './pages';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="new" element={<NewResearch />} />
              <Route path="workflows" element={<Workflows />} />
              <Route path="workflow/:id" element={<WorkflowDetail />} />
              <Route path="agents" element={<Agents />} />
              <Route path="approvals" element={<Approvals />} />
              <Route path="history" element={<History />} />
              <Route path="trash" element={<Trash />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
