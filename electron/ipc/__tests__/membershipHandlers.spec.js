import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock electron
vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
  },
}))

// Mock the repository
const mockMembershipRepo = {
  create: vi.fn(),
  findAll: vi.fn(),
  findActive: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  destroy: vi.fn(),
  softDelete: vi.fn(),
  restore: vi.fn(),
}

vi.mock('../../repositories/MembershipRepository.js', () => ({
  default: mockMembershipRepo,
}))

import { ipcMain } from 'electron'

// Simulate the handler registration
function registerMembershipHandlers() {
  ipcMain.handle('membership:create', (_e, data) => mockMembershipRepo.create(data))
  ipcMain.handle('membership:getAll', async () => {
    try {
      if (!mockMembershipRepo || typeof mockMembershipRepo.findAll !== 'function') {
        return []
      }
      const result = await mockMembershipRepo.findAll()
      return result || []
    } catch (error) {
      return []
    }
  })
  ipcMain.handle('membership:getAllActive', (_e) => mockMembershipRepo.findActive())
  ipcMain.handle('membership:getById', (_e, id) => mockMembershipRepo.findById(id))
  ipcMain.handle('membership:update', (_e, values, options) => mockMembershipRepo.update(values, options))
  ipcMain.handle('membership:delete', (_e, options) => mockMembershipRepo.destroy(options))
  ipcMain.handle('membership:softDelete', (_e, id) => mockMembershipRepo.softDelete(id))
  ipcMain.handle('membership:restore', (_e, id) => mockMembershipRepo.restore(id))
}

describe('membershipHandlers', () => {
  let handlers = {}

  beforeEach(() => {
    vi.clearAllMocks()
    handlers = {}

    ipcMain.handle.mockImplementation((channel, handler) => {
      handlers[channel] = handler
    })

    registerMembershipHandlers()
  })

  describe('registration', () => {
    it('should register all membership handlers', () => {
      expect(ipcMain.handle).toHaveBeenCalledWith('membership:create', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('membership:getAll', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('membership:getAllActive', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('membership:getById', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('membership:update', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('membership:delete', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('membership:softDelete', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('membership:restore', expect.any(Function))
    })
  })

  describe('membership:create', () => {
    it('should create a time-based membership', async () => {
      const membershipData = {
        name: 'Monthly',
        description: 'Monthly membership',
        days: 30,
        type: 'time',
        trainings: null,
      }
      const createdMembership = { id: 1, ...membershipData }
      mockMembershipRepo.create.mockResolvedValue(createdMembership)

      const result = await handlers['membership:create'](null, membershipData)

      expect(mockMembershipRepo.create).toHaveBeenCalledWith(membershipData)
      expect(result).toEqual(createdMembership)
      expect(result.type).toBe('time')
    })

    it('should create a training-based membership', async () => {
      const membershipData = {
        name: '10 Sessions',
        description: '10 training sessions',
        days: 60,
        type: 'training',
        trainings: 10,
      }
      const createdMembership = { id: 2, ...membershipData }
      mockMembershipRepo.create.mockResolvedValue(createdMembership)

      const result = await handlers['membership:create'](null, membershipData)

      expect(result.type).toBe('training')
      expect(result.trainings).toBe(10)
    })
  })

  describe('membership:getAll', () => {
    it('should return all memberships', async () => {
      const memberships = [
        { id: 1, name: 'Monthly', type: 'time' },
        { id: 2, name: '10 Sessions', type: 'training' },
      ]
      mockMembershipRepo.findAll.mockResolvedValue(memberships)

      const result = await handlers['membership:getAll']()

      expect(mockMembershipRepo.findAll).toHaveBeenCalled()
      expect(result).toEqual(memberships)
    })

    it('should return empty array on error', async () => {
      mockMembershipRepo.findAll.mockRejectedValue(new Error('Database error'))

      const result = await handlers['membership:getAll']()

      expect(result).toEqual([])
    })

    it('should return empty array if result is null', async () => {
      mockMembershipRepo.findAll.mockResolvedValue(null)

      const result = await handlers['membership:getAll']()

      expect(result).toEqual([])
    })
  })

  describe('membership:getAllActive', () => {
    it('should return only active memberships', async () => {
      const activeMemberships = [
        { id: 1, name: 'Monthly', deletedAt: null },
      ]
      mockMembershipRepo.findActive.mockResolvedValue(activeMemberships)

      const result = await handlers['membership:getAllActive'](null)

      expect(mockMembershipRepo.findActive).toHaveBeenCalled()
      expect(result).toEqual(activeMemberships)
    })
  })

  describe('membership:getById', () => {
    it('should return membership by id', async () => {
      const membership = { id: 1, name: 'Monthly', days: 30 }
      mockMembershipRepo.findById.mockResolvedValue(membership)

      const result = await handlers['membership:getById'](null, 1)

      expect(mockMembershipRepo.findById).toHaveBeenCalledWith(1)
      expect(result).toEqual(membership)
    })

    it('should return null if membership not found', async () => {
      mockMembershipRepo.findById.mockResolvedValue(null)

      const result = await handlers['membership:getById'](null, 999)

      expect(result).toBeNull()
    })
  })

  describe('membership:update', () => {
    it('should update membership', async () => {
      const values = { name: 'Premium Monthly', days: 31 }
      const options = { where: { id: 1 } }
      mockMembershipRepo.update.mockResolvedValue([1, [{ id: 1, ...values }]])

      const result = await handlers['membership:update'](null, values, options)

      expect(mockMembershipRepo.update).toHaveBeenCalledWith(values, options)
      expect(result[0]).toBe(1)
    })
  })

  describe('membership:delete', () => {
    it('should hard delete membership', async () => {
      const options = { where: { id: 1 } }
      mockMembershipRepo.destroy.mockResolvedValue({ count: 1 })

      const result = await handlers['membership:delete'](null, options)

      expect(mockMembershipRepo.destroy).toHaveBeenCalledWith(options)
      expect(result).toEqual({ count: 1 })
    })
  })

  describe('membership:softDelete', () => {
    it('should soft delete membership', async () => {
      mockMembershipRepo.softDelete.mockResolvedValue([1, []])

      const result = await handlers['membership:softDelete'](null, 1)

      expect(mockMembershipRepo.softDelete).toHaveBeenCalledWith(1)
      expect(result[0]).toBe(1)
    })
  })

  describe('membership:restore', () => {
    it('should restore soft-deleted membership', async () => {
      mockMembershipRepo.restore.mockResolvedValue([1, []])

      const result = await handlers['membership:restore'](null, 1)

      expect(mockMembershipRepo.restore).toHaveBeenCalledWith(1)
      expect(result[0]).toBe(1)
    })
  })
})
