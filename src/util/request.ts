/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-interface */
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios"

export interface RequestConfig extends AxiosRequestConfig { }
export interface Response<T = any> extends AxiosResponse<T> { }
export interface RequestError extends AxiosError { }

export class Request {
    constructor(private request = axios) { }

    public get<T>(url: string, config: RequestConfig = {}): Promise<Response<T>> {
        return this.request.get<T, Response<T>>(url, config)
    }

    public static isRequestError(error: RequestError): boolean {
        return !!(error.response && error.response.status)
    }
}