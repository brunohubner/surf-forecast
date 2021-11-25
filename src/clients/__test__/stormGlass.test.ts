import stormGlassWeather3HoursFixture from "@test/fixtures/stormglass_weather_3_hours.json"
import stormGlassNormalizedResponse3HoursFixture from "@test/fixtures/stormglass_normalized_response_3_hours.json"
import { StormGlass } from "@src/clients/stormGlass"
import axios from "axios"

jest.mock("axios")

describe("StormGlass client", () => {
    it("should return the normalized forecast from the StormGlass Service", async () => {
        const lat = -20.329372
        const lng = -40.293629

        axios.get = jest.fn().mockResolvedValue(stormGlassWeather3HoursFixture)

        const stormGlass = new StormGlass(axios)
        const resp = await stormGlass.fetchPoints(lat, lng)

        expect(resp).toEqual(stormGlassNormalizedResponse3HoursFixture)
    })
})