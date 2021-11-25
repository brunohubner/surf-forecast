import stormGlassWeather3HoursFixture from "@test/fixtures/stormglass_weather_3_hours.json"
import stormGlassNormalizedResponse3HoursFixture from "@test/fixtures/stormglass_normalized_response_3_hours.json"
import { StormGlass } from "@src/clients/stormGlass"
import * as HTTPUtil from "@src/util/request"

jest.mock("@src/util/request")

describe("StormGlass client", () => {
    const MockedRequestClass = HTTPUtil.Request as jest.Mocked<typeof HTTPUtil.Request>
    const mockedRequest = new HTTPUtil.Request() as jest.Mocked<HTTPUtil.Request>

    it("should return the normalized forecast from the StormGlass Service", async () => {
        const lat = -20.329372
        const lng = -40.293629

        mockedRequest.get.mockResolvedValue({ data: stormGlassWeather3HoursFixture } as HTTPUtil.Response)
        const stormGlass = new StormGlass(mockedRequest)
        const resp = await stormGlass.fetchPoints(lat, lng)

        expect(resp).toEqual(stormGlassNormalizedResponse3HoursFixture)
    })

    it("should exclude imcomplete data points", async () => {
        const lat = -20.329372
        const lng = -40.293629
        const incompleteResponse = {
            hours: [{
                windDirection: {
                    noaa: 300
                },
                time: "2021-11-25T09:00:00+00:00"
            }]
        }

        mockedRequest.get.mockResolvedValue({ data: incompleteResponse } as HTTPUtil.Response)
        const stormGlass = new StormGlass(mockedRequest)
        const response = await stormGlass.fetchPoints(lat, lng)

        expect(response).toEqual([])
    })

    it("should get a generic error from StormGlass service when the request fail before reaching the service", async () => {
        const lat = -20.329372
        const lng = -40.293629

        mockedRequest.get.mockRejectedValue({ message: "Network Error" })
        const stormGlass = new StormGlass(mockedRequest)

        await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
            "Unexpected error when trying to communicate to StormGlass: Network Error"
        )
    })

    it("should get a StormGlassResponseError when the StormGlass service responds whith error", async () => {
        const lat = -20.329372
        const lng = -40.293629

        MockedRequestClass.isRequestError.mockReturnValue(true)
        mockedRequest.get.mockRejectedValue({
            response: {
                status: 429,
                data: {
                    errors: ["Rate Limit reached"]
                }
            }
        })

        const stormGlass = new StormGlass(mockedRequest)

        await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
            "Unexpected error returned by the StormGlass service: Error: {\"errors\":[\"Rate Limit reached\"]} Code: 429"
        )
    })
})