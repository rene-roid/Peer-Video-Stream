import os from 'os';
import pidusage from 'pidusage';
import express from 'express';
const router = express.Router();

router.get('/', async (_, res) => {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsageInGB = {
      'Memory Total (GB)': (totalMemory / 1024 / 1024 / 1024).toFixed(2),
      'Memory Used (GB)': (usedMemory / 1024 / 1024 / 1024).toFixed(2),
      'Memory Free (GB)': (freeMemory / 1024 / 1024 / 1024).toFixed(2),
    };
  
    let cpuUsage;
    try {
      const stats = await pidusage(process.pid);
      cpuUsage = `${stats.cpu.toFixed(2)}%`;
    } catch (err) {
      console.error(err);
      cpuUsage = 'Unavailable';
    }
  
    const uptimeSeconds = process.uptime();
    const uptimeHours = Math.floor(uptimeSeconds / 3600);
    const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);
    const uptime = `${uptimeHours}h ${uptimeMinutes}m ${Math.floor(uptimeSeconds % 60)}s`;
  
    res.json({
      'Uptime': uptime,
      'Memory Usage': memoryUsageInGB,
      'CPU Usage': cpuUsage,
    });
});

export default router;