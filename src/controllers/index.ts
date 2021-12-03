import { APIError } from "./../util/errors/api-error"
import ApiError from "@src/util/errors/api-error"
import logger from "@src/logger"
import { CUSTOM_VALIDATION } from "@src/models/user"
import { Response } from "express"
import mongoose from "mongoose"

export abstract class BaseController {
    protected sendCreateUpdateErrorResponse(
        res: Response,
        error: mongoose.Error.ValidationError | Error | unknown
    ): void {
        if (error instanceof mongoose.Error.ValidationError) {
            const clientErrors = this.handleClientErrors(error)

            res.status(clientErrors.code).send(
                ApiError.format({
                    code: clientErrors.code,
                    message: clientErrors.error
                }))
        } else {
            logger.error(error)
            res.status(500).send(
                ApiError.format({
                    code: 500,
                    message: "Something went wrong!"
                }))
        }
    }

    private handleClientErrors(
        error: mongoose.Error.ValidationError
    ): { code: number, error: string } {
        const duplicatedKindErrors = Object.values(error.errors).filter(err => {
            if (
                err instanceof mongoose.Error.ValidatorError ||
                err instanceof mongoose.Error.CastError
            ) {
                return err.kind === CUSTOM_VALIDATION.DUPLICATED
            }
            return false

        })

        return duplicatedKindErrors.length
            ? { code: 409, error: error.message }
            : { code: 400, error: error.message }
    }

    protected sendErrorResponse(res: Response, apiError: APIError): Response {
        return res.status(apiError.code).send(ApiError.format(apiError))
    }
}