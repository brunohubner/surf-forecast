import ApiError from "@src/util/errors/api-error"
import { Beach } from "@src/models/beach"
import { Get, Controller, ClassMiddleware, Middleware } from "@overnightjs/core"
import { BeachForecast, Forecast } from "@src/services/forecast"
import { Request, Response } from "express"
import { authMiddleware } from "@src/middlewares/auth"
import { BaseController } from "."
import rateLimit from "express-rate-limit"

const rateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    keyGenerator(req: Request): string {
        return req.ip
    },
    handler(_, res: Response): void {
        res.status(429).send(
            ApiError.format({
                code: 429,
                message: "Too many request to the '/forecast' endpoint"
            })
        )
    }
})

const forecast = new Forecast()

@Controller("forecast")
@ClassMiddleware(authMiddleware)
export class ForecastController extends BaseController {
    @Get("")
    @Middleware(rateLimiter)
    public async getForecastForLoggedUser(
        req: Request,
        res: Response
    ): Promise<void> {
        try {
            const {
                orderBy,
                orderField
            }: {
                orderBy?: "asc" | "desc"
                orderField?: keyof BeachForecast
            } = req.query
            const beaches = await Beach.find({
                userId: req.context?.userId || undefined
            })
            const forecastData = await forecast.processForecastForBeaches(
                beaches,
                orderBy,
                orderField
            )
            res.status(200).send(forecastData)
        } catch (err) {
            this.sendErrorResponse(res, {
                code: 500,
                message: "Something went wrong"
            })
        }
    }
}
