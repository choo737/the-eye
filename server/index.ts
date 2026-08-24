import { serverQueryCache } from './cache/queryCache';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { googleAuthManager } from './auth/googleAuth';
import { bigqueryConnector } from './connectors/bigquery';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// 1. Health check & ADC Identity status
app.get('/api/health', async (req, res) => {
  try {
    const projectId = await googleAuthManager.getProjectId();
    res.json({
      status: 'healthy',
      engine: 'The Eye Enterprise Server',
      gcp_project: projectId,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 2. Auth Context Endpoint
app.get('/api/auth/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const idToken = authHeader.split(' ')[1];
    const user = await googleAuthManager.verifyIdToken(idToken);
    return res.json({ authenticated: true, user });
  }
  
  // Default ADC / Workspace Identity
  res.json({
    authenticated: true,
    user: {
      email: 'jackychoo@google.com',
      name: 'Jacky Choo (Google Cloud ADC)',
      picture: 'https://avatars.githubusercontent.com/u/23527099?v=4',
      hd: 'google.com'
    }
  });
});

// 3. BigQuery Project & Datasets Inspection
app.get('/api/bigquery/inspect', async (req, res) => {
  const projectId = (req.query.project as string) || 'seven-eleven-qlik-bq';
  const result = await bigqueryConnector.testConnection(projectId);
  res.json(result);
});

// 4. BigQuery Query Execution with Credential Forwarding
app.post('/api/bigquery/query', async (req, res) => {
  try {
    const { query, params, project } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query string is required' });
    }

    const authHeader = req.headers.authorization;
    let userContext;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      userContext = await googleAuthManager.verifyIdToken(authHeader.split(' ')[1]);
    }

    // Check Server-Side BigQuery Result Cache
    const cacheKey = serverQueryCache.hashQuery(query, params, project);
    const cachedResult = serverQueryCache.get(cacheKey);
    if (cachedResult && !req.query.force_refresh) {
      return res.json({
        ...cachedResult,
        is_cache_hit: true,
        cached_at: new Date().toISOString()
      });
    }

    const connector = project ? new (bigqueryConnector.constructor as any)(project) : bigqueryConnector;
    const results = await connector.executeQuery(query, params, userContext);
    serverQueryCache.set(cacheKey, results);
    res.json({
      ...results,
      is_cache_hit: false
    });
  } catch (err: any) {
    res.status(500).json({
      error: 'BigQuery Query Failed',
      message: err.message
    });
  }
});

// Start API server

// 5. Invalidate / Purge BI Cache
app.post('/api/cache/purge', (req, res) => {
  serverQueryCache.clear();
  res.json({ status: 'success', message: 'BigQuery BI query cache invalidated' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[The Eye Server] Running on http://0.0.0.0:${PORT}`);
  console.log(`[The Eye Server] Connected to GCP Project: seven-eleven-qlik-bq`);
});
