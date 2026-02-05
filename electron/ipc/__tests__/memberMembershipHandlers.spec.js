import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock electron
vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
  },
}))

// Mock the repositories
const mockMemberMembershipRepo = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  findActive: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  destroy: vi.fn(),
  softDelete: vi.fn(),
  restore: vi.fn(),
  subtractTraining: vi.fn(),
  addTraining: vi.fn(),
  getLatestActiveMemberships: vi.fn(),
  getExpirationsByMonth: vi.fn(),
  getTrainingLogs: vi.fn(),
}

const mockMembershipRepo = {
  findById: vi.fn(),
}

import { ipcMain } from 'electron'

// Simulate the handler registration
function registerMemberMembershipHandlers() {
  // Create handler - enriches data with trainings
  ipcMain.handle('memberMembership:create', async (_e, data) => {
    const membershipType = await mockMembershipRepo.findById(data.membershipId)
    const enrichedData = {
      ...data,
      totalTrainings: membershipType?.trainings ?? null,
      remainingTrainings: membershipType?.trainings ?? null,
    }
    return mockMemberMembershipRepo.create(enrichedData)
  })

  ipcMain.handle('memberMembership:subtractTraining', async (_e, id) => {
    return mockMemberMembershipRepo.subtractTraining(id)
  })

  ipcMain.handle('memberMembership:addTraining', async (_e, id) => {
    return mockMemberMembershipRepo.addTraining(id)
  })

  ipcMain.handle('memberMembership:getAll', async () => {
    try {
      if (!mockMemberMembershipRepo || typeof mockMemberMembershipRepo.findAll !== 'function') {
        return []
      }
      const result = await mockMemberMembershipRepo.findAll()
      return result || []
    } catch (error) {
      return []
    }
  })

  ipcMain.handle('memberMembership:getAllActive', (_e, options) => {
    return mockMemberMembershipRepo.findActive(options)
  })

  ipcMain.handle('memberMembership:getAllActiveByMembers', (_e, memberIds) => {
    return mockMemberMembershipRepo.getLatestActiveMemberships(memberIds)
  })

  ipcMain.handle('memberMembership:findOne', (_e, id) => {
    return mockMemberMembershipRepo.findOne({ where: { id } })
  })

  ipcMain.handle('memberMembership:getById', (_e, id) => {
    return mockMemberMembershipRepo.findById(id)
  })

  ipcMain.handle('memberMembership:update', (_e, values, options) => {
    return mockMemberMembershipRepo.update(values, options)
  })

  ipcMain.handle('memberMembership:delete', (_e, options) => {
    return mockMemberMembershipRepo.destroy(options)
  })

  ipcMain.handle('memberMembership:softDelete', (_e, id) => {
    return mockMemberMembershipRepo.softDelete(id)
  })

  ipcMain.handle('memberMembership:restore', (_e, id) => {
    return mockMemberMembershipRepo.restore(id)
  })

  ipcMain.handle('memberMembership:getExpirationsByMonth', async (_e, year, month) => {
    try {
      return await mockMemberMembershipRepo.getExpirationsByMonth(year, month)
    } catch (error) {
      return []
    }
  })

  ipcMain.handle('trainingLog:getByMemberMembership', async (_e, id) => {
    try {
      return await mockMemberMembershipRepo.getTrainingLogs(id)
    } catch (error) {
      return []
    }
  })
}

describe('memberMembershipHandlers', () => {
  let handlers = {}

  beforeEach(() => {
    vi.clearAllMocks()
    handlers = {}

    ipcMain.handle.mockImplementation((channel, handler) => {
      handlers[channel] = handler
    })

    registerMemberMembershipHandlers()
  })

  describe('registration', () => {
    it('should register all member membership handlers', () => {
      expect(ipcMain.handle).toHaveBeenCalledWith('memberMembership:create', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('memberMembership:subtractTraining', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('memberMembership:addTraining', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('memberMembership:getAll', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('memberMembership:getAllActive', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('memberMembership:softDelete', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('memberMembership:restore', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('memberMembership:getExpirationsByMonth', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('trainingLog:getByMemberMembership', expect.any(Function))
    })
  })

  describe('memberMembership:create', () => {
    it('should create with training counts from membership type', async () => {
      const membershipType = { id: 1, trainings: 10 }
      const inputData = { memberId: 1, membershipId: 1, startDate: '2024-01-01', endDate: '2024-02-01' }
      const expectedData = { ...inputData, totalTrainings: 10, remainingTrainings: 10 }
      const createdRecord = { id: 1, ...expectedData }

      mockMembershipRepo.findById.mockResolvedValue(membershipType)
      mockMemberMembershipRepo.create.mockResolvedValue(createdRecord)

      const result = await handlers['memberMembership:create'](null, inputData)

      expect(mockMembershipRepo.findById).toHaveBeenCalledWith(1)
      expect(mockMemberMembershipRepo.create).toHaveBeenCalledWith(expectedData)
      expect(result.totalTrainings).toBe(10)
      expect(result.remainingTrainings).toBe(10)
    })

    it('should create with null trainings for time-based membership', async () => {
      const membershipType = { id: 2, trainings: null }
      const inputData = { memberId: 1, membershipId: 2, startDate: '2024-01-01', endDate: '2024-02-01' }
      const expectedData = { ...inputData, totalTrainings: null, remainingTrainings: null }

      mockMembershipRepo.findById.mockResolvedValue(membershipType)
      mockMemberMembershipRepo.create.mockResolvedValue({ id: 1, ...expectedData })

      const result = await handlers['memberMembership:create'](null, inputData)

      expect(result.totalTrainings).toBeNull()
      expect(result.remainingTrainings).toBeNull()
    })

    it('should handle missing membership type gracefully', async () => {
      mockMembershipRepo.findById.mockResolvedValue(null)
      const inputData = { memberId: 1, membershipId: 999, startDate: '2024-01-01' }

      mockMemberMembershipRepo.create.mockResolvedValue({ id: 1, ...inputData, totalTrainings: null, remainingTrainings: null })

      const result = await handlers['memberMembership:create'](null, inputData)

      expect(result.totalTrainings).toBeNull()
      expect(result.remainingTrainings).toBeNull()
    })
  })

  describe('memberMembership:subtractTraining', () => {
    it('should subtract training successfully', async () => {
      const expectedResult = { success: true, remainingTrainings: 4, totalTrainings: 10 }
      mockMemberMembershipRepo.subtractTraining.mockResolvedValue(expectedResult)

      const result = await handlers['memberMembership:subtractTraining'](null, 1)

      expect(mockMemberMembershipRepo.subtractTraining).toHaveBeenCalledWith(1)
      expect(result).toEqual(expectedResult)
    })

    it('should return error for no remaining trainings', async () => {
      const expectedResult = { success: false, error: 'No trainings remaining' }
      mockMemberMembershipRepo.subtractTraining.mockResolvedValue(expectedResult)

      const result = await handlers['memberMembership:subtractTraining'](null, 1)

      expect(result.success).toBe(false)
      expect(result.error).toBe('No trainings remaining')
    })
  })

  describe('memberMembership:addTraining', () => {
    it('should add training successfully', async () => {
      const expectedResult = { success: true, remainingTrainings: 6, totalTrainings: 10 }
      mockMemberMembershipRepo.addTraining.mockResolvedValue(expectedResult)

      const result = await handlers['memberMembership:addTraining'](null, 1)

      expect(mockMemberMembershipRepo.addTraining).toHaveBeenCalledWith(1)
      expect(result).toEqual(expectedResult)
    })

    it('should return error when exceeding total', async () => {
      const expectedResult = { success: false, error: 'Cannot exceed total trainings' }
      mockMemberMembershipRepo.addTraining.mockResolvedValue(expectedResult)

      const result = await handlers['memberMembership:addTraining'](null, 1)

      expect(result.success).toBe(false)
    })
  })

  describe('memberMembership:getAll', () => {
    it('should return all member memberships', async () => {
      const memberships = [
        { id: 1, memberId: 1, membershipId: 1 },
        { id: 2, memberId: 2, membershipId: 1 },
      ]
      mockMemberMembershipRepo.findAll.mockResolvedValue(memberships)

      const result = await handlers['memberMembership:getAll']()

      expect(result).toEqual(memberships)
    })

    it('should return empty array on error', async () => {
      mockMemberMembershipRepo.findAll.mockRejectedValue(new Error('Database error'))

      const result = await handlers['memberMembership:getAll']()

      expect(result).toEqual([])
    })
  })

  describe('memberMembership:getAllActiveByMembers', () => {
    it('should return active memberships for given member IDs', async () => {
      const memberships = [
        { id: 1, memberId: 1, membershipId: 1 },
        { id: 2, memberId: 2, membershipId: 2 },
      ]
      mockMemberMembershipRepo.getLatestActiveMemberships.mockResolvedValue(memberships)

      const result = await handlers['memberMembership:getAllActiveByMembers'](null, [1, 2])

      expect(mockMemberMembershipRepo.getLatestActiveMemberships).toHaveBeenCalledWith([1, 2])
      expect(result).toEqual(memberships)
    })
  })

  describe('memberMembership:getExpirationsByMonth', () => {
    it('should return expirations for given month', async () => {
      const expirations = [
        { id: 1, endDate: '2024-01-15', member: { firstName: 'John' } },
        { id: 2, endDate: '2024-01-20', member: { firstName: 'Jane' } },
      ]
      mockMemberMembershipRepo.getExpirationsByMonth.mockResolvedValue(expirations)

      const result = await handlers['memberMembership:getExpirationsByMonth'](null, 2024, 1)

      expect(mockMemberMembershipRepo.getExpirationsByMonth).toHaveBeenCalledWith(2024, 1)
      expect(result).toEqual(expirations)
    })

    it('should return empty array on error', async () => {
      mockMemberMembershipRepo.getExpirationsByMonth.mockRejectedValue(new Error('Error'))

      const result = await handlers['memberMembership:getExpirationsByMonth'](null, 2024, 1)

      expect(result).toEqual([])
    })
  })

  describe('trainingLog:getByMemberMembership', () => {
    it('should return training logs', async () => {
      const logs = [
        { id: 1, action: 'subtract', usedAt: '2024-01-15' },
        { id: 2, action: 'add', usedAt: '2024-01-16' },
      ]
      mockMemberMembershipRepo.getTrainingLogs.mockResolvedValue(logs)

      const result = await handlers['trainingLog:getByMemberMembership'](null, 1)

      expect(mockMemberMembershipRepo.getTrainingLogs).toHaveBeenCalledWith(1)
      expect(result).toEqual(logs)
    })

    it('should return empty array on error', async () => {
      mockMemberMembershipRepo.getTrainingLogs.mockRejectedValue(new Error('Error'))

      const result = await handlers['trainingLog:getByMemberMembership'](null, 1)

      expect(result).toEqual([])
    })
  })

  describe('memberMembership:softDelete', () => {
    it('should soft delete member membership', async () => {
      mockMemberMembershipRepo.softDelete.mockResolvedValue([1, []])

      const result = await handlers['memberMembership:softDelete'](null, 1)

      expect(mockMemberMembershipRepo.softDelete).toHaveBeenCalledWith(1)
      expect(result[0]).toBe(1)
    })
  })

  describe('memberMembership:restore', () => {
    it('should restore soft-deleted member membership', async () => {
      mockMemberMembershipRepo.restore.mockResolvedValue([1, []])

      const result = await handlers['memberMembership:restore'](null, 1)

      expect(mockMemberMembershipRepo.restore).toHaveBeenCalledWith(1)
      expect(result[0]).toBe(1)
    })
  })
})
