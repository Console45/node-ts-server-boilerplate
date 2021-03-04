import app from "../../../app";
import User from "../../../database/models/User";
import supertest, { SuperTest, Test } from "supertest";

const request: SuperTest<Test> = supertest(app);
const loginUrl: string = "/auth/login";
const loginUserUrl = `${loginUrl}/user`;
const loginAdminUrl = `${loginUrl}/admin`;

describe(loginUrl, () => {
  const testUserOne = {
    name: "test user one",
    email: "testuserone@test.com",
    password: "testonepassword",
    role: "User",
  };
  const testAdminOne = {
    name: "test admin one",
    email: "testadminone@test.com",
    password: "testonepassword",
    role: "Admin",
  };
  beforeEach(async () => {
    await User.deleteMany({});
  });
  test(`POST ${loginUserUrl}`, async () => {
    await new User(testUserOne).save();
    const response = await request
      .post(loginUserUrl)
      .send({ email: testUserOne.email, password: testAdminOne.password });
    expect(response.status).toBe(200);
    expect(response.body).not.toBeEmpty();
    expect(response.body).toHaveProperty("status", "success");
  });
  test(`POST ${loginAdminUrl}`, async () => {
    await new User(testAdminOne).save();
    const response = await request
      .post(loginAdminUrl)
      .send({ email: testAdminOne.email, password: testAdminOne.password });
    expect(response.status).toBe(200);
    expect(response.body).not.toBeEmpty();
    expect(response.body.data.user.role).toBe("Admin" || "Super Admin");
    expect(response.body).toHaveProperty("status", "success");
  });
  it(`Should return 401 on user login with POST ${loginAdminUrl}`, async () => {
    await new User(testUserOne).save();
    const response = await request
      .post(loginAdminUrl)
      .send({ email: testUserOne.email, password: testAdminOne.password });
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("status", "error");
    expect(response.body).toHaveProperty("message", "Access denied");
  });
  it(`Should return 404 on non existing email with ${loginUserUrl}`, async () => {
    await new User(testUserOne).save();
    const response = await request
      .post(loginUserUrl)
      .send({ email: "randomemail@email.com", password: testUserOne.password });
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("status", "error");
    expect(response.body).toHaveProperty("message", "Account doesnt exist");
  });
  it(`Should return 401 on invalid password with ${loginUserUrl}`, async () => {
    await new User(testUserOne).save();
    const response = await request.post(loginUserUrl).send({
      email: testUserOne.email,
      password: "randompassword",
    });
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("status", "error");
    expect(response.body).toHaveProperty("message", "Invalid credentials");
  });
  it(`should return 400 on malformed data with POST ${loginUserUrl}`, async () => {
    const response = await request
      .post(loginUserUrl)
      .send({ email: testUserOne.email });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("status", "error");
  });
});
