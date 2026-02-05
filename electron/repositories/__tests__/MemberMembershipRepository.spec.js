import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock TrainingLog model
const mockTrainingLog = {
  create: vi.fn(),
  findAll: vi.fn(),
}

// Mock MemberMembership model
const mockModel = {
  name: 'MemberMembership',
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  findByPk: vi.fn(),
  update: vi.fn(),
  destroy: vi.fn(),
  sequelize: {
    fn: vi.fn(),
    col: vi.fn(),
    models: {
      Member: {},
    },
  },
}

// Create a test class that mirrors MemberMembershipRepository behavior
class MemberMembershipRepository {
  constructor() {
    this.model = mockModel
  }

  async findById(id) {
    const result = await this.model.findByPk(id)
    return result ? result.toJSON() : null
  }

  async findAll(options = {}) {
    const results = await this.model.findAll(options)
    return results.map(item => item.toJSON())
  }

  async update(data, options) {
    const [rowsUpdated, updatedRecords] = await this.model.update(data, {
      ...options,
      returning: true,
    })
    return [
      rowsUpdated,
      Array.isArray(updatedRecords) ? updatedRecords.map(r => r.toJSON()) : [],
    ]
  }

  async findActive(options = {}) {
    const whereClause = options.where || {}
    whereClause.deletedAt = null
    return this.findAll({ ...options, where: whereClause })
  }

  async softDelete(id) {
    return this.update({ deletedAt: new Date() }, { where: { id } })
  }

  async restore(id) {
    return this.update({ deletedAt: null }, { where: { id } })
  }

  async subtractTraining(memberMembershipId) {
    const membership = await this.findById(memberMembershipId)

    if (!membership) {
      return { success: false, error: 'Member membership not found' }
    }

    if (membership.remainingTrainings === null) {
      return { success: true, message: 'Trainings not tracked for this membership' }
    }

    if (membership.remainingTrainings <= 0) {
      return { success: false, error: 'No trainings remaining' }
    }

    const newRemaining = membership.remainingTrainings - 1
    await this.update(
      { remainingTrainings: newRemaining },
      { where: { id: memberMembershipId } }
    )

    await mockTrainingLog.create({
      memberMembershipId: memberMembershipId,
      usedAt: new Date(),
      action: 'subtract',
    })

    return {
      success: true,
      remainingTrainings: newRemaining,
      totalTrainings: membership.totalTrainings,
    }
  }

  async addTraining(memberMembershipId) {
    const membership = await this.findById(memberMembershipId)

    if (!membership) {
      return { success: false, error: 'Member membership not found' }
    }

    if (membership.remainingTrainings === null || membership.totalTrainings === null) {
      return { success: false, error: 'Trainings not tracked for this membership' }
    }

    if (membership.remainingTrainings >= membership.totalTrainings) {
      return { success: false, error: 'Cannot exceed total trainings' }
    }

    const newRemaining = membership.remainingTrainings + 1
    await this.update(
      { remainingTrainings: newRemaining },
      { where: { id: memberMembershipId } }
    )

    await mockTrainingLog.create({
      memberMembershipId: memberMembershipId,
      usedAt: new Date(),
      action: 'add',
    })

    return {
      success: true,
      remainingTrainings: newRemaining,
      totalTrainings: membership.totalTrainings,
    }
  }

  async getTrainingLogs(memberMembershipId) {
    const logs = await mockTrainingLog.findAll({
      where: { memberMembershipId },
      order: [['usedAt', 'DESC']],
    })
    return logs.map(log => log.toJSON())
  }
}

describe('MemberMembershipRepository', () => {
  let repository

  beforeEach(() => {
    vi.clearAllMocks()
    repository = new MemberMembershipRepository()
  })

  describe('subtractTraining', () => {
    it('should subtract one training from remaining', async () => {
      const membership = {
        id: 1,
        remainingTrainings: 5,
        totalTrainings: 10,
        toJSON: () => ({ id: 1, remainingTrainings: 5, totalTrainings: 10 }),
      }
      mockModel.findByPk.mockResolvedValue(membership)
      mockModel.update.mockResolvedValue([1, []])
      mockTrainingLog.create.mockResolvedValue({})

      const result = await repository.subtractTraining(1)

      expect(result.success).toBe(true)
      expect(result.remainingTrainings).toBe(4)
      expect(result.totalTrainings).toBe(10)
      expect(mockModel.update).toHaveBeenCalledWith(
        { remainingTrainings: 4 },
        { where: { id: 1 }, returning: true }
      )
      expect(mockTrainingLog.create).toHaveBeenCalledWith({
        memberMembershipId: 1,
        usedAt: expect.any(Date),
        action: 'subtract',
      })
    })

    it('should return error if membership not found', async () => {
      mockModel.findByPk.mockResolvedValue(null)

      const result = await repository.subtractTraining(999)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Member membership not found')
    })

    it('should return success with message if trainings not tracked (time-based)', async () => {
      const membership = {
        id: 1,
        remainingTrainings: null,
        totalTrainings: null,
        toJSON: () => ({ id: 1, remainingTrainings: null, totalTrainings: null }),
      }
      mockModel.findByPk.mockResolvedValue(membership)

      const result = await repository.subtractTraining(1)

      expect(result.success).toBe(true)
      expect(result.message).toBe('Trainings not tracked for this membership')
      expect(mockModel.update).not.toHaveBeenCalled()
    })

    it('should return error if no trainings remaining', async () => {
      const membership = {
        id: 1,
        remainingTrainings: 0,
        totalTrainings: 10,
        toJSON: () => ({ id: 1, remainingTrainings: 0, totalTrainings: 10 }),
      }
      mockModel.findByPk.mockResolvedValue(membership)

      const result = await repository.subtractTraining(1)

      expect(result.success).toBe(false)
      expect(result.error).toBe('No trainings remaining')
    })

    it('should subtract last training when remainingTrainings is 1', async () => {
      const membership = {
        id: 1,
        remainingTrainings: 1,
        totalTrainings: 10,
        toJSON: () => ({ id: 1, remainingTrainings: 1, totalTrainings: 10 }),
      }
      mockModel.findByPk.mockResolvedValue(membership)
      mockModel.update.mockResolvedValue([1, []])
      mockTrainingLog.create.mockResolvedValue({})

      const result = await repository.subtractTraining(1)

      expect(result.success).toBe(true)
      expect(result.remainingTrainings).toBe(0)
    })
  })

  describe('addTraining', () => {
    it('should add one training back', async () => {
      const membership = {
        id: 1,
        remainingTrainings: 5,
        totalTrainings: 10,
        toJSON: () => ({ id: 1, remainingTrainings: 5, totalTrainings: 10 }),
      }
      mockModel.findByPk.mockResolvedValue(membership)
      mockModel.update.mockResolvedValue([1, []])
      mockTrainingLog.create.mockResolvedValue({})

      const result = await repository.addTraining(1)

      expect(result.success).toBe(true)
      expect(result.remainingTrainings).toBe(6)
      expect(mockModel.update).toHaveBeenCalledWith(
        { remainingTrainings: 6 },
        { where: { id: 1 }, returning: true }
      )
      expect(mockTrainingLog.create).toHaveBeenCalledWith({
        memberMembershipId: 1,
        usedAt: expect.any(Date),
        action: 'add',
      })
    })

    it('should return error if membership not found', async () => {
      mockModel.findByPk.mockResolvedValue(null)

      const result = await repository.addTraining(999)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Member membership not found')
    })

    it('should return error if trainings not tracked', async () => {
      const membership = {
        id: 1,
        remainingTrainings: null,
        totalTrainings: null,
        toJSON: () => ({ id: 1, remainingTrainings: null, totalTrainings: null }),
      }
      mockModel.findByPk.mockResolvedValue(membership)

      const result = await repository.addTraining(1)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Trainings not tracked for this membership')
    })

    it('should return error if would exceed total trainings', async () => {
      const membership = {
        id: 1,
        remainingTrainings: 10,
        totalTrainings: 10,
        toJSON: () => ({ id: 1, remainingTrainings: 10, totalTrainings: 10 }),
      }
      mockModel.findByPk.mockResolvedValue(membership)

      const result = await repository.addTraining(1)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Cannot exceed total trainings')
    })

    it('should add training from 0 to 1', async () => {
      const membership = {
        id: 1,
        remainingTrainings: 0,
        totalTrainings: 10,
        toJSON: () => ({ id: 1, remainingTrainings: 0, totalTrainings: 10 }),
      }
      mockModel.findByPk.mockResolvedValue(membership)
      mockModel.update.mockResolvedValue([1, []])
      mockTrainingLog.create.mockResolvedValue({})

      const result = await repository.addTraining(1)

      expect(result.success).toBe(true)
      expect(result.remainingTrainings).toBe(1)
    })
  })

  describe('getTrainingLogs', () => {
    it('should return training logs for a membership', async () => {
      const logs = [
        { id: 1, action: 'subtract', usedAt: new Date(), toJSON: () => ({ id: 1, action: 'subtract' }) },
        { id: 2, action: 'add', usedAt: new Date(), toJSON: () => ({ id: 2, action: 'add' }) },
      ]
      mockTrainingLog.findAll.mockResolvedValue(logs)

      const result = await repository.getTrainingLogs(1)

      expect(mockTrainingLog.findAll).toHaveBeenCalledWith({
        where: { memberMembershipId: 1 },
        order: [['usedAt', 'DESC']],
      })
      expect(result).toHaveLength(2)
    })

    it('should return empty array if no logs', async () => {
      mockTrainingLog.findAll.mockResolvedValue([])

      const result = await repository.getTrainingLogs(999)

      expect(result).toEqual([])
    })
  })

  describe('findActive', () => {
    it('should find active member memberships', async () => {
      const memberships = [
        { id: 1, memberId: 1, membershipId: 1, deletedAt: null, toJSON: () => ({ id: 1 }) },
      ]
      mockModel.findAll.mockResolvedValue(memberships)

      const result = await repository.findActive()

      expect(mockModel.findAll).toHaveBeenCalledWith({
        where: { deletedAt: null },
      })
      expect(result).toHaveLength(1)
    })

    it('should merge additional options', async () => {
      mockModel.findAll.mockResolvedValue([])

      await repository.findActive({ where: { memberId: 5 } })

      expect(mockModel.findAll).toHaveBeenCalledWith({
        where: { memberId: 5, deletedAt: null },
      })
    })
  })

  describe('softDelete', () => {
    it('should soft delete a member membership', async () => {
      mockModel.update.mockResolvedValue([1, []])

      await repository.softDelete(1)

      expect(mockModel.update).toHaveBeenCalledWith(
        { deletedAt: expect.any(Date) },
        { where: { id: 1 }, returning: true }
      )
    })
  })

  describe('restore', () => {
    it('should restore a soft-deleted member membership', async () => {
      mockModel.update.mockResolvedValue([1, []])

      await repository.restore(1)

      expect(mockModel.update).toHaveBeenCalledWith(
        { deletedAt: null },
        { where: { id: 1 }, returning: true }
      )
    })
  })
})
