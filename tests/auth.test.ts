import supertest from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { connectDB, disconnectDB } from '../src/config/database';

const request = supertest(app);

beforeAll(async () => { await connectDB(); });
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await disconnectDB();
});
afterEach(async () => { await mongoose.connection.dropDatabase(); });

const user = { name: 'Ali Hassan', email: 'ali@test.com', password: 'Password123!' };

describe('POST /api/v1/auth/register', () => {
  it('should register a new user and return tokens', async () => {
    const res = await request.post('/api/v1/auth/register').send(user);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
    expect(res.body.data.user).not.toHaveProperty('password');
  });

  it('should return 409 if email already exists', async () => {
    await request.post('/api/v1/auth/register').send(user);
    const res = await request.post('/api/v1/auth/register').send(user);
    expect(res.status).toBe(409);
  });

  it('should return 400 for invalid email', async () => {
    const res = await request.post('/api/v1/auth/register').send({ ...user, email: 'not-an-email' });
    expect(res.status).toBe(400);
  });

  it('should return 400 for short password', async () => {
    const res = await request.post('/api/v1/auth/register').send({ ...user, password: '123' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => { await request.post('/api/v1/auth/register').send(user); });

  it('should login with correct credentials', async () => {
    const res = await request.post('/api/v1/auth/login').send({ email: user.email, password: user.password });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('accessToken');
  });

  it('should return 401 for wrong password', async () => {
    const res = await request.post('/api/v1/auth/login').send({ email: user.email, password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  it('should return 401 for non-existent email', async () => {
    const res = await request.post('/api/v1/auth/login').send({ email: 'nobody@test.com', password: 'Password123!' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/auth/me', () => {
  it('should return current user when authenticated', async () => {
    const reg = await request.post('/api/v1/auth/register').send(user);
    const token = reg.body.data.accessToken;
    const res = await request.get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user).toHaveProperty('id');
  });

  it('should return 401 without token', async () => {
    const res = await request.get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });
});
