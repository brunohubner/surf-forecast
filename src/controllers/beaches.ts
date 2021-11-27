import mongoose from "mongoose"
import { Post, Controller } from "@overnightjs/core"
import { Beach } from "@src/models/beach"
import { Request, Response } from "express"

@Controller("beaches")
export class BeachesController {
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
            if (err instanceof mongoose.Error.ValidationError) {
                res.status(422).send({
                    error: (err as Error).message
                })
            } else {
                res.status(500).send({
                    error: "Internal Server Error"
                })
            }

        }
    }
}