import { connect, disconnect, connection } from "mongoose";
import keys from "src/constants/keys";

type Connection = () => Promise<void>;
type Disconnection = () => Promise<void>;

/**
 * A function that creates a connection to the database
 */
export const connectDatabase: Connection = async () => {
  await connect(keys.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
};

/**
 * A function that closes a database connection and drops the database
 */
export const closeDatabase: Disconnection = async () => {
  await connection.dropDatabase();
  await disconnect();
};
