// backend/src/app.ts
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { createServer } from 'http'

// 导入路由
import authRoutes from './routes/auth.routes'
import storeRoutes from './routes/store.routes'
import orderRoutes from './routes/order.routes'
import paymentRoutes from './routes/payment.routes'
import userRoutes from './routes/user.routes'

// 导入中间件
import { errorHandler } from './middleware/error.middleware'
import { requestLogger } from './middleware/logger.middleware'
import { rateLimiter } from './middleware/rateLimit.middleware'

// 导入数据库连接
import { connectDatabase } from './config/database'
import { connectRedis } from './config/redis'

// 导入日志配置
import logger from './utils/logger'

// 加载环境变量
dotenv.config()

class App {
  public app: express.Application
  public server: any
  private port: number

  constructor() {
    this.app = express()
    this.port = parseInt(process.env.PORT || '3000')
    
    this.initializeMiddlewares()
    this.initializeRoutes()
    this.initializeErrorHandling()
  }

  private initializeMiddlewares(): void {
    // 安全中间件
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }))

    // CORS配置
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }))

    // 压缩响应
    this.app.use(compression())

    // 请求日志
    this.app.use(morgan('combined', {
      stream: {
        write: (message: string) => {
          logger.info(message.trim())
        }
      }
    }))

    // 解析请求体
    this.app.use(express.json({ limit: '10mb' }))
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }))

    // 自定义请求日志
    this.app.use(requestLogger)

    // 限流中间件
    this.app.use(rateLimiter)

    // 健康检查
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
      })
    })
  }

  private initializeRoutes(): void {
    // API路由前缀
    const apiPrefix = '/api/v1'

    // 注册路由
    this.app.use(`${apiPrefix}/auth`, authRoutes)
    this.app.use(`${apiPrefix}/stores`, storeRoutes)
    this.app.use(`${apiPrefix}/orders`, orderRoutes)
    this.app.use(`${apiPrefix}/payment`, paymentRoutes)
    this.app.use(`${apiPrefix}/user`, userRoutes)

    // 404处理
    this.app.use('*', (req, res) => {
      res.status(404).json({
        code: 404,
        message: 'API endpoint not found',
        path: req.originalUrl
      })
    })
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler)
  }

  public async start(): Promise<void> {
    try {
      // 连接数据库
      await connectDatabase()
      logger.info('Database connected successfully')

      // 连接Redis
      await connectRedis()
      logger.info('Redis connected successfully')

      // 启动服务器
      this.server = createServer(this.app)
      
      this.server.listen(this.port, () => {
        logger.info(`Server is running on port ${this.port}`)
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
        logger.info(`Health check: http://localhost:${this.port}/health`)
      })

      // 优雅关闭
      this.setupGracefulShutdown()

    } catch (error) {
      logger.error('Failed to start server:', error)
      process.exit(1)
    }
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, starting graceful shutdown...`)
      
      if (this.server) {
        this.server.close(() => {
          logger.info('HTTP server closed')
          process.exit(0)
        })

        // 强制关闭超时
        setTimeout(() => {
          logger.error('Could not close connections in time, forcefully shutting down')
          process.exit(1)
        }, 10000)
      }
    }

    // 监听关闭信号
    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT', () => shutdown('SIGINT'))

    // 监听未捕获异常
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error)
      process.exit(1)
    })

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
      process.exit(1)
    })
  }
}

// 启动应用
const app = new App()
app.start()

export default app