import { Router } from 'express';
import multer from 'multer';
import {
    addCollege,
    deleteCollege,
    getChartData,
    getCollegeCount,
    getPaymentReceived,
    getPlacedCandidates,
    getTotalCandidates,
    openFile,
    scrapeData,
    searchColleges,
    updateCollege,
    uploadFile,
} from '../controllers/college.controller.js';
import {
    getCourseCollege,
    getDistinctFiles,
    getHiringColleges,
    getHiringCollegesConsultant,
    getHrTeamChart,
    getLastFiveRows,
    getMarketingTeamChart,
    getTotalScraped,
} from '../controllers/dashboard.controller.js';
import {
    getHrChart,
    getTotalHired,
    getTotalStudents,
} from '../controllers/hr.controller.js';
import {
    getMarketingChart,
    getTotalColleges,
    getTotalPayment
} from '../controllers/marketing.controller.js';

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 1 }
});

// ✅ College Routes
router.post('/upload', upload.single('file'), uploadFile);
router.post('/scrape', scrapeData);
router.get('/open-file', openFile);
router.get('/search', searchColleges);
router.put('/update/:id', updateCollege);
router.delete('/delete/:id', deleteCollege);
router.get('/college-count', getCollegeCount);
router.get('/total-candidates', getTotalCandidates);
router.get('/placed-candidates', getPlacedCandidates);
router.get('/payment-received', getPaymentReceived);
router.get('/chart-data', getChartData);
router.post('/add-college', addCollege);

// ✅ Marketing Routes
router.get('/total-clg', getTotalColleges);
router.get('/total-payment', getTotalPayment);
router.get('/marketing-chart', getMarketingChart);

// ✅ HR Routes
router.get('/total-colleges', getTotalColleges);
router.get('/total-hired', getTotalHired);
router.get('/total-students', getTotalStudents);
router.get('/hr-chart', getHrChart);

// ✅ Dashboard Routes
router.get('/distinct', getDistinctFiles);
router.get('/hiring-clg', getHiringColleges);
router.get('/hiring-clg-consultant', getHiringCollegesConsultant);
router.get('/total-scraped', getTotalScraped);
router.get('/last-5-rows', getLastFiveRows);
router.get('/marketing-team-chart', getMarketingTeamChart);
router.get('/hr-team-chart', getHrTeamChart);
router.get('/course-college', getCourseCollege);

export default router;
