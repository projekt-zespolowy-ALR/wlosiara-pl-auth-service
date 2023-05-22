import {Module} from "@nestjs/common";
import AuthController from "../auth_controller/AuthController.js";
import AuthService from "../auth_service/AuthService.js";

@Module({
	imports: [],
	controllers: [AuthController],
	providers: [AuthService],
})
export default class AuthModule {}
