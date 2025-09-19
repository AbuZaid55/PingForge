"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Head from "next/head";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export default function PingForge() {
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({
    url: "",
    interval: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API_BASE}/jobs`);
      setJobs(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setMessage("Failed to fetch jobs");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await axios.post(`${API_BASE}/schedule`, formData);
      setMessage("✅ Job scheduled successfully!");
      setFormData({ url: "", interval: "", password: "" });
      fetchJobs();
    } catch (error) {
      console.error("Error scheduling job:", error);
      setMessage(error.response?.data?.message || "❌ Failed to schedule job");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleJob = async (id, action, password) => {
    try {
      await axios.post(`${API_BASE}/${action}/${id}`, { password });
      setMessage(`✅ Job ${action}ed successfully!`);
      fetchJobs();
    } catch (error) {
      console.error(`Error ${action}ing job:`, error);
      setMessage(error.response?.data?.message || `❌ Failed to ${action} job`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemove = async (id, password) => {
    setLoading(true);
    setMessage("");

    try {
      await axios.delete(`${API_BASE}/remove/${id}`, {
        data: { password },
      });

      setMessage("🗑️ Job removed successfully!");
      fetchJobs();
    } catch (error) {
      console.error("Error removing job:", error);
      setMessage(error.response?.data.message || "❌ Failed to remove job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>PingForge</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <div className="min-h-screen bg-gray-950 text-gray-100 font-sans py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Branding Header */}
          <div className="text-center mb-16">
            <h1 className="text-6xl font-extrabold text-white tracking-tight drop-shadow-lg">⚡ PingForge</h1>
            <p className="mt-4 text-xl text-gray-400 font-medium max-w-2xl mx-auto">Forge reliable uptime with automated HTTP pings & monitoring.</p>
          </div>

          {/* Alerts */}
          {message && (
            <div
              className={`mb-10 p-5 rounded-xl border-2 transition-all duration-500 ease-in-out transform ${
                message.includes("✅") || message.includes("success") ? "bg-teal-500/10 border-teal-500 text-teal-300 animate-slide-in-down" : "bg-red-500/10 border-red-500 text-red-300 animate-slide-in-down"
              }`}>
              <span className="font-semibold">{message}</span>
            </div>
          )}

          {/* Schedule Job Form */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 mb-16 shadow-2xl shadow-gray-900/50">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">🛠️ Schedule a New Ping</h2>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="url" className="block text-sm font-semibold text-gray-300 mb-2">
                  URL to Ping
                </label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/api/health"
                  className="mt-1 block w-full rounded-xl bg-gray-800 text-white border border-gray-700 shadow-sm focus:ring-teal-500 focus:border-teal-500 p-4 text-base transition-colors placeholder:text-gray-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="interval" className="block text-sm font-semibold text-gray-300 mb-2">
                  Interval (minutes)
                </label>
                <input
                  type="number"
                  id="interval"
                  name="interval"
                  value={formData.interval}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="5"
                  className="mt-1 block w-full rounded-xl bg-gray-800 text-white border border-gray-700 shadow-sm focus:ring-teal-500 focus:border-teal-500 p-4 text-base transition-colors placeholder:text-gray-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-2">
                  Admin Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-xl bg-gray-800 text-white border border-gray-700 shadow-sm focus:ring-teal-500 focus:border-teal-500 p-4 text-base transition-colors placeholder:text-gray-500"
                  required
                />
              </div>

              <div className="md:col-span-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-teal-500 to-green-500 text-gray-900 py-4 px-6 rounded-xl font-bold text-lg hover:from-teal-600 hover:to-green-600 focus:ring-4 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-all duration-200 ease-in-out transform hover:scale-105">
                  {loading ? "Scheduling..." : "Schedule Ping"}
                </button>
              </div>
            </form>
          </div>

          {/* Jobs List */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl shadow-gray-900/50 overflow-hidden">
            <h2 className="text-3xl font-bold text-white p-10 border-b border-gray-800 flex items-center gap-3">📋 Scheduled Pings</h2>

            {jobs.length === 0 ? (
              <p className="p-10 text-gray-600 text-center text-lg">No pings scheduled yet. Start forging uptime above! 🚀</p>
            ) : (
              <ul className="divide-y divide-gray-800">
                {jobs.map((job) => (
                  <JobItem key={job.id} job={job} onToggle={handleToggleJob} onRemove={handleRemove} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Job Item Component
function JobItem({ job, onToggle, onRemove }) {
  const [password, setPassword] = useState("");

  return (
    <li className="p-10 hover:bg-gray-800 transition-colors duration-200 ease-in-out">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold text-white break-words font-mono">{job.url}</h3>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-sm font-medium text-gray-400">
              Interval: <span className="text-white font-semibold">{job.interval} min</span>
            </p>
            <span className={`inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold ${job.running ? "bg-teal-500/20 text-teal-400" : "bg-red-500/20 text-red-400"}`}>{job.running ? "Running" : "Stopped"}</span>
          </div>
        </div>

        <div className="flex flex-col space-y-4 w-full md:w-auto md:min-w-[280px]">
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl bg-gray-800 text-white border border-gray-700 shadow-sm focus:ring-teal-500 focus:border-teal-500 p-3 text-sm transition-colors placeholder:text-gray-500"
          />
          <div className="flex gap-3">
            {job.running ? (
              <button onClick={() => onToggle(job.id, "stop", password)} className="w-full bg-gray-700 text-white py-3 px-4 rounded-xl text-sm font-medium hover:bg-gray-600 transition-colors">
                Stop
              </button>
            ) : (
              <button onClick={() => onToggle(job.id, "start", password)} className="w-full bg-teal-600 text-white py-3 px-4 rounded-xl text-sm font-medium hover:bg-teal-500 transition-colors">
                Start
              </button>
            )}

            <button onClick={() => onRemove(job.id, password)} className="w-full bg-red-600 text-white py-3 px-4 rounded-xl text-sm font-medium hover:bg-red-500 transition-colors">
              Remove
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
