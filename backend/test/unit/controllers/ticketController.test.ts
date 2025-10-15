import { createTicket } from '../../../src/controllers/ticketController';
import { getTicket } from '../../../src/controllers/ticketController';
import { nextTicket } from '../../../src/controllers/ticketController';

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

  it('getTicket returns TicketDTO when ticket exists', async () => {
    const mockTicket = {
      ticket_id: 't1',
      ticket_code: 'A001',
      issued_at: new Date().toISOString(),
      service_id: 's1'
    };
    
    const ticketRepoModule = require('../../../src/repositories/ticketRepository');
    ticketRepoModule.ticketRepository.mockImplementation(() => ({
      getTicketById: jest.fn(() => Promise.resolve(mockTicket))
    }));

    const result = await getTicket('t1');

    const expectedResult = { 
      ticket_id: 't1', 
      ticket_code: 'A001', 
      issued_at: mockTicket.issued_at, 
      service_id: 's1' 
    };
    expect(result).toEqual(expectedResult);
    expect(ticketRepoModule.ticketRepository).toHaveBeenCalled();
  });

  it('nextTicket returns TicketDTO for next ticket in queue', async () => {
    const mockNextTicket = {
      ticket_id: 't2',
      ticket_code: 'A002',
      issued_at: new Date().toISOString(),
      service_id: 's1'
    };
    
    const ticketRepoModule = require('../../../src/repositories/ticketRepository');
    ticketRepoModule.ticketRepository.mockImplementation(() => ({
      getNextTicketForCounter: jest.fn(() => Promise.resolve(mockNextTicket))
    }));

    const result = await nextTicket('counter1');

    const expectedResult = { 
      ticket_id: 't2', 
      ticket_code: 'A002', 
      issued_at: mockNextTicket.issued_at, 
      service_id: 's1' 
    };
    expect(result).toEqual(expectedResult);
    expect(ticketRepoModule.ticketRepository).toHaveBeenCalled();
  });
});
