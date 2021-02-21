import { Container, Token as DIToken } from "typedi";
import { Schema, model, HookNextFunction } from "mongoose";
import validator from "validator";
import rug from "random-username-generator";
import { compare, hash } from "bcrypt";
import { sign } from "jsonwebtoken";
import { NotFoundError, UnAuthorizedRequest } from "../../utils/api-error";
import keys from "../../constants/keys";
import {
  AccessToken,
  IUser,
  IUserModel,
  ResetPasswordToken,
  Role,
} from "../../@types/user-model";

const userSchema: Schema<IUser> = new Schema<IUser>(
  {
    name: { type: String, trim: true, required: true },
    email: {
      type: String,
      trim: true,
      unique: true,
      rquired: true,
      validate(value: string): any {
        if (!validator.isEmail(value)) throw new Error("not an email");
      },
    },
    password: { type: String, trim: true, required: true, minlength: 6 },
    role: {
      type: String,
      trim: true,
      required: true,
      enum: ["User", "Admin", "Super Admin"],
      default: "User",
    },
    accessTokens: [
      {
        token: {
          type: String,
        },
      },
    ],
    resetPasswordTokenVersion: {
      type: Number,
      default: 0,
    },
    refreshTokenVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.virtual("orders", {
  ref: "Order",
  localField: "_id",
  foreignField: "user",
});

userSchema.methods.toJSON = function (this: IUser): any {
  const clone: any = { ...this.toObject() };
  delete clone.__v;
  delete clone.password;
  delete clone.refreshTokenVersion;
  delete clone.resetPasswordTokenVersion;
  delete clone.accessTokens;
  return clone;
};

/**
 *
 * @param {number} minutes
 * @returns {string} new future time
 */
const generateFutureTime = (minutes: number): string => {
  return new Date(new Date().getTime() + minutes * 60000).toISOString();
};

userSchema.statics.findByCredentials = async (
  email: string,
  password: string
) => {
  const user: IUser | null = await User.findOne({ email });
  if (!user) throw new NotFoundError("account doesnt exist.");
  const isMatch = await compare(password, user.password);
  if (!isMatch) throw new UnAuthorizedRequest("invalid credentials.");
  return user;
};

userSchema.statics.findOrCreate = async (
  email: string,
  password: string,
  name?: string
) => {
  const user: IUser | null = await User.findOne({
    email,
  });

  if (!user) {
    const newUser: IUser = new User({
      email,
      password,
      name: name ? name : rug.generate(),
    });
    await newUser.save();
    return newUser;
  }
  return user;
};

userSchema.methods.isAdmin = function (this: IUser): boolean {
  if (this.role === Role.User) return false;
  return true;
};

userSchema.methods.isSuperAdmin = function (this: IUser): boolean {
  if (this.role !== Role.SuperAdmin) return false;
  return true;
};

userSchema.methods.createAccessToken = async function (
  this: IUser
): Promise<AccessToken> {
  const accessToken: string = sign(
    { userId: this._id.toString() },
    keys.JWT_ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
  const expTime = generateFutureTime(15);
  this.accessTokens.push({ token: accessToken });
  await this.save();
  return { accessToken, expTime };
};

userSchema.methods.createRefreshToken = function (this: IUser): string {
  const refreshToken: string = sign(
    { userId: this._id.toString(), tokenVersion: this.refreshTokenVersion },
    keys.JWT_REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
  return refreshToken;
};

userSchema.methods.createResetPasswordToken = function (
  this: IUser
): ResetPasswordToken {
  const resetPasswordToken: string = sign(
    {
      userId: this._id.toString(),
      tokenVersion: this.resetPasswordTokenVersion,
    },
    keys.RESET_PASSWORD_TOKEN_SECRET,
    { expiresIn: "30m" }
  );
  const expTime = generateFutureTime(30);
  return { resetPasswordToken, expTime };
};

userSchema.pre<IUser>(
  "save",
  async function (next: HookNextFunction): Promise<void> {
    if (this.isModified("password"))
      this.password = await hash(this.password, 8);
    next();
  }
);

const User = model<IUser, IUserModel>("User", userSchema);

export const USER_MODEL_TOKEN = new DIToken<IUserModel>("user.model");
Container.set(USER_MODEL_TOKEN, User);

export default User;
