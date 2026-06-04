import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 5000 }, // Ramp up to 5k
    { duration: '1m', target: 100000 }, // Spike to 100k
    { duration: '30s', target: 0 }, // Scale down
  ],
  thresholds: {
    http_req_duration: ['p(99)<200'], // 99% of requests must complete below 200ms
    http_req_failed: ['rate<0.0005'], // Max 0.05% error rate -> 99.95% availability
  },
};

export default function () {
  const res = http.get('http://api.velora.local/health');
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}
