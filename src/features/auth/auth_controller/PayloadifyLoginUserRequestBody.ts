import type LoginUserRequestBody from "./LoginUserRequestBody.js";
import {plainToClass} from "class-transformer";
import LoginUserPayload from "../auth_service/LoginUserPayload.js";

export default function payloadifyRegisterUserRequestBody(
	loginUserRequestBody: LoginUserRequestBody
): LoginUserPayload {
	return plainToClass(LoginUserPayload, loginUserRequestBody);
}
