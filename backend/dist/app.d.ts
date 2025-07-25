import express from 'express';
declare class App {
    app: express.Application;
    server: any;
    private port;
    constructor();
    private initializeMiddlewares;
    private initializeRoutes;
    private initializeErrorHandling;
    start(): Promise<void>;
    private setupGracefulShutdown;
}
declare const app: App;
export default app;
//# sourceMappingURL=app.d.ts.map