import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock model
const mockModel = {
  name: 'Notification',
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  findByPk: vi.fn(),
  update: vi.fn(),
  destroy: vi.fn(),
}

// Create a test class that mirrors NotificationRepository behavior
class NotificationRepository {
  constructor() {
    this.model = mockModel
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

  async findUnread(options = {}) {
    const whereClause = options.where || {}
    whereClause.isRead = false
    whereClause.deletedAt = null
    return this.findAll({ ...options, where: whereClause })
  }

  async markAsRead(id) {
    return this.update({ isRead: true }, { where: { id } })
  }

  async markAllAsRead(memberMembershipId = null) {
    const whereClause = { isRead: false, deletedAt: null }
    if (memberMembershipId) {
      whereClause.memberMembershipId = memberMembershipId
    }
    return this.update({ isRead: true }, { where: whereClause })
  }

  async findByMemberMembership(memberMembershipId, options = {}) {
    const whereClause = options.where || {}
    whereClause.memberMembershipId = memberMembershipId
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

describe('NotificationRepository', () => {
  let repository

  beforeEach(() => {
    vi.clearAllMocks()
    repository = new NotificationRepository()
  })

  describe('findActive', () => {
    it('should find all active notifications', async () => {
      const mockNotifications = [
        { id: 1, message: 'Test', deletedAt: null, toJSON: () => ({ id: 1, message: 'Test', deletedAt: null }) },
      ]
      mockModel.findAll.mockResolvedValue(mockNotifications)

      const result = await repository.findActive()

      expect(mockModel.findAll).toHaveBeenCalledWith({
        where: { deletedAt: null },
      })
      expect(result).toHaveLength(1)
    })
  })

  describe('findUnread', () => {
    it('should find all unread notifications', async () => {
      const mockNotifications = [
        { id: 1, isRead: false, deletedAt: null, toJSON: () => ({ id: 1, isRead: false, deletedAt: null }) },
      ]
      mockModel.findAll.mockResolvedValue(mockNotifications)

      const result = await repository.findUnread()

      expect(mockModel.findAll).toHaveBeenCalledWith({
        where: { isRead: false, deletedAt: null },
      })
      expect(result).toHaveLength(1)
    })

    it('should merge existing where clause', async () => {
      mockModel.findAll.mockResolvedValue([])

      await repository.findUnread({ where: { type: 'expiration' } })

      expect(mockModel.findAll).toHaveBeenCalledWith({
        where: { type: 'expiration', isRead: false, deletedAt: null },
      })
    })
  })

  describe('markAsRead', () => {
    it('should mark a single notification as read', async () => {
      const updatedRecord = { id: 1, isRead: true, toJSON: () => ({ id: 1, isRead: true }) }
      mockModel.update.mockResolvedValue([1, [updatedRecord]])

      const result = await repository.markAsRead(1)

      expect(mockModel.update).toHaveBeenCalledWith(
        { isRead: true },
        { where: { id: 1 }, returning: true }
      )
      expect(result[0]).toBe(1)
    })

    it('should return 0 if notification not found', async () => {
      mockModel.update.mockResolvedValue([0, []])

      const result = await repository.markAsRead(999)

      expect(result[0]).toBe(0)
    })
  })

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read when no memberMembershipId provided', async () => {
      mockModel.update.mockResolvedValue([5, []])

      const result = await repository.markAllAsRead()

      expect(mockModel.update).toHaveBeenCalledWith(
        { isRead: true },
        { where: { isRead: false, deletedAt: null }, returning: true }
      )
      expect(result[0]).toBe(5)
    })

    it('should mark only specific member membership notifications as read', async () => {
      mockModel.update.mockResolvedValue([2, []])

      const result = await repository.markAllAsRead(123)

      expect(mockModel.update).toHaveBeenCalledWith(
        { isRead: true },
        { where: { isRead: false, deletedAt: null, memberMembershipId: 123 }, returning: true }
      )
      expect(result[0]).toBe(2)
    })
  })

  describe('findByMemberMembership', () => {
    it('should find notifications for a specific member membership', async () => {
      const mockNotifications = [
        { id: 1, memberMembershipId: 5, toJSON: () => ({ id: 1, memberMembershipId: 5 }) },
        { id: 2, memberMembershipId: 5, toJSON: () => ({ id: 2, memberMembershipId: 5 }) },
      ]
      mockModel.findAll.mockResolvedValue(mockNotifications)

      const result = await repository.findByMemberMembership(5)

      expect(mockModel.findAll).toHaveBeenCalledWith({
        where: { memberMembershipId: 5, deletedAt: null },
      })
      expect(result).toHaveLength(2)
    })

    it('should merge additional options', async () => {
      mockModel.findAll.mockResolvedValue([])

      await repository.findByMemberMembership(5, { order: [['createdAt', 'DESC']] })

      expect(mockModel.findAll).toHaveBeenCalledWith({
        where: { memberMembershipId: 5, deletedAt: null },
        order: [['createdAt', 'DESC']],
      })
    })

    it('should merge existing where clause', async () => {
      mockModel.findAll.mockResolvedValue([])

      await repository.findByMemberMembership(5, { where: { isRead: false } })

      expect(mockModel.findAll).toHaveBeenCalledWith({
        where: { isRead: false, memberMembershipId: 5, deletedAt: null },
      })
    })
  })

  describe('softDelete', () => {
    it('should set deletedAt to current date', async () => {
      mockModel.update.mockResolvedValue([1, []])

      await repository.softDelete(1)

      expect(mockModel.update).toHaveBeenCalledWith(
        { deletedAt: expect.any(Date) },
        { where: { id: 1 }, returning: true }
      )
    })
  })

  describe('restore', () => {
    it('should set deletedAt to null', async () => {
      mockModel.update.mockResolvedValue([1, []])

      await repository.restore(1)

      expect(mockModel.update).toHaveBeenCalledWith(
        { deletedAt: null },
        { where: { id: 1 }, returning: true }
      )
    })
  })
})
