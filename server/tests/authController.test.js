const authController = require('../controllers/authController')
const User = require('../models/User')

const jwt = require('jsonwebtoken');

jest.mock('../models/User');
jest.mock('jsonwebtoken');

describe('authController.login', () => {
    it('should return 400 if validation fails', async () => {
      const req = { body: { email: '', password: '' } }; // Invalid data
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await authController.login(req, res);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String), // Błąd walidacji
      }));
    });
  
    it('should return 404 if user is not found', async () => {
      const req = { body: { email: 'notfound@example.com', password: '1234' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      User.findOne.mockResolvedValue(null); // Symulacja braku użytkownika
  
      await authController.login(req, res);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        msg: 'Such an account not found',
      }));
    });
  
    it('should return 401 if password is incorrect', async () => {
      const req = { body: { email: 'test@example.com', password: 'wrongpassword' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      User.findOne.mockResolvedValue({ email: 'test@example.com', password: 'correctpassword' });
  
      await authController.login(req, res);
  
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        msg: 'Invalid Credentials',
      }));
    });
  
    it('should return 200 and tokens if login is successful', async () => {
      const req = { body: { email: 'test@example.com', password: '1234' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      User.findOne.mockResolvedValue({ userID: 1, email: 'test@example.com', password: '1234' });
      jwt.sign.mockReturnValueOnce('mockAccessToken').mockReturnValueOnce('mockRefreshToken'); // Mockowanie tokenów
  
      await authController.login(req, res);
  
      expect(res.status).not.toHaveBeenCalledWith(400); // Nie walidacja
      expect(res.status).not.toHaveBeenCalledWith(404); // Nie brak użytkownika
      expect(res.status).not.toHaveBeenCalledWith(401); // Nie błędne hasło
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
      }));
    });
  });

describe('authController.login validation', () => {
    it('should return 400 if email is invalid', async () => {
      const req = {
        body: { email: 'invalidemail', password: 'password123' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await authController.login(req, res);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('email'),
      }));
    });
    it('should return 400 if password is too short', async () => {
        const req = {
          body: { email: 'test@example.com', password: '12' },
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
    
        await authController.login(req, res);
    
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          message: expect.stringContaining('password'),
        }));
      });
});
