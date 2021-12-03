import { ForecastProcessingInternalError, Forecast } from "@src/services/forecast"
import { Beach, GeoPosition } from "@src/models/beach"
import stormGlassNormalizedResponse3HoursFixture from "@test/fixtures/stormglass_normalized_response_3_hours.json"
import apiForecastResponse1Beach from "@test/fixtures/api_forecast_response_1_beach.json"
import { StormGlass } from "@src/clients/stormGlass"

jest.mock("@src/clients/stormGlass")

describe("Forecast Service", () => {
    const mockedStormGlassService = new StormGlass() as jest.Mocked<StormGlass>

    it("should return the forecast for mutiple beaches in the same hour with different ratings", async () => {
        mockedStormGlassService.fetchPoints.mockResolvedValueOnce([{
            swellDirection: 123.41,
            swellHeight: 0.21,
            swellPeriod: 3.67,
            time: "2020-04-26T00:00:00+00:00",
            waveDirection: 232.12,
            waveHeight: 0.46,
            windDirection: 310.48,
            windSpeed: 100,
        }])
        mockedStormGlassService.fetchPoints.mockResolvedValueOnce([{
            swellDirection: 64.26,
            swellHeight: 0.15,
            swellPeriod: 13.89,
            time: "2020-04-26T00:00:00+00:00",
            waveDirection: 231.38,
            waveHeight: 2.07,
            windDirection: 299.45,
            windSpeed: 100,
        }])
        const beaches: Beach[] = [{
            lat: -33.792726,
            lng: 151.289824,
            name: "Manly",
            position: GeoPosition.E,
            user: "fake-id",
        }, {
            lat: -33.792726,
            lng: 141.289824,
            name: "Dee Why",
            position: GeoPosition.S,
            user: "fake-id",
        }]
        const expectedResponse = [{
            time: "2020-04-26T00:00:00+00:00",
            forecast: [{
                lat: -33.792726,
                lng: 151.289824,
                name: "Manly",
                position: "E",
                rating: 2,
                swellDirection: 123.41,
                swellHeight: 0.21,
                swellPeriod: 3.67,
                time: "2020-04-26T00:00:00+00:00",
                waveDirection: 232.12,
                waveHeight: 0.46,
                windDirection: 310.48,
                windSpeed: 100,
            }, {
                lat: -33.792726,
                lng: 141.289824,
                name: "Dee Why",
                position: "S",
                rating: 3,
                swellDirection: 64.26,
                swellHeight: 0.15,
                swellPeriod: 13.89,
                time: "2020-04-26T00:00:00+00:00",
                waveDirection: 231.38,
                waveHeight: 2.07,
                windDirection: 299.45,
                windSpeed: 100,
            }]
        }]
        const forecast = new Forecast(mockedStormGlassService)
        const beachesWithRating = await forecast.processForecastForBeaches(beaches)
        expect(beachesWithRating).toEqual(expectedResponse)
    })

    it("should return the forecast for a list of beaches", async () => {
        mockedStormGlassService.fetchPoints.mockResolvedValue(stormGlassNormalizedResponse3HoursFixture)

        const beaches: Beach[] = [{
            lat: -20.329372,
            lng: -40.293629,
            name: "Manly",
            position: GeoPosition.E,
            user: "fake-id"
        }]

        const expectedResponse = apiForecastResponse1Beach

        const forecast = new Forecast(mockedStormGlassService)
        const beachesWithRating = await forecast.processForecastForBeaches(beaches)
        expect(beachesWithRating).toEqual(expectedResponse)
    })

    it("should return an empty list when the beaches array is empty", async () => {
        const forecast = new Forecast()
        const response = await forecast.processForecastForBeaches([])
        expect(response).toEqual([])
    })

    it("should throw internal processing error when something goes wrong during the rating process",
        async () => {
            const beaches: Beach[] = [{
                lat: -20.329372,
                lng: -40.293629,
                name: "Manly",
                position: GeoPosition.E,
                user: "fake-id"
            }]

            mockedStormGlassService.fetchPoints.mockRejectedValue(
                "Error fetching data"
            )
            const forecast = new Forecast(mockedStormGlassService)
            await expect(forecast.processForecastForBeaches(beaches))
                .rejects.toThrow(ForecastProcessingInternalError)
        })
})