
import { createRemoteJWKSet, jwtVerify, SignJWT } from "jose";
import crypto from "node:crypto";
import {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const GOOGLE_ISSUERS = new Set([
  "https://accounts.google.com",
  "accounts.google.com",
]);

const APPLE_ISSUER = "https://appleid.apple.com";
const HARD_CODED = {
  GOOGLE_CLIENT_IDS: [
    "223129001469-7ubvonadfqjc1ff6k4mjhmoafjsmk6rp.apps.googleusercontent.com",
    "223129001469-jni3q2lsd78idd2gn7bmcdpp5183rpu2.apps.googleusercontent.com",
  ],
  APPLE_CLIENT_IDS: [
    "com.cliqinvite.diamondtriviaapp",
    "com.cliqinvite.diamondtriviaapp.login",
  ],
  COGNITO_USER_POOL_ID: "us-east-1_IdeFz38xy",
  SOCIAL_AUTH_PASSWORD_PEPPER:
    "a4fd4b5a6a2a69f6e8d81ff2f768c9ac57e92f03a7eb09f9a2dbb3c8d0065a16",
  APP_JWT_SECRET:
    "c317603a8b7d5d0f8f0a0396b72a46d6f6bf0fc0fb14856d3749e1491fdbfd03",
  APP_JWT_TTL_SECONDS: 3600,
};

const googleJwks = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);
const appleJwks = createRemoteJWKSet(
  new URL("https://appleid.apple.com/auth/keys")
);

function getJsonBody(event) {
  if (!event?.body) return {};
  if (typeof event.body === "object") return event.body;

  try {
    return JSON.parse(event.body);
  } catch {
    return {};
  }
}

function listFromEnv(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function cors(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Access-Control-Allow-Methods": "OPTIONS,POST",
    },
    body: JSON.stringify(payload),
  };
}

async function verifyGoogleIdToken(idToken) {
  const audiences = listFromEnv(process.env.GOOGLE_CLIENT_IDS);
  const effectiveAudiences = audiences.length
    ? audiences
    : HARD_CODED.GOOGLE_CLIENT_IDS;

  const { payload } = await jwtVerify(idToken, googleJwks, {
    issuer: Array.from(GOOGLE_ISSUERS),
    audience: effectiveAudiences,
  });

  return {
    provider: "google",
    providerUserId: payload.sub,
    email: payload.email || null,
    emailVerified: Boolean(payload.email_verified),
    givenName: payload.given_name || null,
    familyName: payload.family_name || null,
    fullName: payload.name || null,
    picture: payload.picture || null,
  };
}

async function verifyAppleIdToken(idToken) {
  const audiences = listFromEnv(process.env.APPLE_CLIENT_IDS);
  const effectiveAudiences = audiences.length
    ? audiences
    : HARD_CODED.APPLE_CLIENT_IDS;

  const { payload } = await jwtVerify(idToken, appleJwks, {
    issuer: APPLE_ISSUER,
    audience: effectiveAudiences,
  });

  return {
    provider: "apple",
    providerUserId: payload.sub,
    email: payload.email || null,
    emailVerified:
      payload.email_verified === true || payload.email_verified === "true",
    givenName: null,
    familyName: null,
    fullName: null,
    picture: null,
  };
}

function computeAppUserId(profile) {
  return `${profile.provider}:${profile.providerUserId}`;
}

function buildCognitoUsername(profile) {
  const raw = `${profile.provider}_${profile.providerUserId}`;
  return raw.replace(/[^a-zA-Z0-9._@+-]/g, "_").slice(0, 128);
}

function buildDeterministicPassword(profile) {
  const pepper =
    process.env.SOCIAL_AUTH_PASSWORD_PEPPER ||
    process.env.APP_JWT_SECRET ||
    HARD_CODED.SOCIAL_AUTH_PASSWORD_PEPPER;

  const base = `${profile.provider}|${profile.providerUserId}`;
  const digest = crypto
    .createHmac("sha256", pepper)
    .update(base)
    .digest("hex");

  return `Dt!${digest.slice(0, 20)}aA1`;
}

async function ensureCognitoUser(profile) {
  const userPoolId =
    process.env.COGNITO_USER_POOL_ID || HARD_CODED.COGNITO_USER_POOL_ID;

  const client = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION || process.env.REGION || "us-east-1",
  });

  const username = buildCognitoUsername(profile);
  const password = buildDeterministicPassword(profile);
  let isNewUser = false;

  try {
    await client.send(
      new AdminGetUserCommand({
        UserPoolId: userPoolId,
        Username: username,
      })
    );
  } catch (error) {
    const notFound =
      error?.name === "UserNotFoundException" ||
      error?.Code === "UserNotFoundException";

    if (!notFound) {
      throw error;
    }

    isNewUser = true;
    const attrs = [
      { Name: "email_verified", Value: profile.emailVerified ? "true" : "false" },
      { Name: "name", Value: profile.fullName || [profile.givenName, profile.familyName].filter(Boolean).join(" ") || username },
    ];

    if (profile.email) {
      attrs.push({ Name: "email", Value: profile.email });
    }

    await client.send(
      new AdminCreateUserCommand({
        UserPoolId: userPoolId,
        Username: username,
        UserAttributes: attrs,
        MessageAction: "SUPPRESS",
      })
    );
  }

  await client.send(
    new AdminSetUserPasswordCommand({
      UserPoolId: userPoolId,
      Username: username,
      Password: password,
      Permanent: true,
    })
  );

  const updateAttrs = [];
  if (profile.email) {
    updateAttrs.push({ Name: "email", Value: profile.email });
    updateAttrs.push({
      Name: "email_verified",
      Value: profile.emailVerified ? "true" : "false",
    });
  }
  if (profile.fullName || profile.givenName || profile.familyName) {
    updateAttrs.push({
      Name: "name",
      Value:
        profile.fullName ||
        [profile.givenName, profile.familyName].filter(Boolean).join(" "),
    });
  }

  if (updateAttrs.length) {
    await client.send(
      new AdminUpdateUserAttributesCommand({
        UserPoolId: userPoolId,
        Username: username,
        UserAttributes: updateAttrs,
      })
    );
  }

  return { username, password, isNewUser };
}

async function mintAppToken(profile) {
  const secret = process.env.APP_JWT_SECRET || HARD_CODED.APP_JWT_SECRET;
  if (!secret) return null;

  const ttlSeconds = Number(
    process.env.APP_JWT_TTL_SECONDS || HARD_CODED.APP_JWT_TTL_SECONDS
  );
  const now = Math.floor(Date.now() / 1000);

  const jwt = await new SignJWT({
    sub: computeAppUserId(profile),
    provider: profile.provider,
    providerUserId: profile.providerUserId,
    email: profile.email,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(now)
    .setExpirationTime(now + ttlSeconds)
    .setIssuer("diamond-trivia-social-auth")
    .sign(new TextEncoder().encode(secret));

  return jwt;
}

export const handler = async (event) => {
  if (
    event?.requestContext?.http?.method === "OPTIONS" ||
    event?.httpMethod === "OPTIONS"
  ) {
    return cors(200, { ok: true });
  }

  if (
    (event?.requestContext?.http?.method &&
      event.requestContext.http.method !== "POST") ||
    (event?.httpMethod && event.httpMethod !== "POST")
  ) {
    return cors(405, { ok: false, message: "Method not allowed. Use POST." });
  }

  try {
    const body = getJsonBody(event);
    const { action, provider, idToken, email, givenName, familyName } = body;

    if (action !== "nativeSocialSignIn") {
      return cors(400, { ok: false, message: "Unsupported action." });
    }

    if (!provider || !idToken) {
      return cors(400, {
        ok: false,
        message: "Missing required fields: provider and idToken.",
      });
    }

    let profile;
    if (provider === "google") {
      profile = await verifyGoogleIdToken(idToken);
    } else if (provider === "apple") {
      profile = await verifyAppleIdToken(idToken);
      if (!profile.email && email) profile.email = email;
      if (!profile.givenName && givenName) profile.givenName = givenName;
      if (!profile.familyName && familyName) profile.familyName = familyName;
    } else {
      return cors(400, {
        ok: false,
        message: "Unsupported provider. Use 'google' or 'apple'.",
      });
    }

    const appToken = await mintAppToken(profile);
    const cognito = await ensureCognitoUser(profile);

    return cors(200, {
      ok: true,
      message: "Native social token verified.",
      cognito,
      user: {
        id: computeAppUserId(profile),
        ...profile,
      },
      appToken,
      appTokenType: appToken ? "Bearer" : null,
    });
  } catch (error) {
    console.error("social-auth-error", error);
    return cors(401, {
      ok: false,
      message: error?.message || "Social token verification failed.",
    });
  }
};
