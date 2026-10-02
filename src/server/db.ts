export type Parameter = string | number | null;
export interface Statement { sql: string; params?: Parameter[] }
export interface Result { results: Record<string, unknown>[]; changes: number }
export interface Database {
  all<T>(sql: string, params?: Parameter[]): Promise<T[]>;
  // All statements commit together or roll back together.
  batch(statements: Statement[]): Promise<Result[]>;
}

export class D1Adapter implements Database {
  constructor(private readonly db: D1Database) {}
  async all<T>(sql: string, params: Parameter[] = []): Promise<T[]> {
    const response = await this.db.prepare(sql).bind(...params).all<T>();
    return response.results;
  }
  async batch(statements: Statement[]): Promise<Result[]> {
    const response = await this.db.batch<Record<string, unknown>>(statements.map(s => this.db.prepare(s.sql).bind(...(s.params ?? []))));
    return response.map(r => ({ results: r.results, changes: r.meta.changes }));
  }
}
