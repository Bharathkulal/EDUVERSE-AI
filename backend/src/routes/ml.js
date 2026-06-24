const express = require('express');
const db = require('../config/db');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// 1. GET /api/ml/models - Retrieve trained models registry
router.get('/models', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM ml_models ORDER BY trained_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving trained models' });
  }
});

// 2. GET /api/ml/logs - Retrieve logs for a specific job or all logs
router.get('/logs', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { job_id } = req.query;
    let query = 'SELECT l.*, j.model_version FROM ml_training_logs l JOIN ml_training_jobs j ON l.job_id = j.id';
    const params = [];

    if (job_id) {
      query += ' WHERE l.job_id = $1';
      params.push(parseInt(job_id));
    }

    query += ' ORDER BY l.created_at ASC LIMIT 100';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving training logs' });
  }
});

// 3. GET /api/ml/jobs - List training jobs
router.get('/jobs', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM ml_training_jobs ORDER BY created_at DESC LIMIT 30');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving training jobs' });
  }
});

// 4. POST /api/ml/train - Start training a new model version
router.post('/train', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { model_type = 'student_performance', dataset_id } = req.body;

    // Get dataset size
    let datasetSize = 1200; // default simulation size
    if (dataset_id) {
      const datasetRes = await db.query('SELECT row_count FROM ml_datasets WHERE id = $1', [dataset_id]);
      if (datasetRes.rows.length > 0) {
        datasetSize = datasetRes.rows[0].row_count;
      }
    }

    const version = `edu-${model_type.substring(0, 3)}-v${Math.floor(Math.random() * 90) + 10}`;
    
    // Create new job
    const newJob = await db.query(
      `INSERT INTO ml_training_jobs (model_version, status, dataset_size, accuracy, loss, epochs) 
       VALUES ($1, 'Running', $2, 0.0, 1.0, 0) RETURNING *`,
      [version, datasetSize]
    );

    const jobId = newJob.rows[0].id;

    // Initial logs
    await db.query('INSERT INTO ml_training_logs (job_id, log_message) VALUES ($1, $2)', [jobId, `Initializing training job for model version ${version}...`]);
    await db.query('INSERT INTO ml_training_logs (job_id, log_message) VALUES ($1, $2)', [jobId, `Dataset rows detected: ${datasetSize}. Loading tensor batches...`]);

    // Start background simulation loop
    let epoch = 0;
    const interval = setInterval(async () => {
      epoch += 20;
      const accuracy = Math.min(0.98, 0.65 + (epoch / 100) * 0.31 + Math.random() * 0.02);
      const loss = Math.max(0.02, 0.45 - (epoch / 100) * 0.41 - Math.random() * 0.01);

      // Verify job is still running (hasn't been stopped)
      const currentJobRes = await db.query('SELECT status FROM ml_training_jobs WHERE id = $1', [jobId]);
      if (currentJobRes.rows.length === 0 || currentJobRes.rows[0].status !== 'Running') {
        clearInterval(interval);
        return;
      }

      await db.query(
        'INSERT INTO ml_training_logs (job_id, log_message) VALUES ($1, $2)',
        [jobId, `Epoch ${epoch}/100: Loss = ${loss.toFixed(4)}, Accuracy = ${accuracy.toFixed(4)}`]
      );

      if (epoch >= 100) {
        clearInterval(interval);
        
        // Mark job as completed
        await db.query(
          `UPDATE ml_training_jobs 
           SET status = 'Completed', accuracy = $1, loss = $2, epochs = 100 
           WHERE id = $3`,
          [accuracy.toFixed(4), loss.toFixed(4), jobId]
        );

        await db.query('INSERT INTO ml_training_logs (job_id, log_message) VALUES ($1, $2)', [jobId, 'Training finished successfully. Compiling model artifacts...']);
        await db.query('INSERT INTO ml_training_logs (job_id, log_message) VALUES ($1, $2)', [jobId, `Model artifact saved to models/${version}.bin. Registering model...`]);

        // Save to ml_models
        await db.query(
          `INSERT INTO ml_models (model_type, accuracy, dataset_size, model_path) 
           VALUES ($1, $2, $3, $4)`,
          [model_type, accuracy.toFixed(4), datasetSize, `models/${version}.bin`]
        );
      } else {
        await db.query(
          `UPDATE ml_training_jobs SET accuracy = $1, loss = $2, epochs = $3 WHERE id = $4`,
          [accuracy.toFixed(4), loss.toFixed(4), epoch, jobId]
        );
      }
    }, 3000);

    res.json({ message: 'ML Training job started successfully.', job: newJob.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error initiating ML training' });
  }
});

// 5. POST /api/ml/stop - Stop running training jobs
router.post('/stop', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { job_id } = req.body;

    if (job_id) {
      await db.query("UPDATE ml_training_jobs SET status = 'Stopped' WHERE id = $1 AND status = 'Running'", [job_id]);
      await db.query("INSERT INTO ml_training_logs (job_id, log_message) VALUES ($1, 'Training job manually stopped by administrator.')", [job_id]);
    } else {
      // Stop all running jobs
      const activeJobs = await db.query("SELECT id FROM ml_training_jobs WHERE status = 'Running'");
      for (const job of activeJobs.rows) {
        await db.query("UPDATE ml_training_jobs SET status = 'Stopped' WHERE id = $1", [job.id]);
        await db.query("INSERT INTO ml_training_logs (job_id, log_message) VALUES ($1, 'Training job manually stopped by administrator.')", [job.id]);
      }
    }

    res.json({ message: 'Active ML training runs stopped successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error stopping ML training runs' });
  }
});

module.exports = router;
