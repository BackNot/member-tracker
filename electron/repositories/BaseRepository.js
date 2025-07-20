/**
 * Base Repository - Abstract repository class for database operations
 */

class BaseRepository {
  constructor(model) {
    if (this.constructor === BaseRepository) {
      throw new Error('BaseRepository is an abstract class and cannot be instantiated directly');
    }
    this.model = model;
  }

  /**
   * Create a new record
   * @param data - Data to create
   * @returns Created record
   */
  async create(data) {
    try {
      const result = await this.model.create(data);
      return result.toJSON();
    } catch (err) {
      console.error(`Error creating ${this.model.name}:`, err);
      throw err;
    }
  }

  /**
   * Find all records matching the provided options
   * @param options - Query options
   * @returns List of records
   */
  async findAll(options = {}) {
    try {
      const results = await this.model.findAll(options);
      return results.map(item => item.toJSON());
    } catch (err) {
      console.error(`Error finding ${this.model.name} records:`, err);
      throw err;
    }
  }

  /**
   * Find a single record by options
   * @param options - Query options
   * @returns Found record or null
   */
  async findOne(options = {}) {
    try {
      const result = await this.model.findOne(options);
      return result ? result.toJSON() : null;
    } catch (err) {
      console.error(`Error finding ${this.model.name} record:`, err);
      throw err;
    }
  }

  /**
   * Find a record by its primary key
   * @param id - Primary key
   * @returns Found record or null
   */
  async findById(id) {
    try {
      const result = await this.model.findByPk(id);
      return result ? result.toJSON() : null;
    } catch (err) {
      console.error(`Error finding ${this.model.name} by ID:`, err);
      throw err;
    }
  }

  /**
   * Update a record
   * @param data - Data to update
   * @param options - Query options
   * @returns [rowsUpdated, updatedRecords]
   */
async update(data, options) {
  try {
    const [rowsUpdated, updatedRecords] = await this.model.update(data, {
      ...options,
      returning: true,
    });
    
    return [
      rowsUpdated,
      Array.isArray(updatedRecords) 
        ? updatedRecords.map(record => record.toJSON()) 
        : []
    ];
  } catch (err) {
    console.error(`Error updating ${this.model.name}:`, err);
    throw err;
  }
}

  /**
   * Delete records
   * @param options - Query options
   * @returns Number of deleted records
   */
  async destroy(options) {
    try {
      const count = await this.model.destroy(options);
      return { count };
    } catch (err) {
      console.error(`Error deleting ${this.model.name} records:`, err);
      throw err;
    }
  }
}

export default BaseRepository; 