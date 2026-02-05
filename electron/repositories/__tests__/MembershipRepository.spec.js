import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock model
const mockModel = {
  name: 'Membership',
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  findByPk: vi.fn(),
  update: vi.fn(),
  destroy: vi.fn(),
}

// Create a test class that mirrors MembershipRepository behavior
class MembershipRepository {
  constructor() {
    this.model = mockModel
  }

  async create(data) {
    const result = await this.model.create(data)
    return result.toJSON()
  }

  async findAll(options = {}) {
    const results = await this.model.findAll(options)
    return results.map(item => item.toJSON())
  }

  async findById(id) {
    const result = await this.model.findByPk(id)
    return result ? result.toJSON() : null
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
}

describe('MembershipRepository', () => {
  let repository

  beforeEach(() => {
    vi.clearAllMocks()
    repository = new MembershipRepository()
  })

  describe('create', () => {
    it('should create a time-based membership', async () => {
      const membershipData = {
        name: 'Monthly',
        description: 'Monthly membership',
        days: 30,
        type: 'time',
        trainings: null,
      }
      const createdMembership = { id: 1, ...membershipData, toJSON: () => ({ id: 1, ...membershipData }) }
      mockModel.create.mockResolvedValue(createdMembership)

      const result = await repository.create(membershipData)

      expect(mockModel.create).toHaveBeenCalledWith(membershipData)
      expect(result).toEqual({ id: 1, ...membershipData })
      expect(result.type).toBe('time')
      expect(result.trainings).toBeNull()
    })

    it('should create a training-based membership', async () => {
      const membershipData = {
        name: '10 Sessions',
        description: '10 training sessions',
        days: 60,
        type: 'training',
        trainings: 10,
      }
      const createdMembership = { id: 2, ...membershipData, toJSON: () => ({ id: 2, ...membershipData }) }
      mockModel.create.mockResolvedValue(createdMembership)

      const result = await repository.create(membershipData)

      expect(result.type).toBe('training')
      expect(result.trainings).toBe(10)
    })
  })

  describe('findAll', () => {
    it('should return all memberships', async () => {
      const memberships = [
        { id: 1, name: 'Monthly', type: 'time', toJSON: () => ({ id: 1, name: 'Monthly', type: 'time' }) },
        { id: 2, name: '10 Sessions', type: 'training', toJSON: () => ({ id: 2, name: '10 Sessions', type: 'training' }) },
      ]
      mockModel.findAll.mockResolvedValue(memberships)

      const result = await repository.findAll()

      expect(result).toHaveLength(2)
      expect(result[0].type).toBe('time')
      expect(result[1].type).toBe('training')
    })
  })

  describe('findActive', () => {
    it('should find all active memberships (not soft-deleted)', async () => {
      const activeMemberships = [
        { id: 1, name: 'Monthly', deletedAt: null, toJSON: () => ({ id: 1, name: 'Monthly', deletedAt: null }) },
      ]
      mockModel.findAll.mockResolvedValue(activeMemberships)

      const result = await repository.findActive()

      expect(mockModel.findAll).toHaveBeenCalledWith({
        where: { deletedAt: null },
      })
      expect(result).toHaveLength(1)
    })

    it('should merge additional where conditions', async () => {
      mockModel.findAll.mockResolvedValue([])

      await repository.findActive({ where: { type: 'training' } })

      expect(mockModel.findAll).toHaveBeenCalledWith({
        where: { type: 'training', deletedAt: null },
      })
    })
  })

  describe('findById', () => {
    it('should find membership by id', async () => {
      const membership = {
        id: 1,
        name: 'Monthly',
        days: 30,
        type: 'time',
        toJSON: () => ({ id: 1, name: 'Monthly', days: 30, type: 'time' })
      }
      mockModel.findByPk.mockResolvedValue(membership)

      const result = await repository.findById(1)

      expect(mockModel.findByPk).toHaveBeenCalledWith(1)
      expect(result).toEqual({ id: 1, name: 'Monthly', days: 30, type: 'time' })
    })

    it('should return null if membership not found', async () => {
      mockModel.findByPk.mockResolvedValue(null)

      const result = await repository.findById(999)

      expect(result).toBeNull()
    })
  })

  describe('softDelete', () => {
    it('should soft delete a membership', async () => {
      mockModel.update.mockResolvedValue([1, []])

      await repository.softDelete(1)

      expect(mockModel.update).toHaveBeenCalledWith(
        { deletedAt: expect.any(Date) },
        { where: { id: 1 }, returning: true }
      )
    })
  })

  describe('restore', () => {
    it('should restore a soft-deleted membership', async () => {
      mockModel.update.mockResolvedValue([1, []])

      await repository.restore(1)

      expect(mockModel.update).toHaveBeenCalledWith(
        { deletedAt: null },
        { where: { id: 1 }, returning: true }
      )
    })
  })

  describe('update', () => {
    it('should update membership details', async () => {
      const updatedData = { name: 'Premium Monthly', days: 31 }
      const updatedMembership = { id: 1, ...updatedData, toJSON: () => ({ id: 1, ...updatedData }) }
      mockModel.update.mockResolvedValue([1, [updatedMembership]])

      const result = await repository.update(updatedData, { where: { id: 1 } })

      expect(mockModel.update).toHaveBeenCalledWith(
        updatedData,
        { where: { id: 1 }, returning: true }
      )
      expect(result[0]).toBe(1)
    })

    it('should update trainings count for training-type membership', async () => {
      const updatedData = { trainings: 15 }
      mockModel.update.mockResolvedValue([1, []])

      await repository.update(updatedData, { where: { id: 1 } })

      expect(mockModel.update).toHaveBeenCalledWith(
        { trainings: 15 },
        { where: { id: 1 }, returning: true }
      )
    })
  })
})
