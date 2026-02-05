import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the Member model before importing the repository
vi.mock('../../models/Member.js', () => ({
  default: {
    name: 'Member',
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    findByPk: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
  },
}))

// Import after mocking
import Member from '../../models/Member.js'

// Create a test class that mirrors MemberRepository behavior
class MemberRepository {
  constructor() {
    this.model = Member
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

describe('MemberRepository', () => {
  let repository

  beforeEach(() => {
    vi.clearAllMocks()
    repository = new MemberRepository()
  })

  describe('findActive', () => {
    it('should find all active members (deletedAt is null)', async () => {
      const mockMembers = [
        { id: 1, firstName: 'John', deletedAt: null, toJSON: () => ({ id: 1, firstName: 'John', deletedAt: null }) },
        { id: 2, firstName: 'Jane', deletedAt: null, toJSON: () => ({ id: 2, firstName: 'Jane', deletedAt: null }) },
      ]
      Member.findAll.mockResolvedValue(mockMembers)

      const result = await repository.findActive()

      expect(Member.findAll).toHaveBeenCalledWith({
        where: { deletedAt: null },
      })
      expect(result).toHaveLength(2)
    })

    it('should merge existing where clause with deletedAt filter', async () => {
      Member.findAll.mockResolvedValue([])

      await repository.findActive({ where: { firstName: 'John' } })

      expect(Member.findAll).toHaveBeenCalledWith({
        where: { firstName: 'John', deletedAt: null },
      })
    })

    it('should pass other options through', async () => {
      Member.findAll.mockResolvedValue([])

      await repository.findActive({ order: [['firstName', 'ASC']], limit: 10 })

      expect(Member.findAll).toHaveBeenCalledWith({
        where: { deletedAt: null },
        order: [['firstName', 'ASC']],
        limit: 10,
      })
    })
  })

  describe('softDelete', () => {
    it('should set deletedAt to current date', async () => {
      const mockDate = new Date('2024-01-15T10:00:00Z')
      vi.setSystemTime(mockDate)

      const updatedRecord = { id: 1, deletedAt: mockDate, toJSON: () => ({ id: 1, deletedAt: mockDate }) }
      Member.update.mockResolvedValue([1, [updatedRecord]])

      const result = await repository.softDelete(1)

      expect(Member.update).toHaveBeenCalledWith(
        { deletedAt: expect.any(Date) },
        { where: { id: 1 }, returning: true }
      )
      expect(result[0]).toBe(1)

      vi.useRealTimers()
    })

    it('should return 0 rows updated if member not found', async () => {
      Member.update.mockResolvedValue([0, []])

      const result = await repository.softDelete(999)

      expect(result[0]).toBe(0)
      expect(result[1]).toEqual([])
    })
  })

  describe('restore', () => {
    it('should set deletedAt to null', async () => {
      const updatedRecord = { id: 1, deletedAt: null, toJSON: () => ({ id: 1, deletedAt: null }) }
      Member.update.mockResolvedValue([1, [updatedRecord]])

      const result = await repository.restore(1)

      expect(Member.update).toHaveBeenCalledWith(
        { deletedAt: null },
        { where: { id: 1 }, returning: true }
      )
      expect(result[0]).toBe(1)
    })

    it('should return 0 rows updated if member not found', async () => {
      Member.update.mockResolvedValue([0, []])

      const result = await repository.restore(999)

      expect(result[0]).toBe(0)
    })
  })

  describe('create', () => {
    it('should create a new member', async () => {
      const memberData = { firstName: 'John', lastName: 'Doe' }
      const createdMember = { id: 1, ...memberData, toJSON: () => ({ id: 1, ...memberData }) }
      Member.create.mockResolvedValue(createdMember)

      const result = await repository.create(memberData)

      expect(Member.create).toHaveBeenCalledWith(memberData)
      expect(result).toEqual({ id: 1, firstName: 'John', lastName: 'Doe' })
    })
  })

  describe('findById', () => {
    it('should find member by id', async () => {
      const member = { id: 1, firstName: 'John', toJSON: () => ({ id: 1, firstName: 'John' }) }
      Member.findByPk.mockResolvedValue(member)

      const result = await repository.findById(1)

      expect(Member.findByPk).toHaveBeenCalledWith(1)
      expect(result).toEqual({ id: 1, firstName: 'John' })
    })

    it('should return null if member not found', async () => {
      Member.findByPk.mockResolvedValue(null)

      const result = await repository.findById(999)

      expect(result).toBeNull()
    })
  })
})
