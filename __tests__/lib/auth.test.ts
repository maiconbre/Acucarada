import { hashPassword, verifyPassword, generateToken, verifyToken } from '@/lib/auth';

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mockToken'),
  verify: jest.fn().mockReturnValue({ userId: '1', role: 'admin' }),
}));

// Mock environment variables
const originalEnv = process.env;
beforeAll(() => {
  process.env = {
    ...originalEnv,
    JWT_SECRET: 'test-secret',
    BCRYPT_ROUNDS: '12',
  };
});

afterAll(() => {
  process.env = originalEnv;
});

describe('Auth Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123';
      const hashedPassword = await hashPassword(password);
      
      expect(hashedPassword).toBe('hashedPassword');
      expect(require('bcryptjs').hash).toHaveBeenCalledWith(password, 12);
    });
  });

  describe('verifyPassword', () => {
    it('should verify a correct password', async () => {
      const password = 'testPassword123';
      const hashedPassword = 'hashedPassword';
      
      const isValid = await verifyPassword(password, hashedPassword);
      
      expect(isValid).toBe(true);
      expect(require('bcryptjs').compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should reject an incorrect password', async () => {
      require('bcryptjs').compare.mockResolvedValueOnce(false);
      
      const password = 'wrongPassword';
      const hashedPassword = 'hashedPassword';
      
      const isValid = await verifyPassword(password, hashedPassword);
      
      expect(isValid).toBe(false);
    });
  });

  describe('generateToken', () => {
    it('should generate a JWT token', () => {
      const user = {
        id: '1',
        username: 'testuser',
        password_hash: 'hash',
        role: 'admin' as const,
        is_active: true,
        last_login: null,
        login_attempts: 0,
        locked_until: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };
      const token = generateToken(user);
      
      expect(token).toBe('mockToken');
      expect(require('jsonwebtoken').sign).toHaveBeenCalled();
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = 'validToken';
      const decoded = verifyToken(token);
      
      expect(decoded).toEqual({ userId: '1', role: 'admin' });
      expect(require('jsonwebtoken').verify).toHaveBeenCalledWith(token, expect.any(String));
    });

    it('should return null for invalid token', () => {
      require('jsonwebtoken').verify.mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });
      
      const token = 'invalidToken';
      
      expect(verifyToken(token)).toBeNull();
    });
  });
});

describe('Auth Integration', () => {
  it('should complete full auth cycle', async () => {
    const password = 'testPassword123';
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    expect(hashedPassword).toBe('hashedPassword');
    
    // Verify password
    const isValid = await verifyPassword(password, hashedPassword);
    expect(isValid).toBe(true);
    
    // Generate token
    const payload = { userId: '1', role: 'admin' };
    const token = generateToken(payload);
    expect(token).toBe('mockToken');
    
    // Verify token
    const decoded = verifyToken(token);
    expect(decoded).toEqual(payload);
  });
});