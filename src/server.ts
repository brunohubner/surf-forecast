import { ForecastController } from "./controllers/forecast"
import { Server } from "@overnightjs/core"
import express, { Application } from "express"
import * as database from "@src/database"
import { BeachesController } from "./controllers/beaches"
import { UsersController } from "./controllers/users"
import logger from "./logger"
import * as http from "http"

export class SetupServer extends Server {
    private server?: http.Server

    constructor(private port = 3333) {
        super()
    }

    private setupExpress(): void {
        this.app.use(express.json())
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
        this.setupControllers()
        await this.databaseSetup()
    }

    public start(): void {
        this.server = this.app.listen(this.port, () => {
            logger.info("Server listen on port: " + this.port)
        })
    }
}