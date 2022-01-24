import { AuthService } from "./../services/auth"
import { Post, Controller, Get, Middleware } from "@overnightjs/core"
import { Request, Response } from "express"
import { User } from "@src/models/user"
import { BaseController } from "."
import { authMiddleware } from "@src/middlewares/auth"
import Validation from "@src/util/validation"

@Controller("users")
export class UsersController extends BaseController {
    @Post("")
    public async create(req: Request, res: Response): Promise<void> {
        try {
            const newUser = {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            }
            if (!Validation.email(newUser.email)) {
                this.sendErrorResponse(res, {
                    code: 400,
                    message: "User validation failed: name: Invalid Email."
                })
                return
            }

            if (!Validation.password(newUser.password)) {
                this.sendErrorResponse(res, {
                    code: 400,
                    message:
                        "Password must be have 6-20 length and contains letters and numbers."
                })
                return
            }

            const user = new User(newUser)
            const result = await user.save()
            res.status(201).send(result)
        } catch (err) {
            this.sendCreateUpdateErrorResponse(res, err)
        }
    }

    @Post("authenticate")
    public async authenticate(req: Request, res: Response): Promise<Response> {
        try {
            const { email, password } = req.body
            const user = await User.findOne({ email })

            if (!user) {
                return this.sendErrorResponse(res, {
                    code: 401,
                    message: "User not found!"
                })
            }

            if (!(await AuthService.comparePassword(password, user.password))) {
                return this.sendErrorResponse(res, {
                    code: 401,
                    message: "Password does not match!"
                })
            }
            const token = AuthService.generateToken(user.id)
            return res.status(200).send({ token })
        } catch (err) {
            return this.sendErrorResponse(res, {
                code: 500,
                message: "Something went wrong!"
            })
        }
    }
    @Get("me")
    @Middleware(authMiddleware)
    public async me(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.context?.userId
            const user = await User.findOne({ _id: userId })
            if (!user) {
                return this.sendErrorResponse(res, {
                    code: 404,
                    message: "User not found!"
                })
            }
            return res.send({
                name: user.name,
                email: user.email,
                id: user.id
            })
        } catch (err) {
            return this.sendErrorResponse(res, {
                code: 500,
                message: "Something went wrong!"
            })
        }
    }
}
