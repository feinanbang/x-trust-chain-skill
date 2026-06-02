// Minimal X (Twitter) API v2 client for trust-chain.
//
// This file contains NO credentials. You supply your own via a .env file
// (copy .env.example -> .env and fill in your keys). The client reads them
// from the environment at runtime — nothing of the author's travels with it.
//
// Two auth modes are supported; you only need ONE:
//   1. OAuth 1.0a user context  — set X_API_KEY / X_API_SECRET /
//      X_ACCESS_TOKEN / X_ACCESS_SECRET (needed for some endpoints).
//   2. App-only bearer token     — set X_BEARER_TOKEN (simpler; read-only).
//
// HTTPS_PROXY is optional: set it only if your network needs a proxy to
// reach api.twitter.com. Most users should leave it unset.

const { TwitterApi } = require("twitter-api-v2");

function optionalProxyAgent() {
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  if (!proxy) return undefined;
  // Lazy-require so the dependency is optional for users without a proxy.
  const { HttpsProxyAgent } = require("https-proxy-agent");
  return new HttpsProxyAgent(proxy);
}

/**
 * Build an authenticated X API v2 client from environment variables.
 * Throws a clear, actionable error if no credentials are configured.
 * @returns {import("twitter-api-v2").TwitterApi}
 */
function buildClient() {
  const agent = optionalProxyAgent();
  const opts = agent ? { httpAgent: agent } : {};

  const { X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET, X_BEARER_TOKEN } = process.env;

  if (X_API_KEY && X_API_SECRET && X_ACCESS_TOKEN && X_ACCESS_SECRET) {
    return new TwitterApi(
      {
        appKey: X_API_KEY,
        appSecret: X_API_SECRET,
        accessToken: X_ACCESS_TOKEN,
        accessSecret: X_ACCESS_SECRET,
      },
      opts,
    );
  }

  if (X_BEARER_TOKEN) {
    return new TwitterApi(X_BEARER_TOKEN, opts);
  }

  throw new Error(
    "No X API credentials found. Copy .env.example to .env and fill in either " +
      "your OAuth 1.0a keys (X_API_KEY/X_API_SECRET/X_ACCESS_TOKEN/X_ACCESS_SECRET) " +
      "or an app-only X_BEARER_TOKEN. Get keys at https://developer.x.com.",
  );
}

module.exports = { buildClient };
