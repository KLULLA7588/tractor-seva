import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import MainLayout from './components/layout/MainLayout';

import HomePage from './pages/public/HomePage';
import CatalogPage from './pages/public/CatalogPage';
import HarvesterDetailPage from './pages/public/HarvesterDetailPage';
import SubsectionsPage from './pages/public/SubsectionsPage';
import SubsectionDetailPage from './pages/public/SubsectionDetailPage';

import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import HarvestersPage from './pages/admin/HarvestersPage';
import SectionsPage from './pages/admin/SectionsPage';
import DiagramsPage from './pages/admin/DiagramsPage';
import PartsPage from './pages/admin/PartsPage';
import InquiriesPage from './pages/admin/InquiriesPage';
import SectionDetailPage from './pages/public/SectionDetailPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  return (
    <ProtectedRoute>
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  );
}

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/catalog" element={<PageTransition><CatalogPage /></PageTransition>} />
        <Route path="/harvester/:id" element={<PageTransition><HarvesterDetailPage /></PageTransition>} />
        <Route path="/harvester/:harvesterId/section/:sectionId" element={<PageTransition><SectionDetailPage /></PageTransition>} />
        <Route
          path="/harvester/:harvesterId/section/:sectionId/subsections"
          element={<PageTransition><SubsectionsPage /></PageTransition>}
        />
        <Route
          path="/harvester/:harvesterId/section/:sectionId/sub/:subId"
          element={<PageTransition><SubsectionDetailPage /></PageTransition>}
        />

        <Route path="/admin/login" element={<PageTransition><AdminLoginPage /></PageTransition>} />

        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/harvesters" element={<AdminRoute><HarvestersPage /></AdminRoute>} />
        <Route path="/admin/sections" element={<AdminRoute><SectionsPage /></AdminRoute>} />
        <Route path="/admin/diagrams" element={<AdminRoute><DiagramsPage /></AdminRoute>} />
        <Route path="/admin/parts" element={<AdminRoute><PartsPage /></AdminRoute>} />
        <Route path="/admin/inquiries" element={<AdminRoute><InquiriesPage /></AdminRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return <AnimatedRoutes />;
}
