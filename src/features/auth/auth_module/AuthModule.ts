import {Module} from "@nestjs/common";
import AuthController from "../auth_controller/AuthController.js";
import AuthService from "../auth_service/AuthService.js";
import AppConfigModule from "../../../app_config/AppConfigModule.js";

@Module({
	imports: [AppConfigModule],
	controllers: [AuthController],
	providers: [AuthService],
})
export default class AuthModule {}
