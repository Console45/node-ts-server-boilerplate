import mongoose from "mongoose";
import app from "../../../app";
import User from "../../../database/models/User";
import supertest, { SuperTest, Test } from "supertest";
import keys from "../../../constants/keys";
import { sign } from "jsonwebtoken";

const profileUrl: string = "/user/me";

const request: SuperTest<Test> = supertest(app);

describe(profileUrl, () => {
  const userId = new mongoose.Types.ObjectId();
  const accessToken = sign(
    { userId: userId, tokenVersion: 0 },
    keys.JWT_ACCESS_TOKEN_SECRET
  );
  const testUser = {
    _id: userId,
    name: "test user",
    email: "testuser@testuser.com",
    password: "test password",
    accessTokens: [
      {
        token: accessToken,
      },
    ],
  };
  beforeEach(async () => {
    await User.deleteMany({});
    await new User(testUser).save();
  });

  test(`GET ${profileUrl}`, async () => {
    const response = await request
      .get(profileUrl)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty("user");
  });
});
