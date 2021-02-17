import { Response } from "express";
import { Container, Service, Inject } from "typedi";
import { eventEmitter, Events } from "../utils/event-emitter";
import {
  IUserModel,
  IUser,
  AccessToken,
  USER_MODEL_TOKEN,
} from "../database/models/User";
import ApiError, { UnAuthorizedRequest } from "../utils/api-error";
import { sendRefreshToken } from "../utils/app-utils";

interface UserAndToken {
  user: IUser;
  accessToken: AccessToken;
}

@Service()
class AuthServices {
  @Inject(USER_MODEL_TOKEN)
  private readonly _userModel: IUserModel;
  private static _res: Response;
  constructor(userModel: IUserModel) {
    this._userModel = userModel;
    this.initalizeEventsListeners();
  }

  /**
   * Initializes event listeners
   */
  private initalizeEventsListeners(): void {
    eventEmitter.on(Events.REGISTER_USER, ({ user }: { user: IUser }) => {
      sendRefreshToken(AuthServices._res, user.createRefreshToken());
    });
    eventEmitter.on(Events.LOGIN_USER, ({ user }: { user: IUser }) => {
      sendRefreshToken(AuthServices._res, user.createRefreshToken());
    });
  }

  /**
   * set the response object
   */
  public set res(response: Response) {
    AuthServices._res = response;
  }

  /**
   * Registers a new user
   * @param body express request body
   * @returns object of user and accesstoken
   */
  public async registerUser(body: any): Promise<UserAndToken> {
    const existingUser: IUser = await this._userModel.findOne({
      email: body.email,
    });
    if (existingUser) {
      throw new ApiError(409, `email ${body.email} already exists`);
    }
    const user: IUser = new this._userModel(body);
    await user.save();
    const accessToken: AccessToken = await user.createAccessToken();
    eventEmitter.emit(Events.REGISTER_USER, { user });
    return { user, accessToken };
  }

  public async loginUser(body: any, params: any): Promise<UserAndToken> {
    const user: IUser = await this._userModel.findByCredentials(
      body.email,
      body.password
    );
    if (params.role === "admin" && user.role === "User") {
      throw new UnAuthorizedRequest("access denied.");
    }
    const accessToken: AccessToken = await user.createAccessToken();
    eventEmitter.emit(Events.LOGIN_USER, { user });
    return { user, accessToken };
  }
}

export const authServiceInstance = Container.get(AuthServices);
