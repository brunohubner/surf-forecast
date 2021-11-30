import { ForecastController } from "./controllers/forecast"
import { Server } from "@overnightjs/core"
import express, { Application } from "express"
import * as database from "@src/database"
import { BeachesController } from "./controllers/beaches"
import { UsersController } from "./controllers/users"

export class SetupServer extends Server {

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

    public async init(): Promise<void> {
        this.setupExpress()
        this.setupControllers()
        await this.databaseSetup()
    }

    public async close(): Promise<void> {
        await database.close()
    }

    public getApp(): Application {
        return this.app
    }

    public start(): void {
        this.app.listen(this.port, () => {
            console.info("Server listen on port: " + this.port)
        })
    }
}