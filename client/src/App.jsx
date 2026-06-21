import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { PaletteProvider } from './components/Palette.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Trees from './pages/Trees.jsx';
import NewBatch from './pages/NewBatch.jsx';
import Batches from './pages/Batches.jsx';
import BatchDetail from './pages/BatchDetail.jsx';
import Harvests from './pages/Harvests.jsx';
import Notifications from './pages/Notifications.jsx';
import Settings from './pages/Settings.jsx';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <PaletteProvider>
              <Layout />
            </PaletteProvider>
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="trees" element={<Trees />} />
        <Route path="batches" element={<Batches />} />
        <Route path="batches/new" element={<NewBatch />} />
        <Route path="batches/:id" element={<BatchDetail />} />
        <Route path="harvests" element={<Harvests />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
