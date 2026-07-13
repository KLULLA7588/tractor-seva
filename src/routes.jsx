/**
 * Route definitions for reference.
 * Actual routing is handled in App.jsx using react-router-dom v6.
 * This file documents the route structure.
 */

export const routes = {
  public: [
    { path: '/', label: 'Home' },
    { path: '/catalog', label: 'Catalog' },
    { path: '/harvester/:id', label: 'Harvester Detail' },
    { path: '/harvester/:harvesterId/section/:sectionId/subsections', label: 'Subsections' },
    { path: '/harvester/:harvesterId/section/:sectionId/sub/:subId', label: 'Subsection Detail' },
    { path: '/harvester/:harvesterId/section/:sectionId', label: 'Section Detail' },
  ],
  admin: [
    { path: '/admin/login', label: 'Login', protected: false },
    { path: '/admin', label: 'Dashboard', protected: true },
    { path: '/admin/harvesters', label: 'Harvesters', protected: true },
    { path: '/admin/sections', label: 'Sections', protected: true },
    { path: '/admin/diagrams', label: 'Diagrams', protected: true },
    { path: '/admin/parts', label: 'Parts & Hotspots', protected: true },
    { path: '/admin/inquiries', label: 'Inquiries', protected: true },
  ],
};

export default routes;
