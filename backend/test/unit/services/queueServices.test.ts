import { add_to_queue, clear_queue, get_queue_length, take_from_queue, emitter } from '../../../src/services/queueServices';

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

  describe('take_from_queue', () => {
    it('returns undefined when queue does not exist', () => {
      const result = take_from_queue('nonexistent_service');
      expect(result).toBeUndefined();
    });

    it('returns undefined when queue is empty', () => {
      add_to_queue('s1', makeTicket('t1', 'A0'));
      take_from_queue('s1');
      
      const result = take_from_queue('s1');
      expect(result).toBeUndefined();
    });

    it('takes ticket from queue in FIFO order and emits events', () => {
      const ticket1 = makeTicket('t1', 'A0');
      const ticket2 = makeTicket('t2', 'A1');
      
      const queueUpdatedSpy = jest.fn();
      const ticketCalledSpy = jest.fn();
      emitter.on('queue_updated', queueUpdatedSpy);
      emitter.on('ticket_called', ticketCalledSpy);

      add_to_queue('s1', ticket1);
      add_to_queue('s1', ticket2);
      expect(get_queue_length('s1')).toBe(2);

      const result = take_from_queue('s1');
      
      expect(result).toEqual(ticket1);
      expect(get_queue_length('s1')).toBe(1);

      expect(queueUpdatedSpy).toHaveBeenCalledWith({ 
        serviceId: 's1', 
        length: 1 
      });
      
      expect(ticketCalledSpy).toHaveBeenCalledWith({ 
        serviceId: 's1', 
        ticket: ticket1 
      });

      emitter.removeListener('queue_updated', queueUpdatedSpy);
      emitter.removeListener('ticket_called', ticketCalledSpy);
    });

    it('handles multiple takes from queue correctly', () => {
      const ticket1 = makeTicket('t1', 'A0');
      const ticket2 = makeTicket('t2', 'A1');
      const ticket3 = makeTicket('t3', 'A2');

      add_to_queue('s1', ticket1);
      add_to_queue('s1', ticket2);
      add_to_queue('s1', ticket3);
      expect(get_queue_length('s1')).toBe(3);

      const first = take_from_queue('s1');
      expect(first).toEqual(ticket1);
      expect(get_queue_length('s1')).toBe(2);

      const second = take_from_queue('s1');
      expect(second).toEqual(ticket2);
      expect(get_queue_length('s1')).toBe(1);

      const third = take_from_queue('s1');
      expect(third).toEqual(ticket3);
      expect(get_queue_length('s1')).toBe(0);

      const empty = take_from_queue('s1');
      expect(empty).toBeUndefined();
    });

    it('emits ticket_called event with correct ticket data', () => {
      const ticket = makeTicket('t1', 'A0');
      
      const ticketCalledSpy = jest.fn();
      emitter.on('ticket_called', ticketCalledSpy);

      add_to_queue('s1', ticket);
      const result = take_from_queue('s1');
      
      expect(result).toEqual(ticket);
      expect(ticketCalledSpy).toHaveBeenCalledTimes(1);
      expect(ticketCalledSpy).toHaveBeenCalledWith({ 
        serviceId: 's1', 
        ticket: ticket 
      });

      emitter.removeListener('ticket_called', ticketCalledSpy);
    });

    it('does not emit ticket_called when shift returns undefined', () => {
      const ticketCalledSpy = jest.fn();
      const queueUpdatedSpy = jest.fn();
      
      emitter.on('ticket_called', ticketCalledSpy);
      emitter.on('queue_updated', queueUpdatedSpy);

      const ticket = makeTicket('t1', 'A0');
      add_to_queue('s1', ticket);
      
      const originalShift = Array.prototype.shift;
      Array.prototype.shift = jest.fn().mockReturnValueOnce(undefined);

      const result = take_from_queue('s1');
      
      expect(result).toBeUndefined();
      expect(queueUpdatedSpy).toHaveBeenCalled(); 
      expect(ticketCalledSpy).not.toHaveBeenCalled(); 

      Array.prototype.shift = originalShift;
      
      emitter.removeListener('ticket_called', ticketCalledSpy);
      emitter.removeListener('queue_updated', queueUpdatedSpy);
    });
  });
});
