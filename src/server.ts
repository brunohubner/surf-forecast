import { ForecastController } from "./controllers/forecast"
import "./util/module-alias"
import { Server } from "@overnightjs/core"
import express, { Application } from "express"

export class SetupServer extends Server {

    constructor(private port = 3333) {
        super()
    }

    private setupExpress(): void {
        this.app.use(express.json())
    }

    private setupControllers(): void {
        const forecastController = new ForecastController()
        this.addControllers([forecastController])
    }

    public init(): void {
        this.setupExpress()
        this.setupControllers()
    }

    public getApp(): Application {
        return this.app
    }
}