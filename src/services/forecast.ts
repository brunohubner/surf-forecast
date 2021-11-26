import { InternalError } from "@src/util/errors/internal-error"
import { ForecastPoint } from "./../clients/stormGlass"
import { StormGlass } from "@src/clients/stormGlass"

export enum BeachPosition {
    N = "N",
    E = "E",
    S = "S",
    W = "W"
}

export interface Beach {
    lat: number
    lng: number
    name: string
    position: BeachPosition
    user: string
}

export interface BeachForecast extends Omit<Beach, "user">, ForecastPoint { }

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
    constructor(protected stormGlass = new StormGlass()) { }

    public async processForecastForBeaches(beaches: Beach[]): Promise<TimeForecast[]> {
        const pointsWithCorrectSource: BeachForecast[] = []
        try {
            for (const beach of beaches) {
                const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng)
                const enrichedBeachData = this.enrichedBeachData(points, beach)
                pointsWithCorrectSource.push(...enrichedBeachData)
            }
            return this.mapForecastByTime(pointsWithCorrectSource)
        } catch (err) {
            throw new ForecastProcessingInternalError((err as Error).message)
        }
    }

    private enrichedBeachData(points: ForecastPoint[], beach: Beach) {
        return points.map(e => ({
            ...e,
            lat: beach.lat,
            lng: beach.lng,
            name: beach.name,
            position: beach.position,
            rating: 1
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