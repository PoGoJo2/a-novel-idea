// Leader and leader-request routes must refuse anyone who is not logged in (no database needed).
process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');

const FAKE_ID = '64b64c0d2f1a5c0012345678';

describe('Leader routes need a login', () => {
  const calls = [
    ['get', '/api/leader/classes'],
    ['get', '/api/leader/open'],
    ['get', '/api/leader/record'],
    ['post', `/api/leader/classes/${FAKE_ID}/request`],
    ['delete', `/api/leader/classes/${FAKE_ID}/request`],
    ['put', `/api/leader/classes/${FAKE_ID}/finish`],
    ['get', '/api/admin/leader-requests'],
    ['put', `/api/admin/leader-requests/${FAKE_ID}`],
  ];

  test.each(calls)('%s %s is refused with 401', async (method, url) => {
    const res = await request(app)[method](url).send({});
    expect(res.status).toBe(401);
  });
});
