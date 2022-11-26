import { Request, Response } from "express";

export default class BaseResponse {
	public error: boolean = false;

	constructor(
		public status: number,
		public message: string,
		public data: object | any[]
	) {
		if (status >= 400) {
			this.error = true;
		}
	}

	public handleResponse(req: Request, res: Response) {
		return res.status(this.status).json({
			status: this.status,
			error: this.error,
			message: this.message,
			data: this.data,
		});
	}
}
