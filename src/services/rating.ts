import { ForecastPoint } from "./../clients/stormGlass"
import { Beach, GeoPosition } from "@src/models/beach"

const waveHeights = {
    ankleToKnee: {
        min: 0.3,
        max: 1.0,
    },
    waistHigh: {
        min: 1.0,
        max: 2.0,
    },
    headHigh: {
        min: 2.0,
        max: 2.5,
    },
}

export class Rating {
    constructor(private beach: Beach) { }

    public getRateForPoint(point: ForecastPoint): number {
        const swellDirection = this.getPositionFromLocation(point.swellDirection)
        const windDirection = this.getPositionFromLocation(point.windDirection)
        const windAndWaveRating = this.getRatingBasedOnWindAndWavePositions(
            swellDirection,
            windDirection
        )
        const swellHeightRating = this.getRatingForSwellSize(point.swellHeight)
        const swellPeriodRating = this.getRatingForSwellPeriod(point.swellPeriod)
        const finalRating = (windAndWaveRating + swellHeightRating + swellPeriodRating) / 3
        return Math.round(finalRating)
    }

    public getRatingBasedOnWindAndWavePositions(
        waveDirection: GeoPosition,
        windDirection: GeoPosition
    ): number {
        if (waveDirection === windDirection) return 1
        if (this.isWindOffShore(waveDirection, windDirection)) return 5
        return 3
    }

    public getRatingForSwellPeriod(period: number): number {
        const rating = [1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 4, 4, 4, 4, 5]
        return rating[period > 14 ? 14 : period]
    }

    public getRatingForSwellSize(height: number): number {
        if (
            height >= waveHeights.ankleToKnee.min &&
            height < waveHeights.ankleToKnee.max
        ) return 2

        if (
            height >= waveHeights.waistHigh.min &&
            height < waveHeights.waistHigh.max
        ) return 3

        if (height >= waveHeights.headHigh.min) return 5

        return 1
    }

    public getPositionFromLocation(coordinates: number): GeoPosition {
        if (coordinates >= 310 || (coordinates < 50 && coordinates >= 0)) return GeoPosition.N
        if (coordinates >= 50 && coordinates < 120) return GeoPosition.E
        if (coordinates >= 120 && coordinates < 220) return GeoPosition.S
        if (coordinates >= 220 && coordinates < 310) return GeoPosition.W

        return GeoPosition.E
    }

    private isWindOffShore(
        waveDirection: GeoPosition,
        windDirection: GeoPosition
    ): boolean {
        return ("NESW".indexOf(waveDirection) + "NESW".indexOf(windDirection)) % 2 == 0
    }
}