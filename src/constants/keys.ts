interface Keys {
  PORT: string | number;
  MONGODB_URI: string;
  JWT_ACCESS_TOKEN_SECRET: string;
  JWT_REFRESH_TOKEN_SECRET: string;
  RESET_PASSWORD_TOKEN_SECRET: string;
}

const defaults: Omit<Keys, "MONGODB_URI"> = {
  PORT: process.env.PORT! || 4000,
  JWT_ACCESS_TOKEN_SECRET:
    "ahguidgishgifsuhdagifahisgdiybwqbytvqxyxbubtcgquybqsjf9jiqfjswhfuahxivuvsbaugisadububgbsagbvudbubsa",
  JWT_REFRESH_TOKEN_SECRET:
    "sagignasidgnignsigjfnasdisaidvninacoxinaismovcncsacivisandvosaidnxvixnagdsvnsadnvianingvisandginas",
  RESET_PASSWORD_TOKEN_SECRET:
    "siadfoaufnaivnscoagdmvsnxagsfagfmacxcbucnfbvgfsdcsvdkgsofgiwirtjredsorifdsgnfsgdinfgdsomfshoicn",
};

const devKeys: Keys = {
  ...defaults,
  MONGODB_URI: "",
};

const testKeys: Keys = {
  ...defaults,
  MONGODB_URI: "",
};

const prodKeys: Keys = {
  ...defaults,
  MONGODB_URI: "",
};

const ciKeys: Keys = {
  ...defaults,
  MONGODB_URI: "",
};

let keys: Keys;

switch (process.env.NODE_ENV) {
  case "development":
    keys = devKeys;
    break;
  case "production":
    keys = prodKeys;
  case "ci":
    keys = ciKeys;
  default:
    keys = testKeys;
    break;
}

export default keys;
