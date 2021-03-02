import { closeDatabase, connectDatabase } from "./src/database/database-config";

beforeAll(async () => {
  await connectDatabase();
});

afterAll(async () => {
  await closeDatabase();
});
