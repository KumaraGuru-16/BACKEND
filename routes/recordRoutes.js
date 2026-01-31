import express from 'express';
import { 
  createRecord, 
  updateRecord, 
  getAllRecords, 
  getRecordHistory 
} from '../controllers/recordController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public/Common Routes (Protected by Login)
router.get('/', protect, authorize('EDITOR', 'VIEWER'), getAllRecords); 
router.get('/:recordId/history', protect, authorize('EDITOR', 'VIEWER'), getRecordHistory);

// Editor Only Routes [cite: 24, 37]
router.post('/', protect, authorize('EDITOR'), createRecord);
router.put('/:recordId', protect, authorize('EDITOR'), updateRecord); 

export default router;