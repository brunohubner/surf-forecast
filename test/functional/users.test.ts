import { AuthService } from "@src/services/auth"
import { User } from "@src/models/user"

describe("Users functional tests", () => {
    beforeEach(async () => User.deleteMany({}))
    afterAll(async () => User.deleteMany({}))

    describe("When create a new user", () => {
        it("should successfully create a new user with encryped password", async () => {
            const newUser = {
                name: "John Doe",
                email: "jonh@mail.com",
                password: "abc123"
            }

            const response = await global.testRequest.post("/users").send(newUser)
            expect(response.status).toBe(201)
            await expect(AuthService.comparePassword(newUser.password, response.body.password)).resolves.toBeTruthy()
            expect(response.body).toEqual(expect.objectContaining({
                ...newUser,
                password: expect.any(String)
            }))
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
                error: "Unprocessable Entity",
                message: "User validation failed: name: Path `name` is required."
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
                error: "Conflict",
                message: "User validation failed: email: already exists in the database."
            })
        })
    })
    describe("when authenticating a user", () => {
        it("should generate a token for a valid user", async () => {
            const newUser = {
                name: "John Doe",
                email: "jonh@mail.com",
                password: "abc123"
            }
            await new User(newUser).save()
            const response = await global.testRequest.post("/users/authenticate").send({
                email: newUser.email,
                password: newUser.password
            })
            expect(response.body).toEqual(
                expect.objectContaining({ token: expect.any(String) })
            )
        })

        it("should return UNAUTHORIZED if the user with the given email is not found", async () => {
            const response = await global.testRequest.post("/users/authenticate").send({
                email: "some-email@mail.com",
                password: "abc123"
            })
            expect(response.status).toBe(401)
            expect(response.body).toEqual({
                code: 401,
                error: "Unauthorized",
                message: "User not found!"
            })
        })

        it("should return ANAUTHORIZED if the user is found but the pass does not match", async () => {
            const newUser = {
                name: "John Doe",
                email: "jonh@mail.com",
                password: "abc123"
            }
            await new User(newUser).save()
            const response = await global.testRequest.post("/users/authenticate").send({
                email: newUser.email,
                password: "different-password"
            })
            expect(response.status).toBe(401)
            expect(response.body).toEqual({
                code: 401,
                error: "Unauthorized",
                message: "Password does not match!"
            })
        })
    })

    describe("When getting user profile info", () => {
        it("should return the token's owner profile inforation", async () => {
            const newUser = {
                name: "John Doe",
                email: "jonh@mail.com",
                password: "abc123"
            }
            const user = await new User(newUser).save()
            const token = AuthService.generateToken(user.toJSON())
            const { body, status } = await global.testRequest
                .get("/users/me")
                .set({ "x-access-token": token })

            expect(status).toBe(200)
            expect(body).toMatchObject(JSON.parse(JSON.stringify({ user })))
        })

        it("should return Not Found, when the user is not found", async () => {
            const newUser = {
                name: "John Doe",
                email: "jonh@mail.com",
                password: "abc123"
            }
            const user = new User(newUser)
            const token = AuthService.generateToken(user.toJSON())
            const { body, status } = await global.testRequest
                .get("/users/me")
                .set({ "x-access-token": token })

            expect(status).toBe(404)
            expect(body.message).toBe("User not found!")
        })
    })
})