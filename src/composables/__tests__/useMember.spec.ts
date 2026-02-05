import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useMember } from '../useMember'

// Mock window.electron
const mockInvoke = vi.fn()

describe('useMember', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      electron: {
        ipcRenderer: {
          invoke: mockInvoke,
        },
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all members successfully', async () => {
      const mockMembers = [
        { id: 1, firstName: 'John', lastName: 'Doe' },
        { id: 2, firstName: 'Jane', lastName: 'Smith' },
      ]
      mockInvoke.mockResolvedValueOnce(mockMembers)

      const { members, loading, message, getAll } = useMember()

      expect(loading.value).toBe(false)

      const promise = getAll()
      expect(loading.value).toBe(true)

      await promise

      expect(loading.value).toBe(false)
      expect(members.value).toEqual(mockMembers)
      expect(message.value).toBe('Loaded 2 members')
      expect(mockInvoke).toHaveBeenCalledWith('member:getAll')
    })

    it('should handle errors when fetching members', async () => {
      mockInvoke.mockRejectedValueOnce(new Error('Database error'))

      const { members, message, getAll } = useMember()

      await getAll()

      expect(members.value).toEqual([])
      expect(message.value).toBe('Error loading members: Database error')
    })
  })

  describe('create', () => {
    it('should create a member successfully', async () => {
      const newMember = { firstName: 'John', lastName: 'Doe' }
      const createdMember = { id: 1, ...newMember }
      mockInvoke.mockResolvedValueOnce(createdMember)

      const { message, create } = useMember()

      const result = await create(newMember)

      expect(result).toEqual(createdMember)
      expect(message.value).toBe('Member created successfully')
      expect(mockInvoke).toHaveBeenCalledWith('member:create', newMember)
    })

    it('should handle errors when creating a member', async () => {
      mockInvoke.mockRejectedValueOnce(new Error('Validation error'))

      const { message, create } = useMember()

      const result = await create({ firstName: '' })

      expect(result).toBeNull()
      expect(message.value).toBe('Error creating member: Validation error')
    })
  })

  describe('softDelete', () => {
    it('should soft delete a member successfully', async () => {
      mockInvoke.mockResolvedValueOnce({ success: true })

      const { message, softDelete } = useMember()

      const result = await softDelete(1)

      expect(result).toEqual({ success: true })
      expect(message.value).toBe('Member deleted successfully')
      expect(mockInvoke).toHaveBeenCalledWith('member:softDelete', 1)
    })

    it('should handle errors when deleting a member', async () => {
      mockInvoke.mockRejectedValueOnce(new Error('Not found'))

      const { message, softDelete } = useMember()

      const result = await softDelete(999)

      expect(result).toBeNull()
      expect(message.value).toBe('Error deleting member: Not found')
    })
  })

  describe('restore', () => {
    it('should restore a member successfully', async () => {
      mockInvoke.mockResolvedValueOnce({ success: true })

      const { message, restore } = useMember()

      const result = await restore(1)

      expect(result).toEqual({ success: true })
      expect(message.value).toBe('Member restored successfully')
      expect(mockInvoke).toHaveBeenCalledWith('member:restore', 1)
    })
  })

  describe('when IPC is not available', () => {
    it('should set error message when ipc is not available', async () => {
      vi.stubGlobal('window', {})

      const { message, getAll } = useMember()

      await getAll()

      expect(message.value).toBe('Error: Electron IPC not available')
    })
  })
})
