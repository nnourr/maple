import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import morgan from 'morgan';
import { RequestAggregator } from './utils/RequestAggregator';
import os from 'os';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const aggregator = new RequestAggregator(1000); // 1 second window

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Middleware to track system metrics
app.use((req, res, next) => {
  // Get CPU usage
  const cpus = os.cpus();
  const cpuUsage = cpus.reduce((acc, cpu) => {
    const total = Object.values(cpu.times).reduce((a, b) => a + b);
    const idle = cpu.times.idle;
    return acc + ((total - idle) / total * 100);
  }, 0) / cpus.length;

  // Get memory usage
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = (totalMemory - freeMemory) / 1024 / 1024; // Convert to MB

  // Add metrics to response headers
  res.set('X-CPU-Usage', cpuUsage.toFixed(2));
  res.set('X-Memory-Usage', usedMemory.toFixed(2));
  res.set('X-Total-Memory', (totalMemory / 1024 / 1024).toFixed(2));
  
  next();
});

// Brave Search API base URL
const BRAVE_API_BASE_URL = 'https://api.search.brave.com/res/v1';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Middleware to check for API key
const checkApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const apiKey = process.env.BRAVE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Brave Search API key not configured' });
  }
  next();
};

// Generic search handler
const handleSearch = async (searchType: string, query: string, count: number = 10) => {
  let retries = 0;
  let lastError: any;

  while (retries < MAX_RETRIES) {
    try {
      const response = await axios.get(`${BRAVE_API_BASE_URL}/${searchType}/search`, {
        params: { q: query, count },
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': process.env.BRAVE_API_KEY
        }
      });
      return response.data;
    } catch (error: any) {
      lastError = error;
      
      // Only retry on rate limit errors (429) or server errors (5xx)
      if (error.response?.status !== 429 && !(error.response?.status >= 500 && error.response?.status < 600)) {
        throw error;
      }

      retries++;
      if (retries === MAX_RETRIES) {
        throw new Error(`Failed after ${MAX_RETRIES} retries. Rate limit or server error.`);
      }

      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      const backoffDelay = INITIAL_RETRY_DELAY * Math.pow(2, retries - 1);
      await delay(backoffDelay);
    }
  }
};

// Web Search endpoint
app.get('/api/search/web', checkApiKey, async (req, res) => {
  try {
    const { q, count } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    
    const key = `web:${q}:${count}`;
    
    const result = await aggregator.execute(key, () => 
      handleSearch('web', q as string, Number(count))
    );
    
    res.json(result);
  } catch (error: any) {
    console.error('Web search error:', error.message, error.response?.data);
    res.status(500).json({ 
      error: 'Failed to fetch search results',
      details: error.message,
      type: error.response?.data?.error || 'Unknown error'
    });
  }
});

// Image Search endpoint
app.get('/api/search/images', checkApiKey, async (req, res) => {
  try {
    const { q, count } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    
    const key = `images:${q}:${count}`;
    
    const result = await aggregator.execute(key, () => 
      handleSearch('images', q as string, Number(count))
    );
    
    res.json(result);
  } catch (error: any) {
    console.error('Image search error:', error.message, error.response?.data);
    res.status(500).json({ 
      error: 'Failed to fetch image results',
      details: error.message,
      type: error.response?.data?.error || 'Unknown error'
    });
  }
});

// News Search endpoint
app.get('/api/search/news', checkApiKey, async (req, res) => {
  try {
    const { q, count } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    
    const key = `news:${q}:${count}`;
    
    const result = await aggregator.execute(key, () => 
      handleSearch('news', q as string, Number(count))
    );
    
    res.json(result);
  } catch (error: any) {
    console.error('News search error:', error.message, error.response?.data);
    res.status(500).json({ 
      error: 'Failed to fetch news results',
      details: error.message,
      type: error.response?.data?.error || 'Unknown error'
    });
  }
});

// Video Search endpoint
app.get('/api/search/videos', checkApiKey, async (req, res) => {
  try {
    const { q, count } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    
    const key = `videos:${q}:${count}`;
    
    const result = await aggregator.execute(key, () => 
      handleSearch('videos', q as string, Number(count))
    );
    
    res.json(result);
  } catch (error: any) {
    console.error('Video search error:', error.message, error.response?.data);
    res.status(500).json({ 
      error: 'Failed to fetch video results',
      details: error.message,
      type: error.response?.data?.error || 'Unknown error'
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 