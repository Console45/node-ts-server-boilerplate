const {
  connectDatabase,
  closeDatabase,
} = require("./src/database/database-config");
require("reflect-metadata");

beforeAll(async () => {
  await connectDatabase();
});

afterAll(async () => {
  await closeDatabase();
});
