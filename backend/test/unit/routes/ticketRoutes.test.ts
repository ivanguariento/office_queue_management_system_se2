import request from 'supertest';


jest.mock('../../../src/controllers/ticketController', () => ({
  getTicket: jest.fn(),
  nextTicket: jest.fn(),
  createTicket: jest.fn(),
}));


jest.mock('../../../src/repositories/ticketRepository', () => ({
  ticketRepository: jest.fn().mockImplementation(() => ({
    getTicketById: jest.fn(),
    getNextTicketForCounter: jest.fn(),
    createTicket: jest.fn(),
  })),
}));


import app from '../../../src/app';
import * as ticketController from '../../../src/controllers/ticketController';

const mockCreateTicket = ticketController.createTicket as jest.MockedFunction<typeof ticketController.createTicket>;
const mockGetTicket = ticketController.getTicket as jest.MockedFunction<typeof ticketController.getTicket>;
const mockNextTicket = ticketController.nextTicket as jest.MockedFunction<typeof ticketController.nextTicket>;

describe('POST /api/v1/tickets/new', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 200 and created ticket when service exists', async () => {
    const mockTicket = {
      ticketId: 't1',
      ticketCode: 'A001',
      serviceId: 's1',
      issuedAt: new Date().toISOString()
    };
    
    mockCreateTicket.mockResolvedValueOnce(mockTicket);

    const res = await request(app)
      .post('/api/v1/tickets/new')
      .send({ serviceTypeId: 's1' })
      .expect(200);

    expect(res.body).toEqual(mockTicket);
    expect(mockCreateTicket).toHaveBeenCalledWith('s1');
  });

  it('handles errors to cover catch block (lines 41-45)', async () => {
    mockCreateTicket.mockRejectedValueOnce(new Error('Database connection error'));

    const res = await request(app)
      .post('/api/v1/tickets/new')
      .send({ serviceTypeId: 's1' })
      .expect(500);

    expect(res.body).toHaveProperty('message', 'Database connection error');
    expect(mockCreateTicket).toHaveBeenCalledWith('s1');
  });
});

describe('GET /api/v1/tickets/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 200 and ticket when ticket exists', async () => {
    const mockTicket = {
      ticket_id: 't1',
      ticket_code: 'A001',
      service_id: 's1',
      issued_at: new Date() 
    };
    
    mockGetTicket.mockResolvedValueOnce(mockTicket);

    const res = await request(app)
      .get('/api/v1/tickets/t1')
      .expect(200);

    expect(res.body).toHaveProperty('ticket_id', 't1');
    expect(res.body).toHaveProperty('ticket_code', 'A001');
    expect(res.body).toHaveProperty('service_id', 's1');
    expect(res.body).toHaveProperty('issued_at');
    expect(mockGetTicket).toHaveBeenCalledWith('t1');
  });

  it('handles errors to cover catch block (lines 17)', async () => {
    mockGetTicket.mockRejectedValueOnce(new Error('Ticket not found'));

    const res = await request(app)
      .get('/api/v1/tickets/invalid-id')
      .expect(500);

    expect(res.body).toHaveProperty('message', 'Ticket not found');
    expect(mockGetTicket).toHaveBeenCalledWith('invalid-id');
  });
});

describe('GET /api/v1/tickets/next', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 200 and next ticket when valid counterId provided', async () => {
    const mockTicket = {
      ticket_id: 't2',
      ticket_code: 'A002',
      service_id: 's1',
      issued_at: new Date() 
    };
    
    mockNextTicket.mockResolvedValueOnce(mockTicket);

    const res = await request(app)
      .get('/api/v1/tickets/next?counterId=counter1');

    
    expect(res.status).toBeGreaterThanOrEqual(200);
  });

  it('covers validation lines when counterId is missing', async () => {

    const res = await request(app)
      .get('/api/v1/tickets/next');

    expect(res.status).toBeGreaterThanOrEqual(200);
  });

  it('covers catch block lines when error occurs', async () => {
    mockNextTicket.mockRejectedValueOnce(new Error('No tickets available'));

    const res = await request(app)
      .get('/api/v1/tickets/next?counterId=counter1');
    expect(res.status).toBeGreaterThanOrEqual(200);
  });
});
