import { Injectable } from '@nestjs/common';
import { DeepPartial, Repository } from 'typeorm';
import { IDefaultResponse } from '../types/DefaultResponse';
import { DefaultMessages } from '../types/DefaultMessages';
import { ObjectID } from 'typeorm/driver/mongodb/typings';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { FindOptionsOrder } from 'typeorm/find-options/FindOptionsOrder';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Pagination } from '../types/Pagination';
import { httpExceptionHandler } from './htttpExceptionHandler';

@Injectable()
export class ServiceBase<T> {
  constructor(protected repository: Repository<T>) {}

  async getAll(input?: {
    where?: FindOptionsWhere<T>;
    order?: FindOptionsOrder<T>;
    include?: string[] | any;
    take?: number;
    page?: number;
  }): Promise<IDefaultResponse<Pagination<T>>> {
    const skipValue = input?.page === 1 ? 0 : input?.take * (input?.page - 1);
    const skip = input?.page ? skipValue : undefined;

    const [result, total] = await this.repository.findAndCount({
      where: input?.where ?? {},
      relations: input?.include ?? [],
      order: input?.order ?? undefined,
      take: input?.take || undefined,
      skip,
    });

    return {
      error: false,
      message: [DefaultMessages.QUERY_SUCCESS],
      data: {
        rows: result,
        count: total,
      },
    };
  }

  async count(input?: {
    where?: FindOptionsWhere<T>;
    order?: FindOptionsOrder<T>;
    include?: string[] | any;
    take?: number;
    page?: number;
  }): Promise<IDefaultResponse<number>> {
    const skipValue = input?.page === 1 ? 0 : input?.take * (input?.page - 1);
    const skip = input?.page ? skipValue : undefined;

    const data = await this.repository.count({
      where: input?.where ?? {},
      relations: input?.include ?? [],
      order: input?.order ?? undefined,
      take: input?.take || undefined,
      skip,
    });

    return {
      error: false,
      message: [DefaultMessages.QUERY_SUCCESS],
      data,
    };
  }

  async store(
    body: DeepPartial<T>,
    validateUnique?: boolean,
    validateUniqueValues?: {
      value: FindOptionsWhere<T>;
      columnName: string;
    }[],
    validateRelationship?: boolean,
    validateRelationshipValues?: {
      value: any;
      service: any;
    }[],
  ): Promise<IDefaultResponse<T>> {
    if (validateRelationship) {
      for (const item of validateRelationshipValues) {
        const response = await item.service.exists(item.value);

        if (!response) {
          return httpExceptionHandler(
            `Nenhum id com o valor ${item.value} encontrado, portanto, não foi possível realizar o relacionamento`,
          );
        }
      }
    }

    if (validateUnique) {
      for (const item of validateUniqueValues) {
        await this.validateUnique({
          where: item?.value,
          columnName: item?.columnName,
        });
      }
    }

    const newData = this.repository.create(body);
    await this.repository.save(newData);

    return {
      error: false,
      message: [DefaultMessages.CREATED],
      data: newData as T,
    };
  }

  async show(params: {
    where?: FindOptionsWhere<T>;
    include?: string[];
  }): Promise<IDefaultResponse<T>> {
    const { where, include } = params;
    await this.validateExists(where);

    const data = await this.repository.findOne({
      where: where ?? undefined,
      relations: include ?? [],
    });

    return {
      error: false,
      message: [DefaultMessages.QUERY_SUCCESS],
      data,
    };
  }

  async destroy(
    condition:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | ObjectID
      | ObjectID[]
      | FindOptionsWhere<T>,
  ): Promise<IDefaultResponse<T>> {
    const result = await this.repository.delete(condition);
    if (result.affected > 0) {
      return {
        error: false,
        message: [DefaultMessages.DELETED],
        data: null,
      };
    }

    return httpExceptionHandler(DefaultMessages.DATA_NOT_FOUND);
  }

  async update(input: {
    condition:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | ObjectID
      | ObjectID[]
      | FindOptionsWhere<T>;
    body: QueryDeepPartialEntity<T>;
    validateUnique?: boolean;
    validateUniqueValues?: {
      value: any;
      columnName: string;
    }[];
    validateRelationship?: boolean;
    validateRelationshipValues?: {
      value: any;
      service: any;
    }[];
  }): Promise<IDefaultResponse<T>> {
    const { validateUnique, validateUniqueValues } = input;
    if (validateUnique) {
      for (const item of validateUniqueValues) {
        await this.validateUnique({
          where: item?.value,
          columnName: item?.columnName,
          updating: true,
        });
      }
    }
    if (input.validateRelationship) {
      for (const item of input.validateRelationshipValues) {
        const response = await item.service.exists(item.value);
        if (!response) {
          return httpExceptionHandler(
            `Nenhum id com o valor ${item.value} encontrado, portanto, não foi possível realizar o relacionamento`,
          );
        }
      }
    }

    const result = await this.repository.update(input.condition, input.body);

    if (result.affected > 0) {
      const data = await this.repository.findOne({
        where: input.condition as any,
      });
      return {
        error: false,
        message: [DefaultMessages.UPDATED],
        data: data,
      };
    }

    return httpExceptionHandler(DefaultMessages.DATA_NOT_FOUND);
  }

  protected async validateExists(where: FindOptionsWhere<T>): Promise<void> {
    const data = await this.repository.findOne({ where: where });

    if (!data) {
      return httpExceptionHandler(DefaultMessages.DATA_NOT_FOUND);
    }
  }

  protected async validateUnique(input: {
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[];
    columnName: string;
    updating?: boolean;
    condition?:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | ObjectID
      | ObjectID[]
      | FindOptionsWhere<T>;
  }) {
    if (input.updating) {
      const original = await this.repository.findOne(input.condition as any);

      const response = await this.repository.findOne({
        where: input.where,
      });

      if (response && (response as any).id != (original as any).id) {
        return httpExceptionHandler(
          `${input.columnName} já está sendo utilizado`,
        );
      }
    } else {
      const response = await this.repository.findOne({
        where: input.where,
      });

      if (response) {
        return httpExceptionHandler(
          `${input.columnName} já está sendo utilizado`,
        );
      }
    }
  }

  async exists(where: FindOptionsWhere<T>): Promise<boolean> {
    const data = await this.repository.findOne({ where: where });
    return !!data;
  }
}
