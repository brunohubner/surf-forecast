import { ForecastProcessingInternalError } from "@src/services/forecast"
import { Beach, GeoPosition } from "@src/models/beach"
import stormGlassNormalizedResponse3HoursFixture from "@test/fixtures/stormglass_normalized_response_3_hours.json"
import apiForecastResponse1Beach from "@test/fixtures/api_forecast_response_1_beach.json"
import { StormGlass } from "@src/clients/stormGlass"
import { Forecast } from "@src/services/forecast"

jest.mock("@src/clients/stormGlass")

describe("Forecast Service", () => {
    const mockedStormGlassService = new StormGlass() as jest.Mocked<StormGlass>

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