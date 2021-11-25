import { AxiosStatic } from "axios"

export class StormGlass {

    readonly stormGlassApiParams =
        "swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed"
    readonly stormGlassApiSource =
        "noaa"

    constructor(protected request: AxiosStatic) { }

    public async fetchPoints(lat: number, lng: number): Promise<{}> {
        const url = `https://api.stormglass.io/v2/weather/point?params${this.stormGlassApiParams}=&source${this.stormGlassApiSource}=&end=1592113802&lat=${lat}&lng=${lng}`
        return this.request.get(url)
    }
}