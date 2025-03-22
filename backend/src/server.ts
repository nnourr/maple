import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import morgan from 'morgan';
import { RequestAggregator } from './utils/RequestAggregator';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const aggregator = new RequestAggregator(1000); // 1 second window

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Brave Search API base URL
const BRAVE_API_BASE_URL = 'https://api.search.brave.com/res/v1';

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
  const response = await axios.get(`${BRAVE_API_BASE_URL}/${searchType}/search`, {
    params: { q: query, count },
    headers: {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip',
      'X-Subscription-Token': process.env.BRAVE_API_KEY
    }
  });
  return response.data;
};

// Web Search endpoint
app.get('/api/search/web', checkApiKey, async (req, res) => {
  try {
    const { q, count } = req.query;
    const key = `web:${q}:${count}`;
    
    const result = await aggregator.execute(key, () => 
      handleSearch('web', q as string, Number(count))
    );
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch search results' });
  }
});

// Image Search endpoint
app.get('/api/search/images', checkApiKey, async (req, res) => {
  try {
    const { q, count } = req.query;
    const key = `images:${q}:${count}`;
    
    const result = await aggregator.execute(key, () => 
      handleSearch('images', q as string, Number(count))
    );
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch image results' });
  }
});

// News Search endpoint
app.get('/api/search/news', checkApiKey, async (req, res) => {
  try {
    const { q, count } = req.query;
    const key = `news:${q}:${count}`;
    
    const result = await aggregator.execute(key, () => 
      handleSearch('news', q as string, Number(count))
    );
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news results' });
  }
});

// Video Search endpoint
app.get('/api/search/videos', checkApiKey, async (req, res) => {
  try {
    const { q, count } = req.query;
    const key = `videos:${q}:${count}`;
    
    const result = await aggregator.execute(key, () => 
      handleSearch('videos', q as string, Number(count))
    );
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch video results' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 