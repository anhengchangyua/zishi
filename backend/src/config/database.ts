// backend/src/config/database.ts
import mysql from 'mysql2/promise'
// import logger from '../utils/logger'

interface DatabaseConfig {
  host: string
  port: number
  user: string
  password: string
  database: string
  connectionLimit: number
  // acquireTimeout: number
  // timeout: number
  // reconnect: boolean
}

class Database {
  private static instance: Database
  public pool: mysql.Pool | null = null
  private config: DatabaseConfig

  constructor() {
    this.config = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'zishi',
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
      // acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000'),
      // timeout: parseInt(process.env.DB_TIMEOUT || '60000'),
      // reconnect: true
    }
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }

  public async connect(): Promise<void> {
    try {
      this.pool = mysql.createPool({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        waitForConnections: true,
        connectionLimit: this.config.connectionLimit,
        queueLimit: 0,
        // acquireTimeout: this.config.acquireTimeout,
        // reconnect: this.config.reconnect,
        charset: 'utf8mb4',
        timezone: '+08:00',
        supportBigNumbers: true,
        bigNumberStrings: true,
        dateStrings: false
      })

      // 测试连接
      const connection = await this.pool.getConnection()
      await connection.ping()
      connection.release()

      console.log('Database connected successfully')
      
      // 初始化数据库表
      await this.initializeTables()
      
    } catch (error) {
      console.error('Database connection failed:', error)
      throw error
    }
  }

  public async query(sql: string, params?: any[]): Promise<any> {
    if (!this.pool) {
      throw new Error('Database not connected')
    }

    try {
      const [results] = await this.pool.execute(sql, params)
      return results
    } catch (error) {
      console.error('Database query failed:', { sql, params, error })
      throw error
    }
  }

  public async transaction<T>(callback: (connection: mysql.PoolConnection) => Promise<T>): Promise<T> {
    if (!this.pool) {
      throw new Error('Database not connected')
    }

    const connection = await this.pool.getConnection()
    
    try {
      await connection.beginTransaction()
      const result = await callback(connection)
      await connection.commit()
      return result
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  private async initializeTables(): Promise<void> {
    const tables = [
      // 用户表
      `CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        openid VARCHAR(100) UNIQUE NOT NULL,
        unionid VARCHAR(100),
        nickname VARCHAR(100),
        avatar VARCHAR(500),
        phone VARCHAR(20),
        gender TINYINT DEFAULT 0,
        points INT DEFAULT 0,
        membership_level ENUM('normal', 'vip', 'svip') DEFAULT 'normal',
        membership_expire_date DATETIME,
        status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_openid (openid),
        INDEX idx_phone (phone),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // 店铺表
      `CREATE TABLE IF NOT EXISTS stores (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(200) NOT NULL,
        address VARCHAR(500) NOT NULL,
        latitude DECIMAL(10, 7) NOT NULL,
        longitude DECIMAL(10, 7) NOT NULL,
        phone VARCHAR(20),
        business_hours JSON,
        facilities JSON,
        images JSON,
        description TEXT,
        rating DECIMAL(3, 2) DEFAULT 0.00,
        review_count INT DEFAULT 0,
        min_price DECIMAL(10, 2) DEFAULT 0.00,
        status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_location (latitude, longitude),
        INDEX idx_status (status),
        INDEX idx_rating (rating)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // 座位表
      `CREATE TABLE IF NOT EXISTS seats (
        id INT PRIMARY KEY AUTO_INCREMENT,
        store_id INT NOT NULL,
        seat_number VARCHAR(50) NOT NULL,
        seat_type ENUM('single', 'double', 'group') DEFAULT 'single',
        facilities JSON,
        hourly_price DECIMAL(10, 2) NOT NULL,
        daily_price DECIMAL(10, 2),
        description TEXT,
        status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
        INDEX idx_store_id (store_id),
        INDEX idx_status (status),
        UNIQUE KEY uk_store_seat (store_id, seat_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // 订单表
      `CREATE TABLE IF NOT EXISTS orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_no VARCHAR(50) UNIQUE NOT NULL,
        user_id INT NOT NULL,
        store_id INT NOT NULL,
        seat_id INT NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME NOT NULL,
        duration INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        discount_amount DECIMAL(10, 2) DEFAULT 0,
        final_amount DECIMAL(10, 2) NOT NULL,
        status ENUM('pending_payment', 'paid', 'confirmed', 'in_use', 'completed', 'cancelled', 'refunded') DEFAULT 'pending_payment',
        payment_method VARCHAR(50),
        transaction_id VARCHAR(100),
        paid_at DATETIME,
        refund_status ENUM('none', 'processing', 'success', 'failed') DEFAULT 'none',
        refund_amount DECIMAL(10, 2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (store_id) REFERENCES stores(id),
        FOREIGN KEY (seat_id) REFERENCES seats(id),
        INDEX idx_order_no (order_no),
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_start_time (start_time),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // 收藏表
      `CREATE TABLE IF NOT EXISTS favorites (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        store_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
        UNIQUE KEY uk_user_store (user_id, store_id),
        INDEX idx_user_id (user_id),
        INDEX idx_store_id (store_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // 评价表
      `CREATE TABLE IF NOT EXISTS reviews (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        store_id INT NOT NULL,
        order_id INT NOT NULL,
        rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        content TEXT,
        images JSON,
        reply TEXT,
        replied_at DATETIME,
        status ENUM('active', 'hidden') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (store_id) REFERENCES stores(id),
        FOREIGN KEY (order_id) REFERENCES orders(id),
        INDEX idx_store_id (store_id),
        INDEX idx_rating (rating),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    ]

    for (const sql of tables) {
      try {
        await this.query(sql)
      } catch (error) {
        console.error('Failed to create table:', { sql, error })
        throw error
      }
    }

          console.log('Database tables initialized successfully')
  }

  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end()
      this.pool = null
      console.log('Database connection closed')
    }
  }
}

// 导出单例实例
const database = Database.getInstance()

export const createConnection = () => database.connect()
export const connectDatabase = () => database.connect()
export const query = (sql: string, params?: any[]) => database.query(sql, params)
export const transaction = <T>(callback: (connection: mysql.PoolConnection) => Promise<T>) => database.transaction(callback)
export const closeDatabase = () => database.close()

export default database