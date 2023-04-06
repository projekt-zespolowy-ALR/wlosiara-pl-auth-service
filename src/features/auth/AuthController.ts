import {
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
  Version,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse, ApiProduces,
  ApiTags
} from "@nestjs/swagger";
import {EntityNotFoundError} from "typeorm";
import CredentialsEntity from "./CredentialsEntity.js";
import CredentialsInRequest from "./CredentialsInRequest.js";
import AuthService from "./AuthService.js";
import SessionEntity from "./SessionEntity.js";

@ApiTags("auth")
@ApiProduces("application/json")
@Controller("/auth")
class AuthController {
  private readonly authService: AuthService;
  constructor(authService: AuthService) {
    this.authService = authService;
  }

  @Version(["1"])
  @Post("/login")
  @ApiConsumes("application/json")
  @ApiBody({
    description: "Credentials",
    type: CredentialsInRequest,
  })
  @ApiCreatedResponse({
    description: "Session",
    type: SessionEntity,
  })
  @ApiBadRequestResponse({
    description: "Invalid credentials",
  })
  @UsePipes(new ValidationPipe({transform: true, whitelist: true}))
  public async login(@Body() credentialsInRequest: CredentialsInRequest): Promise<SessionEntity> {
    return this.authService.login(credentialsInRequest);

  }
}