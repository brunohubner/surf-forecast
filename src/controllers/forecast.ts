import { Beach } from "@src/models/beach"
import { Get, Controller, ClassMiddleware } from "@overnightjs/core"
import { Forecast } from "@src/services/forecast"
import { Request, Response } from "express"
import { authMiddleware } from "@src/middlewares/auth"
import logger from "@src/logger"

const forecast = new Forecast()

@Controller("forecast")
@ClassMiddleware(authMiddleware)
export class ForecastController {

	@Get("")
	public async getForecastForLoggedUser(req: Request, res: Response): Promise<void> {
		try {
			const beaches = await Beach.find({ user: req.decoded?.id })
			const forecastData = await forecast.processForecastForBeaches(beaches)
			res.status(200).send(forecastData)
		} catch (err) {
			logger.error(err)
			res.status(500).send({
				code: 500,
				error: "Something went wrong"
			})
		}
	}
}