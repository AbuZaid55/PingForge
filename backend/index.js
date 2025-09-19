require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cron = require("node-cron");
const axios = require("axios");
const cors = require("cors");
let uuidv4;

(async () => {
  const uuid = await import("uuid");
  uuidv4 = uuid.v4;
})();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const PORT = process.env.PORT || 4000;

const app = express();
app.use(
  cors({
    origin: [FRONTEND_URL],
    credentials: true,
  })
);
app.use(bodyParser.json());

let jobs = {}; // { id: {id, url, interval, task, running, password} }

function sanitizeJob(job) {
  return {
    id: job.id,
    url: job.url,
    interval: job.interval,
    running: job.running,
  };
}

// Helper: find job by URL
function findJobByUrl(url) {
  return Object.values(jobs).find((job) => job.url === url);
}

// ✅ Add/Replace job with per-URL password
app.post("/schedule", (req, res) => {
  try {
    const { url, interval, password } = req.body;

    if (!url || !interval || !password) {
      return res.status(400).json({ message: "URL, interval and password required" });
    }

    // If job with this URL exists → remove it
    const existingJob = findJobByUrl(url);
    if (existingJob) {
      existingJob.task.stop();
      delete jobs[existingJob.id];
    }

    const id = uuidv4();
    const cronExp = `*/${interval} * * * *`;

    const task = cron.schedule(cronExp, async () => {
      try {
        const response = await axios.get(url);
        console.log(`[SUCCESS] ${url} -> ${response.status}`);
      } catch (error) {
        console.log(`[ERROR] ${url} -> ${error.message}`);
      }
    });

    jobs[id] = { id, url, interval, task, running: true, password };

    // ✅ Only return safe data
    res.json({ id, url, interval, running: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get all jobs (don’t expose password in response!)
app.get("/jobs", (req, res) => {
  try {
    const sanitizedJobs = Object.values(jobs).map(sanitizeJob);
    res.json(sanitizedJobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Stop job
app.post("/stop/:id", (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(403).json({ message: "Enter Password" });

    const job = jobs[req.params.id];
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (password !== job.password) return res.status(403).json({ message: "Unauthorized" });

    job.task.stop();
    job.running = false;

    res.json({
      message: "Job stopped",
      job: sanitizeJob(job),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Start job
app.post("/start/:id", (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(403).json({ message: "Enter Password" });

    const job = jobs[req.params.id];
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (password !== job.password) return res.status(403).json({ message: "Unauthorized" });

    job.task.start();
    job.running = true;

    res.json({
      message: "Job started",
      job: sanitizeJob(job),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Remove job
app.delete("/remove/:id", (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(403).json({ message: "Enter Password" });

    const job = jobs[req.params.id];
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (password !== job.password) return res.status(403).json({ message: "Unauthorized" });

    // Stop cron task before deleting
    job.task.stop();

    // Remove from jobs list
    delete jobs[req.params.id];

    res.json({ message: "Job removed", id: req.params.id });
  } catch (error) { 
    res.status(500).json({ message: error.message });
  }
});

app.get("/test",(req,res)=>{
  res.status(200).json({success:true,message:"Server is running..."})
})

app.all(/.*/, (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found}`,
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
