import BaseResponse from "./BaseResponse";

export default class NotFoundResponse extends BaseResponse {
	constructor(message: string, data: object | any[]) {
		super(404, message, data);
	}
}
