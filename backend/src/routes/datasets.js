const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

const uploadDir = path.join(__dirname, '../../uploads/datasets');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.csv', '.json'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and JSON files are allowed'));
    }
  },
});

// Helper: Parse CSV rows
function parseCSV(content, limit = 100) {
  const lines = content.trim().split('\n');
  if (lines.length === 0) return { columns: [], rows: [] };
  const columns = lines[0].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
  const rows = [];
  for (let i = 1; i < Math.min(lines.length, limit + 1); i++) {
    if (!lines[i]) continue;
    const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
    const rowObj = {};
    columns.forEach((col, idx) => {
      rowObj[col] = values[idx] || '';
    });
    rows.push(rowObj);
  }
  return { columns, rows, totalRows: lines.length - 1 };
}

// 1. GET /api/datasets - List all datasets and their version history
router.get('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const datasetsRes = await db.query('SELECT * FROM ml_datasets ORDER BY uploaded_at DESC');
    const datasets = datasetsRes.rows;

    const enriched = await Promise.all(datasets.map(async (dataset) => {
      const versions = await db.query(
        'SELECT * FROM dataset_versions WHERE dataset_id = $1 ORDER BY version_number DESC',
        [dataset.id]
      );
      return {
        ...dataset,
        versions: versions.rows
      };
    }));

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving datasets' });
  }
});

// 2. POST /api/datasets - Upload and validate new dataset (increments version if duplicate filename)
router.post('/', authenticate, authorizeAdmin, upload.single('dataset'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filepath = req.file.path;
    const originalName = req.file.originalname;
    const ext = path.extname(originalName).toLowerCase();
    const content = fs.readFileSync(filepath, 'utf8');

    let rowCount = 0;
    let columns = [];

    if (ext === '.csv') {
      const parsed = parseCSV(content, 5);
      rowCount = parsed.totalRows;
      columns = parsed.columns;
    } else if (ext === '.json') {
      try {
        const jsonData = JSON.parse(content);
        if (Array.isArray(jsonData)) {
          rowCount = jsonData.length;
          columns = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
        } else {
          return res.status(400).json({ message: 'JSON dataset must be an array of objects' });
        }
      } catch (err) {
        return res.status(400).json({ message: 'Invalid JSON format' });
      }
    }

    // Check if dataset exists for versioning
    const existingRes = await db.query('SELECT id, filename FROM ml_datasets WHERE filename = $1', [originalName]);
    let datasetId;
    let version = 1;

    if (existingRes.rows.length > 0) {
      datasetId = existingRes.rows[0].id;
      // Fetch latest version number
      const lastVersionRes = await db.query(
        'SELECT COALESCE(MAX(version_number), 1) as last_v FROM dataset_versions WHERE dataset_id = $1',
        [datasetId]
      );
      version = lastVersionRes.rows[0].last_v + 1;

      // Update main table
      await db.query(
        'UPDATE ml_datasets SET file_path = $1, row_count = $2, columns = $3 WHERE id = $4',
        [filepath, rowCount, JSON.stringify(columns), datasetId]
      );
    } else {
      // Create new dataset record
      const result = await db.query(
        `INSERT INTO ml_datasets (filename, file_path, row_count, columns)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [originalName, filepath, rowCount, JSON.stringify(columns)]
      );
      datasetId = result.rows[0].id;
    }

    // Save version history record
    await db.query(
      `INSERT INTO dataset_versions (dataset_id, version_number, filename, file_path, row_count)
       VALUES ($1, $2, $3, $4, $5)`,
      [datasetId, version, originalName, filepath, rowCount]
    );

    res.status(201).json({
      message: 'Dataset uploaded successfully',
      datasetId,
      filename: originalName,
      version,
      rowCount,
      columns
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Dataset upload failed' });
  }
});

// 3. GET /api/datasets/:id/preview - Get preview rows (first 15 rows)
router.get('/:id/preview', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const datasetRes = await db.query('SELECT * FROM ml_datasets WHERE id = $1', [req.params.id]);
    if (datasetRes.rows.length === 0) {
      return res.status(404).json({ message: 'Dataset not found' });
    }

    const { file_path, filename } = datasetRes.rows[0];
    if (!fs.existsSync(file_path)) {
      return res.status(404).json({ message: 'Physical file not found on server storage' });
    }

    const content = fs.readFileSync(file_path, 'utf8');
    const ext = path.extname(filename).toLowerCase();

    let previewRows = [];
    if (ext === '.csv') {
      const parsed = parseCSV(content, 15);
      previewRows = parsed.rows;
    } else if (ext === '.json') {
      const jsonData = JSON.parse(content);
      previewRows = jsonData.slice(0, 15);
    }

    res.json({
      filename,
      rows: previewRows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error previewing dataset content' });
  }
});

// 4. GET /api/datasets/:id/stats - Get dataset columns statistics
router.get('/:id/stats', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const datasetRes = await db.query('SELECT * FROM ml_datasets WHERE id = $1', [req.params.id]);
    if (datasetRes.rows.length === 0) {
      return res.status(404).json({ message: 'Dataset not found' });
    }

    const { file_path, filename } = datasetRes.rows[0];
    if (!fs.existsSync(file_path)) {
      return res.status(404).json({ message: 'Physical file not found on server storage' });
    }

    const content = fs.readFileSync(file_path, 'utf8');
    const ext = path.extname(filename).toLowerCase();

    let allRows = [];
    if (ext === '.csv') {
      allRows = parseCSV(content, 1000).rows; // parse up to 1000 rows for stats calculations
    } else if (ext === '.json') {
      allRows = JSON.parse(content);
    }

    const stats = {};
    if (allRows.length > 0) {
      const columns = Object.keys(allRows[0]);
      columns.forEach(col => {
        const values = allRows.map(r => r[col]).filter(v => v !== undefined && v !== '');
        const numericValues = values.map(Number).filter(v => !isNaN(v));

        if (numericValues.length > 0 && numericValues.length === values.length) {
          // Numeric column stats
          const min = Math.min(...numericValues);
          const max = Math.max(...numericValues);
          const sum = numericValues.reduce((a, b) => a + b, 0);
          const mean = sum / numericValues.length;
          stats[col] = {
            type: 'Numeric',
            count: numericValues.length,
            min,
            max,
            mean: parseFloat(mean.toFixed(2))
          };
        } else {
          // Categorical column stats (value frequencies)
          const frequencies = {};
          values.forEach(val => {
            frequencies[val] = (frequencies[val] || 0) + 1;
          });
          // Sort by count
          const topValues = Object.entries(frequencies)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([val, count]) => ({ value: val, count }));

          stats[col] = {
            type: 'Categorical',
            uniqueCount: Object.keys(frequencies).length,
            topValues
          };
        }
      });
    }

    res.json({
      filename,
      rowCount: allRows.length,
      stats
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generating dataset statistics' });
  }
});

// 5. DELETE /api/datasets/:id - Delete a dataset and its physical file
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const datasetRes = await db.query('SELECT * FROM ml_datasets WHERE id = $1', [req.params.id]);
    if (datasetRes.rows.length === 0) {
      return res.status(404).json({ message: 'Dataset not found' });
    }

    const { file_path } = datasetRes.rows[0];
    if (fs.existsSync(file_path)) {
      fs.unlinkSync(file_path);
    }

    await db.query('DELETE FROM ml_datasets WHERE id = $1', [req.params.id]);
    res.json({ message: 'Dataset and all its versions deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting dataset' });
  }
});

module.exports = router;
