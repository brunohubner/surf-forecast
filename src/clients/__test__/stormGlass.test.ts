import stormGlassWeather3HoursFixture from "@test/fixtures/stormglass_weather_3_hours.json"
import stormGlassNormalizedResponse3HoursFixture from "@test/fixtures/stormglass_normalized_response_3_hours.json"
import { StormGlass } from "@src/clients/stormGlass"
import * as HTTPUtil from "@src/util/request"
import CacheUtil from "@src/util/cache"

jest.mock("@src/util/request")
jest.mock("@src/util/cache")

describe("StormGlass client", () => {
    const MockedRequestClass = HTTPUtil.Request as jest.Mocked<
        typeof HTTPUtil.Request
    >
    const MockedCacheUtil = CacheUtil as jest.Mocked<typeof CacheUtil>
    const mockedRequest =
        new HTTPUtil.Request() as jest.Mocked<HTTPUtil.Request>

    it("should return the normalized forecast from the StormGlass Service", async () => {
        const lat = -20.329372
        const lng = -40.293629

        mockedRequest.get.mockResolvedValue({
            data: stormGlassWeather3HoursFixture
        } as HTTPUtil.Response)
        MockedCacheUtil.get.mockReturnValue(undefined)

        const stormGlass = new StormGlass(mockedRequest, MockedCacheUtil)
        const resp = await stormGlass.fetchPoints(lat, lng)

        expect(resp).toEqual(stormGlassNormalizedResponse3HoursFixture)
    })

    it("should exclude imcomplete data points", async () => {
        const lat = -20.329372
        const lng = -40.293629
        const incompleteResponse = {
            hours: [
                {
                    windDirection: {
                        noaa: 300
                    },
                    time: "2021-11-25T09:00:00+00:00"
                }
            ]
        }

        mockedRequest.get.mockResolvedValue({
            data: incompleteResponse
        } as HTTPUtil.Response)
        MockedCacheUtil.get.mockReturnValue(undefined)

        const stormGlass = new StormGlass(mockedRequest, MockedCacheUtil)
        const response = await stormGlass.fetchPoints(lat, lng)

        expect(response).toEqual([])
    })

    it("should get the normalized forecast points from cache and use it to return data points", async () => {
        const lat = -20.329372
        const lng = -40.293629

        mockedRequest.get.mockResolvedValue({
            data: null
        } as HTTPUtil.Response)

        MockedCacheUtil.get.mockReturnValue(
            stormGlassNormalizedResponse3HoursFixture
        )

        const stormGlass = new StormGlass(mockedRequest, MockedCacheUtil)
        const response = await stormGlass.fetchPoints(lat, lng)
        expect(response).toEqual(stormGlassNormalizedResponse3HoursFixture)
    })

    it("should get a generic error from StormGlass service when the request fail before reaching the service", async () => {
        const lat = -20.329372
        const lng = -40.293629

        mockedRequest.get.mockRejectedValue({ message: "Network Error" })
        MockedCacheUtil.get.mockReturnValue(undefined)

        const stormGlass = new StormGlass(mockedRequest, MockedCacheUtil)

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

        MockedCacheUtil.get.mockReturnValue(undefined)

        const stormGlass = new StormGlass(mockedRequest, MockedCacheUtil)

        await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
            'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429'
        )
    })
})
