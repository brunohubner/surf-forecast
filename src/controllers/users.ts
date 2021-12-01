import { AuthService } from "./../services/auth"
import { Post, Controller } from "@overnightjs/core"
import { Request, Response } from "express"
import { User } from "@src/models/user"
import { BaseController } from "."
import logger from "@src/logger"

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
                return res.status(401).send({
                    code: 401,
                    error: "User not found!"
                })
            }

            if (!(await AuthService.comparePassword(password, user.password))) {
                return res.status(401).send({
                    code: 401,
                    error: "Password does not match!"
                })
            }
            const token = AuthService.generateToken(user.toJSON())
            return res.status(200).send({ token })
        } catch (err) {
            logger.error(err)
            return res.status(500).send({
                code: 500,
                error: "Something went wrong"
            })
        }
    }
}