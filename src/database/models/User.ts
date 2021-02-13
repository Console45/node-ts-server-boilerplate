import { Schema, Document, model, HookNextFunction, Model } from "mongoose";
import validator from "validator";
import rug from "random-username-generator";
import { compare, hash } from "bcrypt";
import { sign } from "jsonwebtoken";
import { NotFoundError, UnAuthorizedRequest } from "../../utils/api-error";

interface Tokens {
  token: string;
}
/**
 * an enum of user roles
 * @enum {Role} Role
 */
export enum Role {
  Admin = "Admin",
  User = "User",
  SuperAdmin = "Super Admin",
}

interface Token {
  expTime: string;
}

/**
 * Interface for an Access Token
 * @interface AccessToken
 * @extends Token Token interface
 */
export interface AccessToken extends Token {
  accessToken: string;
}
/**
 * Interface for an Reset Password Token
 * @interface ResetPasswordToken
 * @extends Token Token interface
 */

export interface ResetPasswordToken extends Token {
  resetPasswordToken: string;
}

/**
 * Interface for the User Model
 * @interface IUser
 * @extends Document Mongoose Document Class
 */
export interface IUser extends Document {
  email: string;
  name: string;
  password: string;
  role: Role;
  accessTokens: Tokens[];
  refreshTokenVersion: number;
  resetPasswordTokenVersion: number;
  /**
   * Creates a new access token
   * @returns {AccessToken} access token
   */
  createAccessToken: () => Promise<AccessToken>;
  /**
   * Create a new refresh token
   * @returns {string} refresh token
   */
  createRefreshToken: () => string;
  /**
   * Create a new reset password token
   * @returns {ResetPasswordToken} reset password token
   */
  createResetPasswordToken: () => ResetPasswordToken;
  /**
   * Checks whether a user is an admin
   * @returns {boolean} True or False
   */
  isAdmin: () => boolean;
  /**
   * Checks whether a user is an super admin
   * @returns {boolean} True or False
   */
  isSuperAdmin: () => boolean;
  /**
   * Add a new product to cart or update the cart
   * @param {string} productId product id
   * @returns {void} returns void
   */
}

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
    password: { type: String, trim: true, required: true },
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
  if (!user) throw new NotFoundError("Account doesnt exist.");
  const isMatch = await compare(password, user.password);
  if (!isMatch) throw new UnAuthorizedRequest("Invalid credentials.");
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
    process.env.JWT_ACCESS_TOKEN_SECRET!,
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
    process.env.JWT_REFRESH_TOKEN_SECRET!,
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
    process.env.RESET_PASSWORD_TOKEN_SECRET!,
    { expiresIn: "30m" }
  );
  const expTime = generateFutureTime(30);
  return { resetPasswordToken, expTime };
};

export interface IUserModel extends Model<IUser> {
  /**
   * Find an existing user with credentials
   * @param {string} email
   * @param {string} password
   * @returns {IUser} returns an existing user
   */
  findByCredentials(email: string, password: string): Promise<IUser>;
  /**
   * Finds an existing user or creates a new one
   * @param {string} email
   * @param {string} password
   * @param name
   * @returns {IUser} returns an existing or new user
   *
   */
  findOrCreate(email: string, password: string, name?: string): Promise<IUser>;
}

userSchema.pre<IUser>(
  "save",
  async function (next: HookNextFunction): Promise<void> {
    if (this.isModified("password"))
      this.password = await hash(this.password, 8);
    next();
  }
);

const User = model<IUser, IUserModel>("User", userSchema);

export default User;
