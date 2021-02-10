const {
  connectDatabase,
  closeDatabase,
} = require("./src/database/database-config");

beforeAll(async () => {
  await connectDatabase();
});

afterAll(async () => {
  await closeDatabase();
});
