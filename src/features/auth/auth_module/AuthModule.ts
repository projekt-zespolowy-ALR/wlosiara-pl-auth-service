import {Module} from "@nestjs/common";
import AuthController from "../auth_controller/AuthController.js";
import AuthService from "../auth_service/AuthService.js";
import {TypeOrmModule} from "@nestjs/typeorm";
import UserCredentialsEntity from "../auth_service/UserCredentialsEntity.js";
import UsersMicroserviceReference from "../auth_service/UsersMicroserviceReference.js";
import UserSessionEntity from "../auth_service/UserSessionEntity.js";

@Module({
	imports: [TypeOrmModule.forFeature([UserCredentialsEntity, UserSessionEntity])],
	controllers: [AuthController],
	providers: [AuthService, UsersMicroserviceReference],
})
export default class AuthModule {}
