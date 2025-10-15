import request from 'supertest';
import app from '../../../src/app';

// Mock the serviceRepository and ticketRepository modules
jest.mock('../../../src/repositories/serviceRepository', () => {
  return {
    serviceRepository: jest.fn().mockImplementation(() => ({
      getServiceById: jest.fn((id: string) => Promise.resolve({ service_id: id, tag_name: 'A', average_service_time: 5 })),
    })),
  };
});

jest.mock('../../../src/repositories/ticketRepository', () => {
  return {
    ticketRepository: jest.fn().mockImplementation(() => ({
      createTicket: jest.fn((service: any) => Promise.resolve({ ticket_id: 't1', ticket_code: `${service.tag_name}0`, service_id: service.service_id, issued_at: new Date().toISOString() })),
    })),
  };
});

describe('POST /api/v1/tickets/new', () => {
  it('returns 200 and created ticket when service exists', async () => {
    const res = await request(app)
      .post('/api/v1/tickets/new')
      .send({ serviceTypeId: 's1' })
      .expect(200);

  expect(res.body).toHaveProperty('ticketId');
  expect(res.body).toHaveProperty('ticketCode');
  expect(res.body.serviceId).toBe('s1');
  });

  it('returns error when service not found', async () => {
    // Override the serviceRepository mock to return null
  const svcModule = require('../../../src/repositories/serviceRepository');
  svcModule.serviceRepository.mockImplementation(() => ({ getServiceById: jest.fn(() => Promise.resolve(null)) }));

    const res = await request(app)
      .post('/api/v1/tickets/new')
      .send({ serviceTypeId: 'not_found' });

    // controller throws; Express error handler not defined so request will 500
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
