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

const credentials = { name: 'Ali Hassan', email: 'ali@test.com', password: 'Password123!' };

async function getToken(): Promise<string> {
  const res = await request.post('/api/v1/auth/register').send(credentials);
  return res.body.data.accessToken;
}

describe('POST /api/v1/tasks', () => {
  it('should create a task when authenticated', async () => {
    const token = await getToken();
    const res = await request
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Fix login bug', priority: 'high' });
    expect(res.status).toBe(201);
    expect(res.body.data.task.title).toBe('Fix login bug');
    expect(res.body.data.task.priority).toBe('high');
    expect(res.body.data.task.status).toBe('todo');
  });

  it('should return 400 if title is missing', async () => {
    const token = await getToken();
    const res = await request
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ priority: 'high' });
    expect(res.status).toBe(400);
  });

  it('should return 401 without token', async () => {
    const res = await request.post('/api/v1/tasks').send({ title: 'Test' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/tasks', () => {
  it('should return paginated tasks', async () => {
    const token = await getToken();
    await request.post('/api/v1/tasks').set('Authorization', `Bearer ${token}`).send({ title: 'Task 1' });
    await request.post('/api/v1/tasks').set('Authorization', `Bearer ${token}`).send({ title: 'Task 2' });

    const res = await request.get('/api/v1/tasks').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.tasks).toHaveLength(2);
    expect(res.body.meta).toHaveProperty('total', 2);
    expect(res.body.meta).toHaveProperty('page', 1);
  });

  it('should filter by status', async () => {
    const token = await getToken();
    await request.post('/api/v1/tasks').set('Authorization', `Bearer ${token}`).send({ title: 'Task A', status: 'done' });
    await request.post('/api/v1/tasks').set('Authorization', `Bearer ${token}`).send({ title: 'Task B', status: 'todo' });

    const res = await request.get('/api/v1/tasks?status=done').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.tasks).toHaveLength(1);
    expect(res.body.data.tasks[0].status).toBe('done');
  });
});

describe('PATCH /api/v1/tasks/:id', () => {
  it('should update a task', async () => {
    const token = await getToken();
    const created = await request.post('/api/v1/tasks').set('Authorization', `Bearer ${token}`).send({ title: 'Old title' });
    const taskId = created.body.data.task._id;

    const res = await request
      .patch(`/api/v1/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'New title', status: 'in_progress' });
    expect(res.status).toBe(200);
    expect(res.body.data.task.title).toBe('New title');
    expect(res.body.data.task.status).toBe('in_progress');
  });
});

describe('DELETE /api/v1/tasks/:id', () => {
  it('should delete a task', async () => {
    const token = await getToken();
    const created = await request.post('/api/v1/tasks').set('Authorization', `Bearer ${token}`).send({ title: 'To delete' });
    const taskId = created.body.data.task._id;

    const res = await request.delete(`/api/v1/tasks/${taskId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);

    const check = await request.get(`/api/v1/tasks/${taskId}`).set('Authorization', `Bearer ${token}`);
    expect(check.status).toBe(404);
  });
});

describe('GET /api/v1/tasks/stats', () => {
  it('should return task statistics', async () => {
    const token = await getToken();
    await request.post('/api/v1/tasks').set('Authorization', `Bearer ${token}`).send({ title: 'T1', status: 'done' });
    await request.post('/api/v1/tasks').set('Authorization', `Bearer ${token}`).send({ title: 'T2', priority: 'high' });

    const res = await request.get('/api/v1/tasks/stats').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.stats).toHaveProperty('total', 2);
    expect(res.body.data.stats).toHaveProperty('done', 1);
    expect(res.body.data.stats).toHaveProperty('highPriority', 1);
  });
});
