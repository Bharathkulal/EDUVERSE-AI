const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
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
    if (['.csv', '.xlsx', '.xls'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files allowed'));
    }
  },
});

router.post('/upload', authenticate, authorizeAdmin, upload.single('dataset'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let mlInfo = { row_count: 0, columns: [] };
    try {
      const formData = new FormData();
      const fileBuffer = fs.readFileSync(req.file.path);
      const blob = new Blob([fileBuffer]);
      const mlResponse = await axios.post(
        `${process.env.ML_SERVICE_URL}/dataset/info`,
        { filepath: req.file.path },
        { timeout: 15000 }
      );
      mlInfo = mlResponse.data;
    } catch {
      const content = fs.readFileSync(req.file.path, 'utf8');
      const lines = content.trim().split('\n');
      mlInfo = {
        row_count: Math.max(0, lines.length - 1),
        columns: lines[0]?.split(',') || [],
      };
    }

    const result = await db.query(
      `INSERT INTO ml_datasets (filename, file_path, row_count, columns)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.file.originalname, req.file.path, mlInfo.row_count, JSON.stringify(mlInfo.columns)]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Upload failed' });
  }
});

router.get('/datasets', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM ml_datasets ORDER BY uploaded_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/models', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM ml_models ORDER BY trained_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/train', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const datasets = await db.query('SELECT * FROM ml_datasets ORDER BY uploaded_at DESC LIMIT 1');
    const datasetPath = datasets.rows[0]?.file_path;

    const mlResponse = await axios.post(
      `${process.env.ML_SERVICE_URL}/train`,
      { dataset_path: datasetPath, retrain: req.body.retrain || false },
      { timeout: 60000 }
    );

    const { linear_regression, kmeans } = mlResponse.data;

    if (linear_regression) {
      await db.query(
        `INSERT INTO ml_models (model_type, accuracy, dataset_size, model_path)
         VALUES ($1, $2, $3, $4)`,
        ['linear_regression', linear_regression.accuracy, linear_regression.dataset_size, linear_regression.model_path]
      );
    }

    if (kmeans) {
      await db.query(
        `INSERT INTO ml_models (model_type, accuracy, dataset_size, model_path)
         VALUES ($1, $2, $3, $4)`,
        ['kmeans', kmeans.accuracy || kmeans.silhouette, kmeans.dataset_size, kmeans.model_path]
      );
    }

    res.json(mlResponse.data);
  } catch (err) {
    console.error(err);
    const message = err.response?.data?.message || err.message || 'Training failed';
    res.status(500).json({ message, hint: 'Ensure ML service is running and dataset is uploaded' });
  }
});

router.get('/status', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const mlResponse = await axios.get(`${process.env.ML_SERVICE_URL}/status`, { timeout: 5000 });
    const models = await db.query('SELECT * FROM ml_models ORDER BY trained_at DESC LIMIT 2');
    const datasets = await db.query('SELECT COUNT(*) as count, SUM(row_count) as total_rows FROM ml_datasets');

    res.json({
      ml_service: mlResponse.data,
      saved_models: models.rows,
      datasets: datasets.rows[0],
    });
  } catch (err) {
    res.json({
      ml_service: { status: 'offline', message: 'ML service not reachable' },
      saved_models: [],
    });
  }
});

module.exports = router;
