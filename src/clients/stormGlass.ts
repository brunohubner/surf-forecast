import { InternalError } from "@src/util/errors/internal-error"
import * as HTTPUtil from "@src/util/request"
import config, { IConfig } from "config"
import { TimeUtil } from "@src/util/time"

export interface StormGlassPointSource {
    [key: string]: number
}

export interface StormGlassPoint {
    readonly time: string
    readonly swellDirection: StormGlassPointSource,
    readonly swellHeight: StormGlassPointSource,
    readonly swellPeriod: StormGlassPointSource,
    readonly waveDirection: StormGlassPointSource,
    readonly waveHeight: StormGlassPointSource,
    readonly windDirection: StormGlassPointSource,
    readonly windSpeed: StormGlassPointSource
}

export interface StormGlassForecastResponse {
    hours: StormGlassPoint[]
}

export interface ForecastPoint {
    time: string
    swellDirection: number,
    swellHeight: number,
    swellPeriod: number,
    waveDirection: number,
    waveHeight: number,
    windDirection: number,
    windSpeed: number
}

export class ClientRequestError extends InternalError {
    constructor(message: string) {
        const internalMessage =
            "Unexpected error when trying to communicate to StormGlass"
        super(`${internalMessage}: ${message}`)
    }
}

export class StormGlassResponseError extends InternalError {
    constructor(message: string) {
        const internalMessage =
            "Unexpected error returned by the StormGlass service"
        super(`${internalMessage}: ${message}`)
    }
}

const stormGlassResourceConfig: IConfig = config.get(
    "App.resources.StormGlass"
)

export class StormGlass {

    readonly stormGlassApiParams =
        "swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed"
    readonly stormGlassApiSource = "noaa"

    constructor(protected request = new HTTPUtil.Request()) { }

    public async fetchPoints(lat: number, lng: number): Promise<ForecastPoint[]> {
        const endTimestamp = TimeUtil.getUnixTimeForAFutureDay(1)
        try {
            const url =
                `${stormGlassResourceConfig.get("apiUrl")}/weather/point?params=${this.stormGlassApiParams}&source=${this.stormGlassApiSource}&lat=${lat}&lng=${lng}&end=${endTimestamp}`

            const response = await this.request.get<StormGlassForecastResponse>(url, {
                headers: {
                    Authorization: stormGlassResourceConfig.get("apiToken")
                }
            })
            return this.normalizeResponse(response.data)
        } catch (err) {
            if (HTTPUtil.Request.isRequestError(err as HTTPUtil.RequestError)) {
                throw new StormGlassResponseError(
                    `Error: ${JSON.stringify((err as HTTPUtil.RequestError).response?.data)} Code: ${(err as HTTPUtil.RequestError).response?.status}`)
            }
            throw new ClientRequestError((err as Error).message)
        }
    }

    private normalizeResponse(
        points: StormGlassForecastResponse
    ): ForecastPoint[] {
        return points.hours
            .filter(this.isValidPoints.bind(this))
            .map(point => ({
                swellDirection: point.swellDirection[this.stormGlassApiSource],
                swellHeight: point.swellHeight[this.stormGlassApiSource],
                swellPeriod: point.swellPeriod[this.stormGlassApiSource],
                time: point.time,
                waveDirection: point.waveDirection[this.stormGlassApiSource],
                waveHeight: point.waveHeight[this.stormGlassApiSource],
                windDirection: point.windDirection[this.stormGlassApiSource],
                windSpeed: point.windSpeed[this.stormGlassApiSource]
            }))
    }

    private isValidPoints(point: Partial<StormGlassPoint>): boolean {
        return !!(
            point.time &&
            point.swellDirection?.[this.stormGlassApiSource] &&
            point.swellHeight?.[this.stormGlassApiSource] &&
            point.swellPeriod?.[this.stormGlassApiSource] &&
            point.waveDirection?.[this.stormGlassApiSource] &&
            point.waveHeight?.[this.stormGlassApiSource] &&
            point.windDirection?.[this.stormGlassApiSource] &&
            point.windSpeed?.[this.stormGlassApiSource]
        )
    }
}