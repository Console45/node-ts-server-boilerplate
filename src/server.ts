import app from "./app";
import keys from "./constants/config/keys";

app.listen(keys.PORT, () => console.log(`server is listening on ${keys.PORT}`));
