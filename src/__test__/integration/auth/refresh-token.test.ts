import User from "../../../database/models/User";
import supertest, { SuperTest, Test } from "supertest";
import app from "../../../app";
import { sign } from "jsonwebtoken";
import keys from "../../../constants/keys";

const request: SuperTest<Test> = supertest(app);
const refreshTokenUrl = "/auth/refresh_token";

describe(refreshTokenUrl, () => {
  const userId = "test-user id";
  const refreshToken = sign(
    { userId: userId, tokenVersion: 0 },
    keys.JWT_REFRESH_TOKEN_SECRET
  );
  const revokedToken = sign(
    { userId: userId, tokenVersion: 1 },
    keys.JWT_REFRESH_TOKEN_SECRET
  );
  const testUserTwo = {
    name: "test refresh",
    email: "testrefresh@t.com",
    password: "sadgdgddgig",
  };
  beforeEach(async () => {
    await User.deleteMany({});
    await new User({ _id: userId, ...testUserTwo }).save();
  });
  test(`POST ${refreshTokenUrl}`, async () => {
    const response = await request
      .post(refreshTokenUrl)
      .set("Cookie", [`jid=${refreshToken}`]);
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty("token");
  });
  it(`Should return 403 on revoked refresh token with POST ${refreshTokenUrl}`, async () => {
    const response = await request
      .post(refreshTokenUrl)
      .set("Cookie", [`jid=${revokedToken}`]);
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("message", "Token has been revoked");
  });
});
