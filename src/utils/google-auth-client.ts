import { OAuth2Client } from "google-auth-library";
import Container, { Token } from "typedi";

export const client: OAuth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  forceRefreshOnFailure: true,
});

export const GOOGLE_AUTH_CLIENT_TOKEN = new Token<OAuth2Client>(
  "google.client"
);
Container.set(GOOGLE_AUTH_CLIENT_TOKEN, client);
