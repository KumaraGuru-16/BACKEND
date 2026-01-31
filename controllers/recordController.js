import Record from '../models/Record.js';
import { v4 as uuidv4 } from 'uuid'; // Use 'npm install uuid'

// @desc    Create a new record (Version 1)
// @access  EDITOR
export const createRecord = async (req, res) => {
  try {
    const { title, content } = req.body;
    
    // Generate a unique ID for this record lineage
    const recordId = uuidv4(); 

    const newRecord = await Record.create({
      recordId,
      title,
      content,
      version: 1, // Start at version 1 [cite: 27]
      createdBy: req.user.id
    });

    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update a record (Create NEW version)
// @access  EDITOR
export const updateRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const { title, content } = req.body;

    // 1. Find the current latest version of this record
    const latestRecord = await Record.findOne({ recordId }).sort({ version: -1 });

    if (!latestRecord) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // 2. Create a NEW document with version + 1 [cite: 12, 25]
    // We do not modify the old document, satisfying the Immutability Rule [cite: 36]
    const newVersion = await Record.create({
      recordId: latestRecord.recordId,
      title: title || latestRecord.title, // Allow partial updates
      content: content || latestRecord.content,
      version: latestRecord.version + 1,
      createdBy: req.user.id
    });

    res.status(201).json(newVersion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all records (Shows only the latest version of each)
// @access  EDITOR, VIEWER
export const getAllRecords = async (req, res) => {
  try {
    // Aggregation pipeline to group by recordId and pick the document with max version
    const records = await Record.aggregate([
      { $sort: { version: -1 } },
      {
        $group: {
          _id: "$recordId",
          title: { $first: "$title" },
          content: { $first: "$content" },
          version: { $first: "$version" },
          updatedAt: { $first: "$createdAt" }
        }
      }
    ]);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get history of a specific record
// @access  EDITOR, VIEWER
export const getRecordHistory = async (req, res) => {
  try {
    const { recordId } = req.params;

    // Fetch all versions sorted by version number (descending or ascending) [cite: 34]
    const history = await Record.find({ recordId }).sort({ version: -1 });

    if (!history.length) {
      return res.status(404).json({ message: 'Record history not found' });
    }

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};