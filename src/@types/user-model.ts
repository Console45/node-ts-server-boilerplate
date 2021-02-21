import { Document, Model } from "mongoose";

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
