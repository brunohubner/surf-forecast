import { Beach, BeachPosition, ForecastProcessingInternalError } from "./../forecast"
import stormGlassNormalizedResponse3HoursFixture from "@test/fixtures/stormglass_normalized_response_3_hours.json"
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
            position: BeachPosition.E,
            user: "some-user"
        }]

        const expectedResponse = [
            {
                time: "2021-11-25T07:00:00+00:00",
                forecast: [{
                    lat: -20.329372,
                    lng: -40.293629,
                    name: "Manly",
                    position: "E",
                    rating: 1,
                    swellDirection: 169.11,
                    swellHeight: 0.11,
                    swellPeriod: 5.46,
                    time: "2021-11-25T07:00:00+00:00",
                    waveDirection: 194.05,
                    waveHeight: 0.81,
                    windDirection: 246.22,
                    windSpeed: 5.81
                }]
            },
            {
                time: "2021-11-25T08:00:00+00:00",
                forecast: [{
                    lat: -20.329372,
                    lng: -40.293629,
                    name: "Manly",
                    position: "E",
                    rating: 1,
                    swellDirection: 168.82,
                    swellHeight: 0.12,
                    swellPeriod: 5.47,
                    time: "2021-11-25T08:00:00+00:00",
                    waveDirection: 193.52,
                    waveHeight: 0.8,
                    windDirection: 246.21,
                    windSpeed: 5.46
                }]
            },
            {
                time: "2021-11-25T09:00:00+00:00",
                forecast: [{
                    lat: -20.329372,
                    lng: -40.293629,
                    name: "Manly",
                    position: "E",
                    rating: 1,
                    swellDirection: 168.54,
                    swellHeight: 0.12,
                    swellPeriod: 5.48,
                    time: "2021-11-25T09:00:00+00:00",
                    waveDirection: 192.99,
                    waveHeight: 0.78,
                    windDirection: 246.2,
                    windSpeed: 5.11
                }]
            }
        ]

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
                position: BeachPosition.E,
                user: "some-user"
            }]

            mockedStormGlassService.fetchPoints.mockRejectedValue(
                "Error fetching data"
            )
            const forecast = new Forecast(mockedStormGlassService)
            await expect(forecast.processForecastForBeaches(beaches))
                .rejects.toThrow(ForecastProcessingInternalError)
        })
})