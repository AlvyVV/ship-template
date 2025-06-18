import { PostgrestClient } from '@supabase/postgrest-js';

function getPgClient() {
  return new PostgrestClient(process.env.PG_API_URL!);
}

// 将 snake_case 转换为 camelCase
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

// 将 camelCase 转换为 snake_case
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

// 转换对象的键从 snake_case 到 camelCase
function convertKeysToCamelCase(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToCamelCase);
  }
  
  if (typeof obj === 'object' && obj.constructor === Object) {
    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = toCamelCase(key);
      converted[camelKey] = convertKeysToCamelCase(value);
    }
    return converted;
  }
  
  return obj;
}

// 转换对象的键从 camelCase 到 snake_case
function convertKeysToSnakeCase(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToSnakeCase);
  }
  
  if (typeof obj === 'object' && obj.constructor === Object) {
    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = toSnakeCase(key);
      converted[snakeKey] = convertKeysToSnakeCase(value);
    }
    return converted;
  }
  
  return obj;
}

// 包装 Supabase 查询构建器
class WrappedQueryBuilder {
  private builder: any;

  constructor(builder: any) {
    this.builder = builder;
  }

  select(columns?: string, options?: { count?: "exact" | "planned" | "estimated", head?: boolean }) {
    return new WrappedQueryBuilder(this.builder.select(columns, options));
  }

  eq(column: string, value: any) {
    const snakeColumn = toSnakeCase(column);
    return new WrappedQueryBuilder(this.builder.eq(snakeColumn, value));
  }

  neq(column: string, value: any) {
    const snakeColumn = toSnakeCase(column);
    return new WrappedQueryBuilder(this.builder.neq(snakeColumn, value));
  }

  gt(column: string, value: any) {
    const snakeColumn = toSnakeCase(column);
    return new WrappedQueryBuilder(this.builder.gt(snakeColumn, value));
  }

  gte(column: string, value: any) {
    const snakeColumn = toSnakeCase(column);
    return new WrappedQueryBuilder(this.builder.gte(snakeColumn, value));
  }

  lt(column: string, value: any) {
    const snakeColumn = toSnakeCase(column);
    return new WrappedQueryBuilder(this.builder.lt(snakeColumn, value));
  }

  lte(column: string, value: any) {
    const snakeColumn = toSnakeCase(column);
    return new WrappedQueryBuilder(this.builder.lte(snakeColumn, value));
  }

  like(column: string, pattern: string) {
    const snakeColumn = toSnakeCase(column);
    return new WrappedQueryBuilder(this.builder.like(snakeColumn, pattern));
  }

  ilike(column: string, pattern: string) {
    const snakeColumn = toSnakeCase(column);
    return new WrappedQueryBuilder(this.builder.ilike(snakeColumn, pattern));
  }

  in(column: string, values: any[]) {
    const snakeColumn = toSnakeCase(column);
    return new WrappedQueryBuilder(this.builder.in(snakeColumn, values));
  }

  order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }) {
    const snakeColumn = toSnakeCase(column);
    return new WrappedQueryBuilder(this.builder.order(snakeColumn, options));
  }

  limit(count: number) {
    return new WrappedQueryBuilder(this.builder.limit(count));
  }

  offset(count: number) {
    return new WrappedQueryBuilder(this.builder.offset(count));
  }

  range(from: number, to: number) {
    return new WrappedQueryBuilder(this.builder.range(from, to));
  }

  single() {
    return new WrappedQueryBuilder(this.builder.single());
  }

  maybeSingle() {
    return new WrappedQueryBuilder(this.builder.maybeSingle());
  }

  // 执行查询并转换结果
  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2> {
    return this.builder.then(
      (result: any) => {
        if (result.data) {
          result.data = convertKeysToCamelCase(result.data);
        }
        return onfulfilled ? onfulfilled(result) : result;
      },
      onrejected
    );
  }
}

// 包装 Supabase 客户端
class WrappedSupabaseClient {
  private client: PostgrestClient;

  constructor(client: PostgrestClient) {
    this.client = client;
  }

  from(table: string) {
    return {
      select: (columns?: string, options?: { count?: "exact" | "planned" | "estimated", head?: boolean }) => {
        return new WrappedQueryBuilder(this.client.from(table).select(columns, options));
      },
      
      insert: async (values: any | any[]) => {
        const snakeValues = convertKeysToSnakeCase(values);
        const result = await this.client.from(table).insert(snakeValues);
        if (result.data) {
          result.data = convertKeysToCamelCase(result.data);
        }
        return result;
      },
      
      update: (values: any) => {
        const snakeValues = convertKeysToSnakeCase(values);
        return new WrappedUpdateBuilder(this.client.from(table).update(snakeValues));
      },
      
      upsert: async (values: any | any[]) => {
        const snakeValues = convertKeysToSnakeCase(values);
        const result = await this.client.from(table).upsert(snakeValues);
        if (result.data) {
          result.data = convertKeysToCamelCase(result.data);
        }
        return result;
      },
      
      delete: () => {
        return new WrappedDeleteBuilder(this.client.from(table).delete());
      }
    };
  }
}

// 包装更新构建器
class WrappedUpdateBuilder {
  private builder: any;

  constructor(builder: any) {
    this.builder = builder;
  }

  eq(column: string, value: any) {
    const snakeColumn = toSnakeCase(column);
    return new WrappedUpdateBuilder(this.builder.eq(snakeColumn, value));
  }

  neq(column: string, value: any) {
    const snakeColumn = toSnakeCase(column);
    return new WrappedUpdateBuilder(this.builder.neq(snakeColumn, value));
  }

  gt(column: string, value: any) {
    const snakeColumn = toSnakeCase(column);
    return new WrappedUpdateBuilder(this.builder.gt(snakeColumn, value));
  }

  gte(column: string, value: any) {
    const snakeColumn = toSnakeCase(column);
    return new WrappedUpdateBuilder(this.builder.gte(snakeColumn, value));
  }

  lt(column: string, value: any) {
    const snakeColumn = toSnakeCase(column);
    return new WrappedUpdateBuilder(this.builder.lt(snakeColumn, value));
  }

  lte(column: string, value: any) {
    const snakeColumn = toSnakeCase(column);
    return new WrappedUpdateBuilder(this.builder.lte(snakeColumn, value));
  }

  like(column: string, pattern: string) {
    const snakeColumn = toSnakeCase(column);
    return new WrappedUpdateBuilder(this.builder.like(snakeColumn, pattern));
  }

  ilike(column: string, pattern: string) {
    const snakeColumn = toSnakeCase(column);
    return new WrappedUpdateBuilder(this.builder.ilike(snakeColumn, pattern));
  }

  in(column: string, values: any[]) {
    const snakeColumn = toSnakeCase(column);
    return new WrappedUpdateBuilder(this.builder.in(snakeColumn, values));
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2> {
    return this.builder.then(
      (result: any) => {
        if (result.data) {
          result.data = convertKeysToCamelCase(result.data);
        }
        return onfulfilled ? onfulfilled(result) : result;
      },
      onrejected
    );
  }
}

// 包装删除构建器
class WrappedDeleteBuilder {
  private builder: any;

  constructor(builder: any) {
    this.builder = builder;
  }

  eq(column: string, value: any) {
    const snakeColumn = toSnakeCase(column);
    return new WrappedDeleteBuilder(this.builder.eq(snakeColumn, value));
  }

  neq(column: string, value: any) {
    const snakeColumn = toSnakeCase(column);
    return new WrappedDeleteBuilder(this.builder.neq(snakeColumn, value));
  }

  gt(column: string, value: any) {
    const snakeColumn = toSnakeCase(column);
    return new WrappedDeleteBuilder(this.builder.gt(snakeColumn, value));
  }

  gte(column: string, value: any) {
    const snakeColumn = toSnakeCase(column);
    return new WrappedDeleteBuilder(this.builder.gte(snakeColumn, value));
  }

  lt(column: string, value: any) {
    const snakeColumn = toSnakeCase(column);
    return new WrappedDeleteBuilder(this.builder.lt(snakeColumn, value));
  }

  lte(column: string, value: any) {
    const snakeColumn = toSnakeCase(column);
    return new WrappedDeleteBuilder(this.builder.lte(snakeColumn, value));
  }

  like(column: string, pattern: string) {
    const snakeColumn = toSnakeCase(column);
    return new WrappedDeleteBuilder(this.builder.like(snakeColumn, pattern));
  }

  ilike(column: string, pattern: string) {
    const snakeColumn = toSnakeCase(column);
    return new WrappedDeleteBuilder(this.builder.ilike(snakeColumn, pattern));
  }

  in(column: string, values: any[]) {
    const snakeColumn = toSnakeCase(column);
    return new WrappedDeleteBuilder(this.builder.in(snakeColumn, values));
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2> {
    return this.builder.then(
      (result: any) => {
        if (result.data) {
          result.data = convertKeysToCamelCase(result.data);
        }
        return onfulfilled ? onfulfilled(result) : result;
      },
      onrejected
    );
  }
}

export function getPgWrapperClient() {
  const supabaseUrl = process.env.SUPABASE_URL || "";

  let supabaseKey = process.env.SUPABASE_ANON_KEY || "";
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  }

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or key is not set");
  }

  const client = getPgClient();
  return new WrappedSupabaseClient(client);
}

// 导出转换函数，以备需要时手动使用
export { convertKeysToCamelCase, convertKeysToSnakeCase, toCamelCase, toSnakeCase };