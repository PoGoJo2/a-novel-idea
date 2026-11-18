// Administrator and feedback routes must refuse anyone who is not logged in (no database needed).
process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');

const FAKE_ID = '64b64c0d2f1a5c0012345678';

describe('Administrator routes need a login', () => {
  const calls = [
    ['get', '/api/admin/stats'],
    ['get', '/api/admin/groups'],
    ['post', '/api/admin/groups'],
    ['put', `/api/admin/groups/${FAKE_ID}`],
    ['get', '/api/admin/books'],
    ['post', '/api/admin/books'],
    ['put', `/api/admin/books/${FAKE_ID}/retire`],
    ['get', '/api/admin/users'],
    ['put', `/api/admin/users/${FAKE_ID}/role`],
    ['put', `/api/admin/users/${FAKE_ID}/suspend`],
    ['get', '/api/admin/feedback'],
    ['put', `/api/admin/feedback/${FAKE_ID}`],
  ];

  test.each(calls)('%s %s is refused with 401', async (method, url) => {
    const res = await request(app)[method](url).send({});
    expect(res.status).toBe(401);
  });
});

describe('Feedback', () => {
  test('sending feedback needs a login', async () => {
    const res = await request(app).post('/api/feedback').send({ kind: 'review', message: 'Lovely group' });
    expect(res.status).toBe(401);
  });
});
