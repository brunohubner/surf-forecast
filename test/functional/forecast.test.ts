import stormGlassWeather3HoursFixture from "@test/fixtures/stormglass_weather_3_hours.json"
import apiForecastResponse1Beach from "@test/fixtures/api_forecast_response_1_beach.json"
import { Beach } from "@src/models/beach"
import nock from "nock"

describe("Beach forecast functional tests", () => {
	beforeAll(async () => {
		const defaultBeach = {
			lat: -20.329372,
			lng: -40.293629,
			name: "Manly",
			position: "E"
		}
		const beach = new Beach(defaultBeach)
		await beach.save()
	})
	afterAll(async () => await Beach.deleteMany({}))

	it("should return a forecast with just a few times", async () => {
		nock("https://api.stormglass.io:443", { "encodedQueryParams": true })
			.get("/v2/weather/point")
			.query({ "params": "swellDirection%2CswellHeight%2CswellPeriod%2CwaveDirection%2CwaveHeight%2CwindDirection%2CwindSpeed", "source": "noaa", "lat": "-20.329372", "lng": "-40.293629" })
			.reply(200, stormGlassWeather3HoursFixture)

		const { body, status } = await global.testRequest.get("/forecast")
		expect(status).toBe(200)
		expect(body).toEqual(apiForecastResponse1Beach)
	})

	it("should return 500 if something goes wrong during the processing", async () => {
		nock("https://api.stormglass.io:443", { "encodedQueryParams": true })
			.get("/v2/weather/point")
			.query({ "params": "swellDirection%2CswellHeight%2CswellPeriod%2CwaveDirection%2CwaveHeight%2CwindDirection%2CwindSpeed", "source": "noaa", "lat": "-20.329372", "lng": "-40.293629" })
			.replyWithError("Something went wrong")

		const { status } = await global.testRequest.get("/forecast")
		expect(status).toBe(500)
	})
})