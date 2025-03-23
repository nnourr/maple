import http from 'k6/http';
import { sleep, check } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const errorDetails = new Trend('error_details');
const cpuTrend = new Trend('cpu_usage');
const memoryTrend = new Trend('memory_usage_mb');
const requestsPerSecond = new Counter('requests_per_second');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 50 }, // Ramp up to 50 users
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '3m', target: 100 }, // Stay at 100 users
    { duration: '30s', target: 0 }, // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // 95% of requests should be below 5s
    http_req_failed: ['rate<0.05'], // Less than 1% of requests should fail
    errors: ['rate<0.05'], // Less than 1% error rate
    cpu_usage: ['avg<95'], // Average CPU usage should be below 95%
    memory_usage_mb: ['max<10240'], // Max memory usage should be below 10GB
  },
  // Enable system monitoring
  systemTags: ['cpu', 'memory'],
};

/* Original high-load configuration for future use
export const highLoadOptions = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '3m', target: 1000 }, // Ramp up to 1000 users
    { duration: '5m', target: 10000 }, // Ramp up to 10000 users
    { duration: '10m', target: 10000 }, // Stay at 10000 for 10 minutes
    { duration: '5m', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // 95% of requests should be below 5s
    http_req_failed: ['rate<0.01'], // Less than 1% of requests should fail
    errors: ['rate<0.01'], // Less than 1% error rate
  },
};
*/

const BASE_URL = __ENV.API_URL || 'http://localhost:3000'; // Adjust this to your API URL

// Helper function to make search requests
function makeSearchRequest(searchType, query) {
  const startTime = Date.now();
  const url = `${BASE_URL}/api/search/${searchType}?q=${encodeURIComponent(query)}&count=20`;
  
  const response = http.get(url);
  requestsPerSecond.add(1);

  // Try to get system metrics from response headers if available
  try {
    const cpuUsage = response.headers['X-CPU-Usage'];
    const memoryUsage = response.headers['X-Memory-Usage'];
    
    if (cpuUsage) {
      cpuTrend.add(parseFloat(cpuUsage));
    }
    if (memoryUsage) {
      memoryTrend.add(parseFloat(memoryUsage));
    }
  } catch (e) {
    // Ignore if headers are not available
  }

  // Check if request was successful
  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'response has results': (r) => {
      if (r.status !== 200) {
        console.error(`${searchType} search failed:`, r.body);
        errorDetails.add(1, { error: r.body, type: searchType });
        return false;
      }
      return r.json().hasOwnProperty('results');
    },
    'response time OK': (r) => {
      const duration = Date.now() - startTime;
      return duration < 5000; // 5 seconds threshold
    }
  });

  if (!success) {
    errorRate.add(1);
    if (response.status === 500) {
      console.error(`Server error for ${searchType} search:`, response.body);
    }
  }

  return response;
}

// Main test function
export default function () {
  // Verify BRAVE_API_KEY is set
  const testResponse = makeSearchRequest('web', 'test');
  if (testResponse.status === 500) {
    const error = JSON.parse(testResponse.body);
    if (error.type === 'Brave Search API key not configured') {
      console.error('ERROR: BRAVE_API_KEY environment variable is not set');
      return;
    }
  }

  // Test web search
  makeSearchRequest('web', 'technology news');
  sleep(1);

  // Test image search
  makeSearchRequest('images', 'nature photography');
  sleep(1);

  // Test video search
  makeSearchRequest('videos', 'cooking tutorials');
  sleep(1);

  // Test news search
  makeSearchRequest('news', 'current events');
  sleep(1);
} 