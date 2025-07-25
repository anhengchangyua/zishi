"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const routes_1 = __importDefault(require("./routes"));
const database_1 = require("./config/database");
dotenv_1.default.config();
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = parseInt(process.env.PORT || '3000');
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }
    initializeMiddlewares() {
        this.app.use((0, helmet_1.default)({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                },
            },
        }));
        this.app.use((0, cors_1.default)({
            origin: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
        }));
        this.app.use((0, compression_1.default)());
        this.app.use((0, morgan_1.default)('combined', {
            stream: {
                write: (message) => {
                    console.log(message.trim());
                }
            }
        }));
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        this.app.use((0, morgan_1.default)('combined'));
        this.app.use((req, res, next) => {
            next();
        });
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                version: process.env.npm_package_version || '1.0.0'
            });
        });
    }
    initializeRoutes() {
        this.app.use('/', routes_1.default);
        this.app.use('*', (req, res) => {
            res.status(404).json({
                code: 404,
                message: 'API endpoint not found',
                path: req.originalUrl
            });
        });
    }
    initializeErrorHandling() {
        this.app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).json({
                code: 500,
                message: '服务器内部错误',
                data: null
            });
        });
    }
    async start() {
        try {
            await (0, database_1.createConnection)();
            console.log('Database connected successfully');
            console.log('Redis connection skipped');
            this.server = (0, http_1.createServer)(this.app);
            this.server.listen(this.port, () => {
                console.log(`Server is running on port ${this.port}`);
                console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
                console.log(`Health check: http://localhost:${this.port}/health`);
            });
            this.setupGracefulShutdown();
        }
        catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    }
    setupGracefulShutdown() {
        const shutdown = async (signal) => {
            console.log(`Received ${signal}, starting graceful shutdown...`);
            if (this.server) {
                this.server.close(() => {
                    console.log('HTTP server closed');
                    process.exit(0);
                });
                setTimeout(() => {
                    console.error('Could not close connections in time, forcefully shutting down');
                    process.exit(1);
                }, 10000);
            }
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            process.exit(1);
        });
        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
            process.exit(1);
        });
    }
}
const app = new App();
app.start();
exports.default = app;
//# sourceMappingURL=app.js.map