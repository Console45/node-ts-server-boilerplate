interface Keys {
  PORT: string | number;
  MONGODB_URI: string;
  JWT_ACCESS_TOKEN_SECRET: string;
  JWT_REFRESH_TOKEN_SECRET: string;
  RESET_PASSWORD_TOKEN_SECRET: string;
}

const defaults: Keys = {
  PORT: process.env.PORT! || 4000,
  JWT_ACCESS_TOKEN_SECRET:
    "ahguidgishgifsuhdagifahisgdiybwqbytvqxyxbubtcgquybqsjf9jiqfjswhfuahxivuvsbaugisadububgbsagbvudbubsa",
  JWT_REFRESH_TOKEN_SECRET:
    "sagignasidgnignsigjfnasdisaidvninacoxinaismovcncsacivisandvosaidnxvixnagdsvnsadnvianingvisandginas",
  RESET_PASSWORD_TOKEN_SECRET:
    "siadfoaufnaivnscoagdmvsnxagsfagfmacxcbucnfbvgfsdcsvdkgsofgiwirtjredsorifdsgnfsgdinfgdsomfshoicn",
  MONGODB_URI: "[MONGODB_URI]",
};

const devKeys: Keys = {
  ...defaults,
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
