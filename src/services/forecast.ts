import { InternalError } from "@src/util/errors/internal-error"
import { ForecastPoint } from "./../clients/stormGlass"
import { StormGlass } from "@src/clients/stormGlass"
import { Beach } from "@src/models/beach"
import logger from "@src/logger"
import { Rating } from "./rating"
import _ from "lodash"

export interface BeachForecast extends Omit<Beach, "user">, ForecastPoint {
    rating: number
}

export interface TimeForecast {
    time: string
    forecast: BeachForecast[]
}

export class ForecastProcessingInternalError extends InternalError {
    constructor(message: string) {
        super(`Unexpected error during the forecast processing: ${message}`)
    }
}

export class Forecast {
    constructor(
        protected stormGlass = new StormGlass(),
        protected RatingService: typeof Rating = Rating
    ) { }

    public async processForecastForBeaches(
        beaches: Beach[],
        orderBy: "asc" | "desc" = "desc",
        orderField: keyof BeachForecast = "rating"
    ): Promise<TimeForecast[]> {
        try {
            const beachForecast = await this.calculateRating(beaches)
            const timeForecast = this.mapForecastByTime(beachForecast)
            return timeForecast.map(t => ({
                time: t.time,
                forecast: _.orderBy(t.forecast, [orderField], [orderBy])
            }))
        } catch (err) {
            throw new ForecastProcessingInternalError((err as Error).message)
        }
    }

    private async calculateRating(beaches: Beach[]): Promise<BeachForecast[]> {
        logger.info(`Preparing the forecast for ${beaches.length} beaches`)
        const response: ForecastPoint[][] = await Promise.all(
            beaches.map(beach => this.stormGlass.fetchPoints(beach.lat, beach.lng))
        )

        return response.flatMap((point: ForecastPoint[], index: number) => {
            const ratingService = new this.RatingService(beaches[index])
            return this.enrichedBeachData(point, beaches[index], ratingService)
        })
    }

    private enrichedBeachData(points: ForecastPoint[], beach: Beach, rating: Rating) {
        return points.map(point => ({
            lat: beach.lat,
            lng: beach.lng,
            name: beach.name,
            position: beach.position,
            rating: rating.getRateForPoint(point),
            ...point
        }))
    }

    private mapForecastByTime(forecast: BeachForecast[]): TimeForecast[] {
        const forecastByTime: TimeForecast[] = []
        for (const point of forecast) {
            const timePoint = forecastByTime.find(f => f.time === point.time)
            if (timePoint) {
                timePoint.forecast.push(point)
            } else {
                forecastByTime.push({
                    time: point.time,
                    forecast: [point]
                })
            }
        }
        return forecastByTime
    }
}