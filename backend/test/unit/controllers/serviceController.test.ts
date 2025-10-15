import { getAllServices, getServiceById, getQueueLength } from '../../../src/controllers/serviceController';

jest.mock('../../../src/repositories/serviceRepository', () => {
  return {
    serviceRepository: jest.fn().mockImplementation(() => ({
      getAllServices: jest.fn(() => Promise.resolve([{ service_id: 's1', tag_name: 'A', average_service_time: 5, description: null }])),
      getServiceById: jest.fn((id: string) => Promise.resolve({ service_id: id, tag_name: 'A', average_service_time: 5, description: null })),
    })),
  };
});

jest.mock('../../../src/services/queueServices', () => ({
  get_queue_length: jest.fn(() => 4),
}));

describe('serviceController', () => {
  it('getAllServices returns DTO array', async () => {
    const res = await getAllServices();
    expect(Array.isArray(res)).toBe(true);
    expect(res[0].serviceId).toBe('s1');
  });

  it('getServiceById returns DTO', async () => {
    const res = await getServiceById('s1');
    expect(res).not.toBeNull();
    expect(res?.serviceId).toBe('s1');
  });

  it('getQueueLength returns a number', async () => {
    const len = await getQueueLength('s1');
    expect(typeof len).toBe('number');
    expect(len).toBe(4);
  });

  it('getQueueLength throws when service not found', async () => {
    const svcModule = require('../../../src/repositories/serviceRepository');
    // mock implementation to return null
    svcModule.serviceRepository.mockImplementation(() => ({ getServiceById: jest.fn(() => Promise.resolve(null)) }));

    await expect(getQueueLength('notfound')).rejects.toThrow('Service not found');
  });
});
