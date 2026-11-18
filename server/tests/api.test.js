// API tests that need NO database: they check that the server answers, rejects bad input,
// and refuses people who are not logged in. Run them with:  npm test
process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');

const FAKE_ID = '64b64c0d2f1a5c0012345678'; // a correctly shaped id that does not exist

describe('Server basics', () => {
  test('health check says the API is running', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('an unknown route gives a clean 404 in JSON', async () => {
    const res = await request(app).get('/api/this-does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('Sign-up and log-in checks', () => {
  test('register rejects an empty form', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  test('register rejects a short password', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: 'Sam', email: 'sam@example.com', password: 'short' });
    expect(res.status).toBe(400);
  });

  test('login rejects a missing password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'sam@example.com' });
    expect(res.status).toBe(400);
  });

  test('"me" needs a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('Logged-out visitors are refused', () => {
  test.each([
    ['get', '/api/library'],
    ['get', '/api/library/ids'],
    ['put', `/api/library/favorites/${FAKE_ID}`],
    ['put', `/api/library/notify/${FAKE_ID}`],
    ['get', '/api/me/memberships'],
    ['get', '/api/me/led-groups'],
    ['post', `/api/groups/${FAKE_ID}/join`],
    ['put', `/api/groups/${FAKE_ID}/goals`],
    ['post', `/api/groups/${FAKE_ID}/notes`],
    ['get', `/api/groups/${FAKE_ID}/notes`],
    ['get', '/api/admin/stats'],
  ])('%s %s returns 401', async (method, url) => {
    const res = await request(app)[method](url).send({});
    expect(res.status).toBe(401);
  });

  test('a made-up token is refused', async () => {
    const res = await request(app).get('/api/library/ids').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });
});

describe('Bad input is rejected before it reaches the database', () => {
  test('a group id that is not an id is a 400', async () => {
    const res = await request(app).get('/api/groups/not-an-id/goals');
    expect(res.status).toBe(400);
  });

  test('the join-status route checks the id too', async () => {
    const res = await request(app).get('/api/groups/not-an-id/join-status');
    expect(res.status).toBe(400);
  });

  test('an unknown genre filter is a 400', async () => {
    const res = await request(app).get('/api/groups?genre=Bogus');
    expect(res.status).toBe(400);
  });

  test('a day filter outside 0-6 is a 400', async () => {
    const res = await request(app).get('/api/groups?day=9');
    expect(res.status).toBe(400);
  });
});
