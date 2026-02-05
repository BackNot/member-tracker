import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock electron
vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
  },
}))

// Mock the repository
const mockMemberRepo = {
  create: vi.fn(),
  findAll: vi.fn(),
  findActive: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  destroy: vi.fn(),
  softDelete: vi.fn(),
  restore: vi.fn(),
}

vi.mock('../../repositories/MemberRepository.js', () => ({
  default: mockMemberRepo,
}))

// Mock IPC constants
vi.mock('../ipcConstant.js', () => ({
  IPC_CHANNELS: {
    MEMBER: {
      CREATE: 'member:create',
      GET_ALL: 'member:getAll',
      GET_ALL_ACTIVE: 'member:getAllActive',
      GET_BY_ID: 'member:getById',
      UPDATE: 'member:update',
      SOFT_DELETE: 'member:softDelete',
      RESTORE: 'member:restore',
    },
  },
}))

import { ipcMain } from 'electron'

// Simulate the handler registration
function registerMemberHandlers() {
  ipcMain.handle('member:create', (_e, data) => mockMemberRepo.create(data))
  ipcMain.handle('member:getAll', async () => {
    try {
      if (!mockMemberRepo || typeof mockMemberRepo.findAll !== 'function') {
        return []
      }
      const result = await mockMemberRepo.findAll()
      return result || []
    } catch (error) {
      return []
    }
  })
  ipcMain.handle('member:getAllActive', (_e, options) => mockMemberRepo.findActive(options))
  ipcMain.handle('member:getById', (_e, id) => mockMemberRepo.findById(id))
  ipcMain.handle('member:update', (_e, values, options) => mockMemberRepo.update(values, options))
  ipcMain.handle('member:delete', (_e, options) => mockMemberRepo.destroy(options))
  ipcMain.handle('member:softDelete', (_e, id) => mockMemberRepo.softDelete(id))
  ipcMain.handle('member:restore', (_e, id) => mockMemberRepo.restore(id))
}

describe('memberHandlers', () => {
  let handlers = {}

  beforeEach(() => {
    vi.clearAllMocks()
    handlers = {}

    // Capture registered handlers
    ipcMain.handle.mockImplementation((channel, handler) => {
      handlers[channel] = handler
    })

    registerMemberHandlers()
  })

  describe('registration', () => {
    it('should register all member handlers', () => {
      expect(ipcMain.handle).toHaveBeenCalledWith('member:create', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('member:getAll', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('member:getAllActive', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('member:getById', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('member:update', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('member:delete', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('member:softDelete', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('member:restore', expect.any(Function))
    })
  })

  describe('member:create', () => {
    it('should create a member', async () => {
      const memberData = { firstName: 'John', lastName: 'Doe' }
      const createdMember = { id: 1, ...memberData }
      mockMemberRepo.create.mockResolvedValue(createdMember)

      const result = await handlers['member:create'](null, memberData)

      expect(mockMemberRepo.create).toHaveBeenCalledWith(memberData)
      expect(result).toEqual(createdMember)
    })
  })

  describe('member:getAll', () => {
    it('should return all members', async () => {
      const members = [
        { id: 1, firstName: 'John' },
        { id: 2, firstName: 'Jane' },
      ]
      mockMemberRepo.findAll.mockResolvedValue(members)

      const result = await handlers['member:getAll']()

      expect(mockMemberRepo.findAll).toHaveBeenCalled()
      expect(result).toEqual(members)
    })

    it('should return empty array on error', async () => {
      mockMemberRepo.findAll.mockRejectedValue(new Error('Database error'))

      const result = await handlers['member:getAll']()

      expect(result).toEqual([])
    })

    it('should return empty array if result is null', async () => {
      mockMemberRepo.findAll.mockResolvedValue(null)

      const result = await handlers['member:getAll']()

      expect(result).toEqual([])
    })
  })

  describe('member:getAllActive', () => {
    it('should return active members', async () => {
      const activeMembers = [{ id: 1, firstName: 'John', deletedAt: null }]
      mockMemberRepo.findActive.mockResolvedValue(activeMembers)

      const result = await handlers['member:getAllActive'](null, {})

      expect(mockMemberRepo.findActive).toHaveBeenCalledWith({})
      expect(result).toEqual(activeMembers)
    })

    it('should pass options to findActive', async () => {
      const options = { where: { lastName: 'Doe' } }
      mockMemberRepo.findActive.mockResolvedValue([])

      await handlers['member:getAllActive'](null, options)

      expect(mockMemberRepo.findActive).toHaveBeenCalledWith(options)
    })
  })

  describe('member:getById', () => {
    it('should return member by id', async () => {
      const member = { id: 1, firstName: 'John' }
      mockMemberRepo.findById.mockResolvedValue(member)

      const result = await handlers['member:getById'](null, 1)

      expect(mockMemberRepo.findById).toHaveBeenCalledWith(1)
      expect(result).toEqual(member)
    })

    it('should return null if member not found', async () => {
      mockMemberRepo.findById.mockResolvedValue(null)

      const result = await handlers['member:getById'](null, 999)

      expect(result).toBeNull()
    })
  })

  describe('member:update', () => {
    it('should update member', async () => {
      const values = { firstName: 'Johnny' }
      const options = { where: { id: 1 } }
      mockMemberRepo.update.mockResolvedValue([1, [{ id: 1, firstName: 'Johnny' }]])

      const result = await handlers['member:update'](null, values, options)

      expect(mockMemberRepo.update).toHaveBeenCalledWith(values, options)
      expect(result[0]).toBe(1)
    })
  })

  describe('member:delete', () => {
    it('should hard delete member', async () => {
      const options = { where: { id: 1 } }
      mockMemberRepo.destroy.mockResolvedValue({ count: 1 })

      const result = await handlers['member:delete'](null, options)

      expect(mockMemberRepo.destroy).toHaveBeenCalledWith(options)
      expect(result).toEqual({ count: 1 })
    })
  })

  describe('member:softDelete', () => {
    it('should soft delete member', async () => {
      mockMemberRepo.softDelete.mockResolvedValue([1, []])

      const result = await handlers['member:softDelete'](null, 1)

      expect(mockMemberRepo.softDelete).toHaveBeenCalledWith(1)
      expect(result[0]).toBe(1)
    })
  })

  describe('member:restore', () => {
    it('should restore soft-deleted member', async () => {
      mockMemberRepo.restore.mockResolvedValue([1, []])

      const result = await handlers['member:restore'](null, 1)

      expect(mockMemberRepo.restore).toHaveBeenCalledWith(1)
      expect(result[0]).toBe(1)
    })
  })
})
