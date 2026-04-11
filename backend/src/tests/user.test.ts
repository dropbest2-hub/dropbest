import request from 'supertest';
import app from '../index';
import { supabaseAdmin } from '../config/supabase';

// Mock Supabase
jest.mock('../config/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        then: jest.fn((cb) => cb({ data: [{ rating: 5 }, { rating: 4 }], error: null })),
      })),
      // For the count query
      count: jest.fn(() => Promise.resolve({ count: 10, error: null }))
    })),
  },
  supabaseUrl: 'http://localhost:54321',
  supabaseKey: 'fake-key'
}));

describe('User API Endpoints', () => {
  it('GET /api/users/stats should return community stats', async () => {
    // Simplify mock for this specific test
    (supabaseAdmin.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'users') {
            return {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockReturnThis(),
                then: jest.fn((cb) => cb({ count: 42, data: null, error: null }))
            };
        }
        if (table === 'reviews') {
            return {
                select: jest.fn().mockReturnThis(),
                then: jest.fn((cb) => cb({ data: [{ rating: 5 }, { rating: 3 }], error: null }))
            };
        }
        return {};
    });

    const res = await request(app).get('/api/users/stats');
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalUsers');
    expect(res.body).toHaveProperty('avgRating');
    expect(res.body.avgRating).toBe(4.0); // (5+3)/2
  });

  it('GET /health should return status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
