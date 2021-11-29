import { Post, Controller } from "@overnightjs/core"
import { Beach } from "@src/models/beach"
import { Request, Response } from "express"
import { BaseController } from "."

@Controller("beaches")
export class BeachesController extends BaseController {
    @Post("")
    public async create(req: Request, res: Response) {
        try {
            const newBeach = {
                lat: req.body.lat,
                lng: req.body.lng,
                name: req.body.name,
                position: req.body.position
            }
            const beach = new Beach(newBeach)
            const result = await beach.save()

            res.status(201).send(result)
        } catch (err) {
            this.sendCreateUpdateErrorResponse(res, err)
        }
    }
}