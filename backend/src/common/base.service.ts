import { BaseRepository } from './base.repository';
import { DeepPartial, FindManyOptions, ObjectLiteral } from 'typeorm';

export abstract class BaseService<T extends ObjectLiteral> {
  constructor(protected repository: BaseRepository<T>) {}

  async findById(id: string): Promise<T | null> {
    return this.repository.findById(id);
  }

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.findAll(options);
  }

  async create(data: DeepPartial<T>): Promise<T> {
    return this.repository.create(data);
  }

  async update(id: string, data: DeepPartial<T>): Promise<T | null> {
    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}