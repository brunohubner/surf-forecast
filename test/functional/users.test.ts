import { User } from "@src/models/user"

describe("Users functional tests", () => {
    describe("When create a new user", () => {
        beforeAll(async () => User.deleteMany({}))
        afterAll(async () => User.deleteMany({}))

        it("should successfully create a new user", async () => {
            const newUser = {
                name: "John Doe",
                email: "jonh@mail.com",
                password: "abc123"
            }

            const response = await global.testRequest.post("/users").send(newUser)
            expect(response.status).toBe(201)
            expect(response.body).toEqual(expect.objectContaining(newUser))
        })

        it("should return 422 when there is a validation error", async () => {
            const newUser = {
                email: "john@mail.com",
                password: "abc123"
            }
            const response = await global.testRequest.post("/users").send(newUser)
            expect(response.status).toBe(422)
            expect(response.body).toEqual({
                code: 422,
                error: "User validation failed: name: Path `name` is required."
            })
        })

        it("should return 409 when email already exists", async () => {
            const newUser = {
                name: "John Doe",
                email: "jonh@mail.com",
                password: "abc123"
            }
            await global.testRequest.post("/users").send(newUser)
            const response = await global.testRequest.post("/users").send(newUser)
            expect(response.status).toBe(409)
            expect(response.body).toEqual({
                code: 409,
                error: "User validation failed: email: already exists in the database."
            })
        })
    })
})