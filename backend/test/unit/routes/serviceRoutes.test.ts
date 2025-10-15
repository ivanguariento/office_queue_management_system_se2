import request from 'supertest';
import app from '../../../src/app';

jest.mock('../../../src/repositories/serviceRepository', () => {
  return {
    serviceRepository: jest.fn().mockImplementation(() => ({
      getServiceById: jest.fn((id: string) => Promise.resolve({ service_id: id, tag_name: 'A', average_service_time: 5 })),
      getAllServices: jest.fn(() => Promise.resolve([{ service_id: 's1', tag_name: 'A', average_service_time: 5 }]))
    })),
  };
});

describe('GET /api/v1/services', () => {
  it('returns 200 with list of services', async () => {
    const res = await request(app).get('/api/v1/services').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('handles errors from getAllServices controller', async () => {
    const serviceController = require('../../../src/controllers/serviceController');
    const getAllServicesSpy = jest.spyOn(serviceController, 'getAllServices')
      .mockRejectedValueOnce(new Error('Database error'));

    const res = await request(app).get('/api/v1/services').expect(500);
    expect(res.body).toHaveProperty('message', 'Database error');
    expect(res.body).toHaveProperty('code', 500);
    expect(res.body).toHaveProperty('name', 'InternalServerError');
    
    getAllServicesSpy.mockRestore();
  });
});

describe('GET /api/v1/services/:serviceTypeId', () => {
  it('returns 200 and number for queue length', async () => {
    const res = await request(app).get('/api/v1/services/s1').expect(200);
    expect(typeof res.body === 'number' || typeof res.body === 'object').toBeTruthy();
  });

  it('handles errors from getQueueLength controller', async () => {
    const serviceController = require('../../../src/controllers/serviceController');
    const getQueueLengthSpy = jest.spyOn(serviceController, 'getQueueLength')
      .mockRejectedValueOnce(new Error('Queue service error'));

    const res = await request(app).get('/api/v1/services/s1').expect(500);
    expect(res.body).toHaveProperty('message', 'Queue service error');
    expect(res.body).toHaveProperty('code', 500);
    expect(res.body).toHaveProperty('name', 'InternalServerError');
    
    getQueueLengthSpy.mockRestore();
  });
});
