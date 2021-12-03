import { ForecastController } from "./controllers/forecast"
import { Server } from "@overnightjs/core"
import express, { Application } from "express"
import * as database from "@src/database"
import { BeachesController } from "./controllers/beaches"
import { UsersController } from "./controllers/users"
import logger from "./logger"
import * as http from "http"
import cors from "cors"
import { apiErrorValidator } from "@src/middlewares/api-error-validator"
import expressPino from "express-pino-logger"
import { OpenApiValidator } from "express-openapi-validator"
import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types"
import apiSchema from "./api-schema.json"
import swaggerUi from "swagger-ui-express"

export class SetupServer extends Server {
    private server?: http.Server

    constructor(private port = 3333) {
        super()
    }

    private setupExpress(): void {
        this.app.use(cors({
            origin: "*"
        }))
        this.app.use(express.json())
        this.app.use(expressPino({ logger }))
    }

    private setupControllers(): void {
        const forecastController = new ForecastController()
        const beachesController = new BeachesController()
        const usersController = new UsersController()
        this.addControllers([forecastController, beachesController, usersController])
    }

    private async databaseSetup(): Promise<void> {
        await database.connect()
    }

    private async docsSetup(): Promise<void> {
        this.app.use("/docs", swaggerUi.serve, swaggerUi.setup(apiSchema))
        await new OpenApiValidator({
            apiSpec: apiSchema as OpenAPIV3.Document,
            validateRequests: true,
            validateResponses: true,
        }).install(this.app)
    }

    private setupErrorHandlers(): void {
        this.app.use(apiErrorValidator)
    }

    public async close(): Promise<void> {
        await database.close()

        if (this.server) {
            await new Promise<void>((resolve, reject) => {
                this.server?.close((err) => {
                    if (err) {
                        return reject(err)
                    }
                    resolve()
                })
            })
        }
    }

    public getApp(): Application {
        return this.app
    }

    public async init(): Promise<void> {
        this.setupExpress()
        await this.docsSetup()
        this.setupControllers()
        await this.databaseSetup()
        this.setupErrorHandlers()
    }

    public start(): void {
        this.server = this.app.listen(this.port, () => {
            logger.info("Server listen on port: " + this.port)
        })
    }
}