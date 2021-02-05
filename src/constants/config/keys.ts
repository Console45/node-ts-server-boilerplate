interface Keys {
  PORT: string;
}

const defaults: Keys = {
  PORT: process.env.PORT!,
};

const testKeys: Keys = {
  ...defaults,
};

const prodKeys: Keys = {
  ...defaults,
};

const ciKeys: Keys = {
  ...defaults,
};

const devKeys: Keys = {
  ...defaults,
};

let keys: Keys;

switch (process.env.NODE_ENV) {
  case "development":
    keys = devKeys;
    break;
  case "prodKeys":
    keys = prodKeys;
  case "ci":
    keys = ciKeys;
  default:
    keys = testKeys;
    break;
}

export default keys;
