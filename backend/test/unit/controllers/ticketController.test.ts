import { createTicket } from '../../../src/controllers/ticketController';

jest.mock('../../../src/repositories/serviceRepository', () => ({
  serviceRepository: jest.fn().mockImplementation(() => ({
    getServiceById: jest.fn((id: string) => Promise.resolve({ service_id: id, tag_name: 'A', average_service_time: 5 })),
  })),
}));

jest.mock('../../../src/repositories/ticketRepository', () => ({
  ticketRepository: jest.fn().mockImplementation(() => ({
    createTicket: jest.fn((service: any) => Promise.resolve({ ticket_id: 't1', ticket_code: `${service.tag_name}0`, service_id: service.service_id, issued_at: new Date().toISOString() })),
  })),
}));

describe('ticketController', () => {
  it('createTicket returns TicketDTO on success', async () => {
    const dto = await createTicket('s1');
    expect(dto.ticketId).toBe('t1');
    expect(dto.serviceId).toBe('s1');
  });

  it('createTicket throws when service not found', async () => {
    const svcModule = require('../../../src/repositories/serviceRepository');
    svcModule.serviceRepository.mockImplementation(() => ({ getServiceById: jest.fn(() => Promise.resolve(null)) }));

    await expect(createTicket('notfound')).rejects.toThrow('Service not found');
  });
});
