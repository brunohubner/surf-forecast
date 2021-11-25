import stormGlassWeather3HoursFixture from "@test/fixtures/stormglass_weather_3_hours.json"
import stormGlassNormalizedResponse3HoursFixture from "@test/fixtures/stormglass_normalized_response_3_hours.json"
import { StormGlass } from "@src/clients/stormGlass"
import axios from "axios"

jest.mock("axios")

describe("StormGlass client", () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>

    it("should return the normalized forecast from the StormGlass Service", async () => {
        const lat = -20.329372
        const lng = -40.293629

        mockedAxios.get.mockResolvedValue({ data: stormGlassWeather3HoursFixture })

        const stormGlass = new StormGlass(mockedAxios)
        const resp = await stormGlass.fetchPoints(lat, lng)

        expect(resp).toEqual(stormGlassNormalizedResponse3HoursFixture)
    })
})