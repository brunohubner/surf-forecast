import CacheUtil from "@src/util/cache"
import stormGlassWeather3HoursFixture from "@test/fixtures/stormglass_weather_3_hours.json"
import apiForecastResponse1Beach from "@test/fixtures/api_forecast_response_1_beach.json"
import { Beach, GeoPosition } from "@src/models/beach"
import nock from "nock"
import { User } from "@src/models/user"
import { AuthService } from "@src/services/auth"

describe("Beach forecast functional tests", () => {
	const defaultUser = {
		name: "John Doe",
		email: "jonh@mail.com",
		password: "abc123"
	}
	let token: string

	beforeEach(async () => {
		await Beach.deleteMany({})
		await User.deleteMany({})
		const user = await new User(defaultUser).save()
		token = AuthService.generateToken(user.toJSON())

		const defaultBeach: Beach = {
			lat: -20.329372,
			lng: -40.293629,
			name: "Manly",
			position: GeoPosition.E,
			userId: user.id
		}
		const beach = new Beach(defaultBeach)
		await beach.save()
		CacheUtil.clearAllCache()
	})
	afterAll(async () => {
		await Beach.deleteMany({})
		await User.deleteMany({})
	})

	it("should return a forecast with just a few times", async () => {
		nock("https://api.stormglass.io:443", { "encodedQueryParams": true })
			.get("/v2/weather/point")
			.query({ "params": "swellDirection%2CswellHeight%2CswellPeriod%2CwaveDirection%2CwaveHeight%2CwindDirection%2CwindSpeed", "source": "noaa", "lat": "-20.329372", "lng": "-40.293629", "end": /(.*)/ })
			.reply(200, stormGlassWeather3HoursFixture)

		const { body, status } = await global.testRequest
			.get("/forecast")
			.set({ "x-access-token": token })
		expect(status).toBe(200)
		expect(body).toEqual(apiForecastResponse1Beach)
	})

	it("should return 500 if something goes wrong during the processing", async () => {
		nock("https://api.stormglass.io:443", { "encodedQueryParams": true })
			.get("/v2/weather/point")
			.query({ "params": "swellDirection%2CswellHeight%2CswellPeriod%2CwaveDirection%2CwaveHeight%2CwindDirection%2CwindSpeed", "source": "noaa", "lat": "-20.329372", "lng": "-40.293629", "end": /(.*)/ })
			.replyWithError("Something went wrong")

		const { status } = await global.testRequest
			.get("/forecast")
			.set({ "x-access-token": token })
		expect(status).toBe(500)
	})
})