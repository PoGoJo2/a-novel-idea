// Password routes: changing a password needs a login, and only administrators may reset someone else's (no database needed).
process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');

const FAKE_ID = '64b64c0d2f1a5c0012345678';

describe('Password routes', () => {
  test('changing your password needs a login', async () => {
    const res = await request(app).put('/api/auth/password').send({ currentPassword: 'oldpassword', newPassword: 'newpassword' });
    expect(res.status).toBe(401);
  });

  test('an administrator reset needs a login', async () => {
    const res = await request(app).put(`/api/admin/users/${FAKE_ID}/password`).send({ password: 'temporary1' });
    expect(res.status).toBe(401);
  });

  test('forgot password checks the email first', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({ email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe('email');
  });
});
