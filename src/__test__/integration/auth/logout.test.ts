import mongoose from "mongoose";
import app from "../../../app";
import User from "../../../database/models/User";
import supertest, { SuperTest, Test } from "supertest";
import keys from "../../../constants/keys";
import { sign } from "jsonwebtoken";

const logoutUrl: string = "/auth/logout/";

const request: SuperTest<Test> = supertest(app);

describe(logoutUrl, () => {
  const userId = new mongoose.Types.ObjectId();
  const accessToken = sign(
    { userId: userId, tokenVersion: 0 },
    keys.JWT_ACCESS_TOKEN_SECRET
  );
  const testUser = {
    _id: userId,
    name: "test user four",
    email: "testuserfour@test.com",
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

  test(`POST ${logoutUrl}`, async () => {
    const response = await request
      .post(logoutUrl)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "User logout is successful"
    );
  });
});
