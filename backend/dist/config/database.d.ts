import mysql from 'mysql2/promise';
declare class Database {
    private static instance;
    pool: mysql.Pool | null;
    private config;
    constructor();
    static getInstance(): Database;
    connect(): Promise<void>;
    query(sql: string, params?: any[]): Promise<any>;
    transaction<T>(callback: (connection: mysql.PoolConnection) => Promise<T>): Promise<T>;
    private initializeTables;
    close(): Promise<void>;
}
declare const database: Database;
export declare const createConnection: () => Promise<void>;
export declare const connectDatabase: () => Promise<void>;
export declare const query: (sql: string, params?: any[]) => Promise<any>;
export declare const transaction: <T>(callback: (connection: mysql.PoolConnection) => Promise<T>) => Promise<T>;
export declare const closeDatabase: () => Promise<void>;
export default database;
//# sourceMappingURL=database.d.ts.map