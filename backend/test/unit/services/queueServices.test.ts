import { add_to_queue, clear_queue, get_queue_length } from '../../../src/services/queueServices';

describe('queueServices', () => {
  const makeTicket = (id: string, code: string) => ({ ticket_id: id, ticket_code: code, issued_at: new Date().toISOString(), service_id: 's1' } as any);

  beforeEach(() => {
    // ensure clean state between tests
    clear_queue('s1');
    clear_queue('s2');
  });

  it('adds tickets to queue and returns correct length', () => {
    expect(get_queue_length('s1')).toBe(0);
    add_to_queue('s1', makeTicket('t1', 'A0'));
    expect(get_queue_length('s1')).toBe(1);
    add_to_queue('s1', makeTicket('t2', 'A1'));
    expect(get_queue_length('s1')).toBe(2);
  });

  it('queues are independent per service', () => {
    add_to_queue('s1', makeTicket('t1', 'A0'));
    add_to_queue('s2', makeTicket('t3', 'B0'));
    expect(get_queue_length('s1')).toBe(1);
    expect(get_queue_length('s2')).toBe(1);
  });

  it('clear_queue removes the queue', () => {
    add_to_queue('s1', makeTicket('t1', 'A0'));
    expect(get_queue_length('s1')).toBe(1);
    clear_queue('s1');
    expect(get_queue_length('s1')).toBe(0);
  });
});
