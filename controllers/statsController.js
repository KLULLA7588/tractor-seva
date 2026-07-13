/**
 * Stats controller.
 * Dashboard statistics for the admin panel.
 */
import pool from '../config/database.js';

/**
 * GET /api/admin/stats
 * Get aggregate dashboard statistics.
 */
export async function getStats(req, res, next) {
  try {
    const [[harvesterCount]] = await pool.query('SELECT COUNT(*) as count FROM harvesters');
    const [[mainSectionCount]] = await pool.query('SELECT COUNT(*) as count FROM sections WHERE parent_id IS NULL');
    const [[subsectionCount]] = await pool.query('SELECT COUNT(*) as count FROM sections WHERE parent_id IS NOT NULL');
    const [[diagramCount]] = await pool.query('SELECT COUNT(*) as count FROM images');
    const [[partCount]] = await pool.query('SELECT COUNT(*) as count FROM parts');
    const [[inquiryCount]] = await pool.query('SELECT COUNT(*) as count FROM inquiries');

    const [statusRows] = await pool.query(
      'SELECT status, COUNT(*) as count FROM inquiries GROUP BY status'
    );

    const inquiriesByStatus = {};
    for (const row of statusRows) {
      inquiriesByStatus[row.status] = row.count;
    }

    res.json({
      success: true,
      stats: {
        total_harvesters: harvesterCount.count,
        total_main_sections: mainSectionCount.count,
        total_subsections: subsectionCount.count,
        total_diagrams: diagramCount.count,
        total_parts: partCount.count,
        total_inquiries: inquiryCount.count,
        inquiries_by_status: inquiriesByStatus,
      },
    });
  } catch (err) {
    next(err);
  }
}
