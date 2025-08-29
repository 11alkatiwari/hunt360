import express from 'express';
import multer from 'multer';
import {
    getPreviousScrapes,
    scrapeProfiles,
    uploadFile,
    cleanDuplicates,
    getDataStats,
    searchCompanies,
    searchProfiles,
    saveSingleEdit,
    saveFinalProfile,
    deleteProfile,
    getDashboard,
    getAnalytics,
    getReports,
    addProfile,
} from '../controllers/linkedin.controller.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/previous-scrapes', getPreviousScrapes);
router.post('/scrape', scrapeProfiles);

router.post('/upload', upload.single('file'), uploadFile);

router.delete('/clean-duplicates', cleanDuplicates);
router.get('/data-stats', getDataStats);

router.get('/search-companies', searchCompanies);
router.get('/search-profiles', searchProfiles);

router.post('/save-single-edit', saveSingleEdit);
router.post('/save-final-profile', saveFinalProfile);

router.delete('/delete/:id', deleteProfile);

router.get('/dashboard', getDashboard);
router.get('/analytics', getAnalytics);

router.post('/reports', getReports);
router.post('/add-profile', addProfile);

// ✅ Welcome endpoint with request logging
router.get('/welcome', (req, res) => {
  const { method, originalUrl, headers, ip } = req;
  
  // Log request metadata
  console.log('📋 Request received:', {
    timestamp: new Date().toISOString(),
    method,
    path: originalUrl,
    ip,
    userAgent: headers['user-agent'],
    contentType: headers['content-type']
  });

  res.json({
    message: 'Welcome to the LinkedIn API Service!',
    timestamp: new Date().toISOString(),
    requestInfo: {
      method,
      path: originalUrl,
      ip,
      userAgent: headers['user-agent']
    }
  });
});

export default router;
