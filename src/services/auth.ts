import { Response } from "express";
import { Container, Service, Inject } from "typedi";
import { eventEmitter } from "../utils/event-emitter";
import { USER_MODEL_TOKEN } from "../database/models/User";
import ApiError, {
  BadRequest,
  ForbiddenRequest,
  NotFoundError,
  UnAuthorizedRequest,
} from "../utils/api-error";
import {
  AccessToken,
  IUser,
  IUserModel,
  ResetPasswordToken,
} from "../@types/user-model";
import { authLogger, httpLogger } from "../utils/loggers";
import { LoginTicket, OAuth2Client, TokenPayload } from "google-auth-library";
import { GOOGLE_AUTH_CLIENT_TOKEN } from "../utils/google-auth-client";
import { verify } from "jsonwebtoken";
import keys from "../constants/keys";
import { compare } from "bcrypt";

interface UserAndToken {
  user: IUser;
  accessToken: AccessToken;
}

@Service()
class AuthServices {
  @Inject(USER_MODEL_TOKEN)
  private readonly _userModel: IUserModel;
  private readonly _googleClient: OAuth2Client;
  private static _res: Response;
  private readonly _events = {
    REFRESH_TOKEN: "refresh-Token",
    REGISTER_USER: "register-user",
    LOGIN_USER: "login-user",
    LOGOUT_USER: "logout-user",
  };
  private _errorMessage: string = "";
  constructor(
    userModel: IUserModel,
    @Inject(GOOGLE_AUTH_CLIENT_TOKEN) googleClient: OAuth2Client
  ) {
    this._userModel = userModel;
    this._googleClient = googleClient;
    this.initalizeEventsListeners();
  }

  /**
   * Initializes event listeners
   */
  private initalizeEventsListeners(): void {
    this.sendRefeshTokenEventListener(this._events.REGISTER_USER);
    this.sendRefeshTokenEventListener(this._events.LOGIN_USER);
    this.sendRefeshTokenEventListener(this._events.REFRESH_TOKEN);
  }

  /**
   * set the response object
   */
  public set res(response: Response) {
    AuthServices._res = response;
  }

  /**
   * Registers a new user
   * @param body user data
   * @returns object of user and accesstoken
   */
  public async registerUser(body: any): Promise<UserAndToken> {
    const existingUser: IUser | null = await this._userModel.findOne({
      email: body.email,
    });
    if (existingUser) {
      this._errorMessage = `Email ${body.email} already exists`;
      authLogger.error(`message:${this._errorMessage},email:${body.email},`);
      throw new ApiError(409, this._errorMessage);
    }
    const user: IUser = new this._userModel(body);
    await user.save();
    const accessToken: AccessToken = await user.createAccessToken();
    eventEmitter.emit(this._events.REGISTER_USER, {
      refreshToken: user.createRefreshToken(),
    });
    authLogger.info(
      `message:${user.role} registeration was sucessful,email:${user.email},name:${user.name}`
    );
    return { user, accessToken };
  }

  /**
   * logs in an existing user
   * @param body user data
   * @param params route params
   * @returns object of user and accesstoken
   */
  public async loginUser(body: any, params: any): Promise<UserAndToken> {
    const user: IUser = await this._userModel.findByCredentials(
      body.email,
      body.password
    );
    if (params.role === "admin" && user.role === "User") {
      this._errorMessage = "Access denied";
      authLogger.error(
        `message:${this._errorMessage},email:${user.email},userId:${user.id}`
      );
      throw new UnAuthorizedRequest(this._errorMessage);
    }
    const accessToken: AccessToken = await user.createAccessToken();
    eventEmitter.emit(this._events.LOGIN_USER, {
      refreshToken: user.createRefreshToken(),
    });
    authLogger.info(
      `message:${user.role} login was sucessful,email:${user.email},name:${user.name}`
    );
    return { user, accessToken };
  }

  /**
   * logs in using google oAuth
   * @param body express body object
   * @returns object of user and accesstoken
   */
  public async gooleLoginUser(body: any): Promise<UserAndToken> {
    const idToken: string = body.idToken;
    const loginTicket: LoginTicket = await this._googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const tokenPayload: TokenPayload | undefined = loginTicket.getPayload();

    if (!tokenPayload || !tokenPayload.email_verified || !tokenPayload.email) {
      this._errorMessage = "Google Login Failed";
      authLogger.error(`message:${this._errorMessage}`);
      throw new UnAuthorizedRequest(this._errorMessage);
    }
    const user: IUser = await this._userModel.findOrCreate(
      tokenPayload.email,
      tokenPayload.sub,
      tokenPayload.name
    );
    const accessToken: AccessToken = await user.createAccessToken();
    eventEmitter.emit(this._events.LOGIN_USER, {
      refreshToken: user.createRefreshToken(),
    });
    authLogger.info(
      `message:${user.role} login was sucessful,email:${user.email},name:${user.name}`
    );
    return { user, accessToken };
  }

  /**
   *  Refreshes access token and refresh token
   * @param cookies refresh token
   * @returns access token
   */
  public async refreshToken(cookies: any): Promise<AccessToken> {
    const token: string = cookies.jid;
    if (!token) {
      this._errorMessage = "No token found";
      authLogger.error(`message:${this._errorMessage}`);
      throw new UnAuthorizedRequest(this._errorMessage);
    }
    let payload: any;
    try {
      payload = verify(token, keys.JWT_REFRESH_TOKEN_SECRET);
    } catch (err) {
      this._errorMessage = "Token has expired";
      authLogger.error(`message:${this._errorMessage}`);
      throw new UnAuthorizedRequest(this._errorMessage);
    }
    const user: IUser | null = await this._userModel.findOne({
      _id: payload.userId,
    });
    if (!user) {
      this._errorMessage = "User not found";
      authLogger.error(
        `message:${this._errorMessage},userID:${payload.userId}`
      );
      throw new NotFoundError(this._errorMessage);
    }
    if (user.refreshTokenVersion !== payload.tokenVersion) {
      this._errorMessage = "Token has been revoked";
      authLogger.error(
        `message:${this._errorMessage},userID:${payload.userId}`
      );
      throw new ForbiddenRequest(this._errorMessage);
    }
    eventEmitter.emit(this._events.REFRESH_TOKEN, {
      refreshToken: user.createRefreshToken(),
    });
    authLogger.info("Access token refreshed successfully");
    const accessToken = await user.createAccessToken();
    return accessToken;
  }
  /**
   * Checks access token to see if user is authenticated
   * @param token accessToken
   * @return authenticated user
   */
  public async checkAuth(token: string): Promise<IUser> {
    const payload = verify(token, keys.JWT_ACCESS_TOKEN_SECRET);
    const user: IUser | null = await this._userModel.findOne({
      _id: (payload as any).userId,
      ["accessTokens.token"]: token,
    });
    if (!user) {
      this._errorMessage = `Not authenticated`;
      authLogger.error(`message:${this._errorMessage}`);
      throw new Error();
    }
    return user;
  }
  /**
   * Logs out an authenticated user
   * @param user authenticated user
   * @param accessToken current access token
   */
  public async logoutUser(user: IUser, accessToken: string): Promise<IUser> {
    user.accessTokens = user.accessTokens.filter(
      token => token.token !== accessToken
    );
    eventEmitter.emit(this._events.LOGOUT_USER, {
      refreshToken: "",
    });
    authLogger.info(`${user.role} logout is successful`);
    await user.save();
    return user;
  }

  public async forgotPassword(body: any): Promise<ResetPasswordToken> {
    const user: IUser | null = await this._userModel.findOne({
      email: body.email,
    });

    if (!user) {
      this._errorMessage = "Account does not exist";
      authLogger.error(`message:${this._errorMessage}, email:${body.email}`);
      throw new NotFoundError(this._errorMessage);
    }
    await this._userModel.revokeRefreshToken(user._id);
    const token: ResetPasswordToken = user.createResetPasswordToken();
    return token;
  }

  /**
   * sends refresh token on even trigger
   * @param event event name
   */
  private sendRefeshTokenEventListener(event: string): void {
    eventEmitter.on(event, ({ refreshToken }: { refreshToken: string }) => {
      AuthServices._res.cookie("jid", refreshToken, {
        httpOnly: true,
        path: "/auth/refresh_token",
      });
      httpLogger.http("Refresh Token Sent");
    });
  }
}

export const authServiceInstance = Container.get(AuthServices);
