import { Response } from 'express'

export function success(res: Response, data: any = null, message?: string) {
  res.json({ success: true, data, message })
}

export function error(res: Response, message: string, statusCode: number = 400) {
  res.status(statusCode).json({ success: false, error: message })
}
