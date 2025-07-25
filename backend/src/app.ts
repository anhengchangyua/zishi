// backend/src/app.ts
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { createServer } from 'http'

// 导入路由
import routes from './routes'

// 导入中间件 - 暂时注释掉不存在的中间件
// import { errorHandler } from './middleware/error.middleware'
// import { requestLogger } from './middleware/logger.middleware'
// import { rateLimiter } from './middleware/rateLimit.middleware'

// 导入数据库连接
import { createConnection } from './config/database'
// import { connectRedis } from './config/redis'

// 导入日志配置 - 暂时使用console
// import logger from './utils/logger'

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
          console.log(message.trim())
        }
      }
    }))

    // 解析请求体
    this.app.use(express.json({ limit: '10mb' }))
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }))

    // 简单的请求日志
    this.app.use(morgan('combined'))

    // 基本限流中间件
    this.app.use((req, res, next) => {
      next()
    })

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
    // 注册路由
    this.app.use('/', routes)

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
    this.app.use((err: any, req: any, res: any, next: any) => {
      console.error(err.stack)
      res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      })
    })
  }

  public async start(): Promise<void> {
    try {
      // 连接数据库
      await createConnection()
      console.log('Database connected successfully')

              // 连接Redis - 暂时跳过
        // await connectRedis()
        console.log('Redis connection skipped')

      // 启动服务器
      this.server = createServer(this.app)
      
              this.server.listen(this.port, () => {
          console.log(`Server is running on port ${this.port}`)
          console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
          console.log(`Health check: http://localhost:${this.port}/health`)
        })

      // 优雅关闭
      this.setupGracefulShutdown()

          } catch (error) {
        console.error('Failed to start server:', error)
        process.exit(1)
      }
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      console.log(`Received ${signal}, starting graceful shutdown...`)
      
      if (this.server) {
        this.server.close(() => {
          console.log('HTTP server closed')
          process.exit(0)
        })

        // 强制关闭超时
        setTimeout(() => {
          console.error('Could not close connections in time, forcefully shutting down')
          process.exit(1)
        }, 10000)
      }
    }

    // 监听关闭信号
    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT', () => shutdown('SIGINT'))

    // 监听未捕获异常
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error)
      process.exit(1)
    })

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason)
      process.exit(1)
    })
  }
}

// 启动应用
const app = new App()
app.start()

export default app