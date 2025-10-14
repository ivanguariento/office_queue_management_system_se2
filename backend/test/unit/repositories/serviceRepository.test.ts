jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      serviceType: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    })),
  };
});

import { serviceRepository } from '../../../src/repositories/serviceRepository';

describe('serviceRepository', () => {
  it('getAllServices returns list from prisma', async () => {
    const { PrismaClient } = require('@prisma/client');
    const tx = { serviceType: { findMany: jest.fn().mockResolvedValue([{ service_id: 's1', tag_name: 'A', average_service_time: 5 }]) } };
    PrismaClient.mockImplementation(() => tx);

    const repo = new serviceRepository();
    const res = await repo.getAllServices();
    expect(Array.isArray(res)).toBe(true);
    expect(res[0].service_id).toBe('s1');
  });

  it('getServiceById returns single service or null', async () => {
    const { PrismaClient } = require('@prisma/client');
    const tx = { serviceType: { findUnique: jest.fn().mockResolvedValue({ service_id: 's1', tag_name: 'A', average_service_time: 5 }) } };
    PrismaClient.mockImplementation(() => tx);

    const repo = new serviceRepository();
    const res = await repo.getServiceById('s1');
    expect(res).not.toBeNull();
    expect(res?.service_id).toBe('s1');
  });
});
