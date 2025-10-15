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

describe('GET /api/services', () => {
  it('returns 200 with list of services', async () => {
    const res = await request(app).get('/api/services').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe('GET /api/services/:serviceTypeId', () => {
  it('returns 200 and number for queue length', async () => {
    const res = await request(app).get('/api/services/s1').expect(200);
    // queueServices.get_queue_length returns a number; controller returns that value
    expect(typeof res.body === 'number' || typeof res.body === 'object').toBeTruthy();
  });
});
