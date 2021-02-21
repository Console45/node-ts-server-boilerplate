import { Response } from "express";
import { Container, Service, Inject } from "typedi";
import { eventEmitter, Events } from "../utils/event-emitter";
import { USER_MODEL_TOKEN } from "../database/models/User";
import ApiError, { UnAuthorizedRequest } from "../utils/api-error";
import { AccessToken, IUser, IUserModel } from "../@types/user-model";

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
    this.sendRefeshTokenEventListener(Events.REGISTER_USER);
    this.sendRefeshTokenEventListener(Events.LOGIN_USER);
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
  /**
   *
   * @param body user data
   * @param params route params
   */
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

  private sendRefeshTokenEventListener(event: string) {
    eventEmitter.on(event, ({ user }: { user: IUser }) => {
      AuthServices._res.cookie("jid", user.createRefreshToken(), {
        httpOnly: true,
        path: "/auth/refresh_token",
      });
    });
  }
}

export const authServiceInstance = Container.get(AuthServices);
