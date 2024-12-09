const request = require('supertest');
const app = require('../server.js');

describe('POST /login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'l@wp.pl',
        password: '1234',
      });
  
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
    });
  
    it('should return 401 for invalid credentials', async () => {
      const response = await request(app).post('/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });
  
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });
});