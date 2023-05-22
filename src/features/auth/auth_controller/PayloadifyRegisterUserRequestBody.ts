import type RegisterUserRequestBody from "./RegisterUserRequestBody.js";
import {plainToClass} from "class-transformer";
import RegisterUserPayload from "../auth_service/RegisterUserPayload.js";

export default function payloadifyRegisterUserRequestBody(
	registerUserRequestBody: RegisterUserRequestBody
): RegisterUserPayload {
	return plainToClass(RegisterUserPayload, registerUserRequestBody);
}
