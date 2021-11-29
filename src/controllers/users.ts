import { Post, Controller } from "@overnightjs/core"
import { Request, Response } from "express"
import { User } from "@src/models/user"
import { BaseController } from "."

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
}