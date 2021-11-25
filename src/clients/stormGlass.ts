import { AxiosRequestConfig, AxiosStatic } from "axios"

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

export class StormGlass {

    readonly stormGlassApiParams =
        "swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed"
    readonly stormGlassApiSource =
        "noaa"
    readonly stormGlassApiEnd = "1637832099"

    constructor(protected request: AxiosStatic) { }

    public async fetchPoints(lat: number, lng: number): Promise<ForecastPoint[]> {
        const url = `https://api.stormglass.io/v2/weather/point
            ?params=${this.stormGlassApiParams}
            &source=${this.stormGlassApiSource}
            &end=${this.stormGlassApiEnd}
            &lat=${lat}&lng=${lng}`
            
        const config: AxiosRequestConfig = {
            headers: {
                Authorization: "fake-api-key"
            }
        }

        const response = await this.request.get<StormGlassForecastResponse>(url, config)
        return this.normalizeResponse(response.data)
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