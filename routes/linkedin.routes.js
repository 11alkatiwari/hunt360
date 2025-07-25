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

export default router;