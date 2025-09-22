const request = require('supertest');
const app = require('../server');

describe('Todo API', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Register a test user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'testpassword123'
      });
    
    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;
  });

  describe('Authentication', () => {
    test('POST /api/auth/register - should create a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'new@example.com',
          password: 'newpassword123'
        });

      expect(response.status).toBe(201);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.username).toBe('newuser');
    });

    test('POST /api/auth/login - should login existing user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
    });

    test('POST /api/auth/login - should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('Todos', () => {
    test('GET /api/todos - should return empty array initially', async () => {
      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('POST /api/todos - should create a new todo', async () => {
      const todoData = {
        title: 'Test Todo',
        description: 'This is a test todo'
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(todoData);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(todoData.title);
      expect(response.body.description).toBe(todoData.description);
      expect(response.body.completed).toBe(false);
    });

    test('GET /api/todos - should return created todos', async () => {
      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('PUT /api/todos/:id - should update a todo', async () => {
      // First create a todo
      const createResponse = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Todo to update' });

      const todoId = createResponse.body.id;

      // Now update it
      const updateResponse = await request(app)
        .put(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          title: 'Updated Todo',
          completed: true
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.title).toBe('Updated Todo');
      expect(updateResponse.body.completed).toBe(true);
    });

    test('DELETE /api/todos/:id - should delete a todo', async () => {
      // First create a todo
      const createResponse = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Todo to delete' });

      const todoId = createResponse.body.id;

      // Now delete it
      const deleteResponse = await request(app)
        .delete(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.message).toBe('Todo deleted successfully');
    });

    test('Should reject requests without authentication', async () => {
      const response = await request(app)
        .get('/api/todos');

      expect(response.status).toBe(401);
    });
  });

  describe('Health Check', () => {
    test('GET /api/health - should return server status', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
    });
  });
});

