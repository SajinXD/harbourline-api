const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;
const RELEASE = process.env.RELEASE_TAG || 'v1.0.0';

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'harbourline',
  password: process.env.DB_PASSWORD || 'changeme',
  database: process.env.DB_NAME || 'tickets',
  connectionTimeoutMillis: 3000
});

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'alive', release: RELEASE });
});

app.get('/readyz', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ready', database: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'not-ready', database: 'unreachable' });
  }
});

app.get('/', (req, res) => {
  res.json({
    service: 'Harbourline Tickets API',
    release: RELEASE,
    pod: process.env.HOSTNAME || 'unknown'
  });
});

app.get('/api/events', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, venue, seats FROM events');
    res.json({ events: result.rows, servedBy: process.env.HOSTNAME });
  } catch (err) {
    res.status(500).json({ error: 'database query failed' });
  }
});

app.get('/api/load', (req, res) => {
  const end = Date.now() + 200;
  let n = 0;
  while (Date.now() < end) { n += Math.sqrt(n + 1); }
  res.json({ done: true, pod: process.env.HOSTNAME });
});

app.listen(PORT, () => {
  console.log(JSON.stringify({
    level: 'info',
    msg: 'server started',
    port: PORT,
    release: RELEASE
  }));
});
