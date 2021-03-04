import mongoose from "mongoose";
import User from "../../../database/models/User";
import keys from "../../../constants/keys";
import supertest, { SuperTest, Test } from "supertest";
import app from "../../../app";
import { sign } from "jsonwebtoken";

const resetPasswordUrl = "/auth/reset_password";
const forgotPasswordUrl = "/auth/forgot_password";
const request: SuperTest<Test> = supertest(app);

describe(resetPasswordUrl, () => {
  const userThreeId = new mongoose.Types.ObjectId();
  const resetPasswordToken = sign(
    { userId: userThreeId, tokenVersion: 0 },
    keys.RESET_PASSWORD_TOKEN_SECRET
  );

  const revokedToken = sign(
    { userId: userThreeId, tokenVersion: 1 },
    keys.RESET_PASSWORD_TOKEN_SECRET
  );
  const testUserThree = {
    _id: userThreeId,
    name: "test refresset",
    email: "testrefresset@t.com",
    password: "sadgdgddgig",
  };
  beforeEach(async () => {
    await User.deleteMany({});
    await new User(testUserThree).save();
  });
  test(`POST ${forgotPasswordUrl}`, async () => {
    const response = await request
      .post(forgotPasswordUrl)
      .send({ email: testUserThree.email });
    expect(response.status).toBe(200);
  });
  it(`should return 404 on not registered email with POST ${forgotPasswordUrl}`, async () => {
    const response = await request
      .post(forgotPasswordUrl)
      .send({ email: "test@user.com" });
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Account does not exist");
  });
  test(`POST ${resetPasswordUrl}`, async () => {
    const response = await request
      .post(`${resetPasswordUrl}/${resetPasswordToken}`)
      .send({ password: "newTestPassword" });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty("user");
  });
  it(`should return 403 on revoked token with POST ${resetPasswordUrl}`, async () => {
    const response = await request
      .post(`${resetPasswordUrl}/${revokedToken}`)
      .send({ password: "newTestPassword" });
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("message", "Link has expired");
  });
  it(`should return 400 on using old password again with POST ${resetPasswordUrl}`, async () => {
    const response = await request
      .post(`${resetPasswordUrl}/${resetPasswordToken}`)
      .send({ password: testUserThree.password });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      "Old password and new password cannot be the same"
    );
  });
});
