import { describe, it, expect, vi, beforeEach } from 'vitest'
import BaseRepository from '../BaseRepository.js'

// Create a concrete implementation for testing
class TestRepository extends BaseRepository {
  constructor(model) {
    super(model)
  }
}

// Mock Sequelize model
const createMockModel = () => ({
  name: 'TestModel',
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  findByPk: vi.fn(),
  update: vi.fn(),
  destroy: vi.fn(),
})

describe('BaseRepository', () => {
  let mockModel
  let repository

  beforeEach(() => {
    mockModel = createMockModel()
    repository = new TestRepository(mockModel)
  })

  describe('constructor', () => {
    it('should throw error when instantiating BaseRepository directly', () => {
      expect(() => new BaseRepository(mockModel)).toThrow(
        'BaseRepository is an abstract class and cannot be instantiated directly'
      )
    })

    it('should allow instantiation of child class', () => {
      expect(() => new TestRepository(mockModel)).not.toThrow()
    })
  })

  describe('create', () => {
    it('should create a record and return JSON', async () => {
      const inputData = { name: 'Test' }
      const createdRecord = { id: 1, name: 'Test', toJSON: () => ({ id: 1, name: 'Test' }) }
      mockModel.create.mockResolvedValue(createdRecord)

      const result = await repository.create(inputData)

      expect(mockModel.create).toHaveBeenCalledWith(inputData)
      expect(result).toEqual({ id: 1, name: 'Test' })
    })

    it('should throw error on create failure', async () => {
      mockModel.create.mockRejectedValue(new Error('Create failed'))

      await expect(repository.create({})).rejects.toThrow('Create failed')
    })
  })

  describe('findAll', () => {
    it('should find all records and return JSON array', async () => {
      const records = [
        { id: 1, name: 'Test1', toJSON: () => ({ id: 1, name: 'Test1' }) },
        { id: 2, name: 'Test2', toJSON: () => ({ id: 2, name: 'Test2' }) },
      ]
      mockModel.findAll.mockResolvedValue(records)

      const result = await repository.findAll()

      expect(mockModel.findAll).toHaveBeenCalledWith({})
      expect(result).toEqual([
        { id: 1, name: 'Test1' },
        { id: 2, name: 'Test2' },
      ])
    })

    it('should pass options to findAll', async () => {
      mockModel.findAll.mockResolvedValue([])
      const options = { where: { active: true } }

      await repository.findAll(options)

      expect(mockModel.findAll).toHaveBeenCalledWith(options)
    })

    it('should throw error on findAll failure', async () => {
      mockModel.findAll.mockRejectedValue(new Error('Find failed'))

      await expect(repository.findAll()).rejects.toThrow('Find failed')
    })
  })

  describe('findOne', () => {
    it('should find one record and return JSON', async () => {
      const record = { id: 1, name: 'Test', toJSON: () => ({ id: 1, name: 'Test' }) }
      mockModel.findOne.mockResolvedValue(record)

      const result = await repository.findOne({ where: { id: 1 } })

      expect(result).toEqual({ id: 1, name: 'Test' })
    })

    it('should return null when record not found', async () => {
      mockModel.findOne.mockResolvedValue(null)

      const result = await repository.findOne({ where: { id: 999 } })

      expect(result).toBeNull()
    })

    it('should throw error on findOne failure', async () => {
      mockModel.findOne.mockRejectedValue(new Error('Find failed'))

      await expect(repository.findOne({})).rejects.toThrow('Find failed')
    })
  })

  describe('findById', () => {
    it('should find record by primary key', async () => {
      const record = { id: 1, name: 'Test', toJSON: () => ({ id: 1, name: 'Test' }) }
      mockModel.findByPk.mockResolvedValue(record)

      const result = await repository.findById(1)

      expect(mockModel.findByPk).toHaveBeenCalledWith(1)
      expect(result).toEqual({ id: 1, name: 'Test' })
    })

    it('should return null when record not found by id', async () => {
      mockModel.findByPk.mockResolvedValue(null)

      const result = await repository.findById(999)

      expect(result).toBeNull()
    })

    it('should throw error on findById failure', async () => {
      mockModel.findByPk.mockRejectedValue(new Error('Find failed'))

      await expect(repository.findById(1)).rejects.toThrow('Find failed')
    })
  })

  describe('update', () => {
    it('should update record and return result', async () => {
      const updatedRecords = [
        { id: 1, name: 'Updated', toJSON: () => ({ id: 1, name: 'Updated' }) },
      ]
      mockModel.update.mockResolvedValue([1, updatedRecords])

      const result = await repository.update({ name: 'Updated' }, { where: { id: 1 } })

      expect(mockModel.update).toHaveBeenCalledWith(
        { name: 'Updated' },
        { where: { id: 1 }, returning: true }
      )
      expect(result).toEqual([1, [{ id: 1, name: 'Updated' }]])
    })

    it('should return empty array when no records updated', async () => {
      mockModel.update.mockResolvedValue([0, []])

      const result = await repository.update({ name: 'Updated' }, { where: { id: 999 } })

      expect(result).toEqual([0, []])
    })

    it('should handle non-array updatedRecords', async () => {
      mockModel.update.mockResolvedValue([1, null])

      const result = await repository.update({ name: 'Updated' }, { where: { id: 1 } })

      expect(result).toEqual([1, []])
    })

    it('should throw error on update failure', async () => {
      mockModel.update.mockRejectedValue(new Error('Update failed'))

      await expect(repository.update({}, {})).rejects.toThrow('Update failed')
    })
  })

  describe('destroy', () => {
    it('should delete records and return count', async () => {
      mockModel.destroy.mockResolvedValue(1)

      const result = await repository.destroy({ where: { id: 1 } })

      expect(mockModel.destroy).toHaveBeenCalledWith({ where: { id: 1 } })
      expect(result).toEqual({ count: 1 })
    })

    it('should return 0 count when no records deleted', async () => {
      mockModel.destroy.mockResolvedValue(0)

      const result = await repository.destroy({ where: { id: 999 } })

      expect(result).toEqual({ count: 0 })
    })

    it('should throw error on destroy failure', async () => {
      mockModel.destroy.mockRejectedValue(new Error('Delete failed'))

      await expect(repository.destroy({})).rejects.toThrow('Delete failed')
    })
  })
})
