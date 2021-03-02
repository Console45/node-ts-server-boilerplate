import supertest, { SuperTest, Test } from "supertest";
import app from "../../../app";

const request: SuperTest<Test> = supertest(app);

const pingUrl: string = "/ping";

describe(pingUrl, () => {
  test(`GET ${pingUrl}`, async () => {
    const res = await request.get(pingUrl);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      message: "health check is successful.",
      status: "success",
      data: null,
    });
  });
});
