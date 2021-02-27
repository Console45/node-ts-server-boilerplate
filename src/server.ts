import app from "./app";
import keys from "./constants/keys";
import { httpLogger } from "./utils/loggers";

app.listen(keys.PORT, () =>
  httpLogger.http(`Server is Listening on ${keys.PORT}`)
);
