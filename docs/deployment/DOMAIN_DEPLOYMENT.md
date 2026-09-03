# Domain Deployment

## Purpose

The concrete DNS, SSL, CORS, cookie, and cross-subdomain configuration needed to make [`../architecture/DOMAIN_ARCHITECTURE.md`](../architecture/DOMAIN_ARCHITECTURE.md)'s subdomain design actually work in a browser, in both local dev and production.

## DNS (production)

| Record | Type | Points to |
|---|---|---|
| `domain.in`, `www.domain.in` | A/CNAME | `public-web` deployment |
| `clipper.domain.in` | CNAME | `clipper-app` deployment |
| `brand.domain.in` | CNAME | `brand-app` deployment |
| `admin.domain.in` | CNAME | `admin-app` deployment |
| `api.domain.in` | CNAME/A | `api` HTTP deployment |

`PRIMARY_DOMAIN` in the environment config is the only place the literal domain string needs to change when moving off the `domain.in` placeholder — see [`../architecture/DOMAIN_ARCHITECTURE.md`](../architecture/DOMAIN_ARCHITECTURE.md).

## SSL

TLS certificates for all five hostnames (a wildcard cert for `*.domain.in` plus the apex, or per-subdomain certs) terminated at the hosting provider's edge/load balancer — application code never handles raw TLS.

## CORS

`api.domain.in` allows credentialed requests (`Access-Control-Allow-Credentials: true`) only from the four known app origins (`PUBLIC_APP_URL`, `CLIPPER_APP_URL`, `BRAND_APP_URL`, `ADMIN_APP_URL`), read from environment config — never a wildcard `*` origin, since credentials are involved.

## Cookies & cross-subdomain authentication

The session cookie's `Domain` attribute is set to the shared parent domain (`.domain.in` in production, derived from `PRIMARY_DOMAIN`) with `Secure`, `HttpOnly`, `SameSite=Lax` — this is what lets a session created at `domain.in/login` be valid immediately at `clipper.domain.in`, `brand.domain.in`, and `admin.domain.in` without a second login. See [`../users/AUTHENTICATION_FLOW.md`](../users/AUTHENTICATION_FLOW.md).

## Local development subdomain setup

Real cookie-domain sharing requires real (sub)domains — `localhost:3000` and `localhost:3001` are different origins but not different subdomains of a shared parent, so cross-subdomain cookie behavior can't be fully exercised on plain `localhost` ports alone. To test it locally:

1. Most OS resolvers already route any `*.localhost` hostname to `127.0.0.1` — use `clipper.localhost:3001`, `brand.localhost:3002`, `admin.localhost:3003`, and `localhost:3000` for public-web.
2. Set `AUTH_COOKIE_DOMAIN=.localhost` locally so the cookie is shared across those hostnames.
3. If your OS doesn't auto-resolve `*.localhost`, add explicit entries to the hosts file (`/etc/hosts` or Windows' `C:\Windows\System32\drivers\etc\hosts`) mapping each hostname to `127.0.0.1`.

## Related documents

[`../architecture/DOMAIN_ARCHITECTURE.md`](../architecture/DOMAIN_ARCHITECTURE.md), [`../architecture/SECURITY_ARCHITECTURE.md`](../architecture/SECURITY_ARCHITECTURE.md), [`../users/AUTHENTICATION_FLOW.md`](../users/AUTHENTICATION_FLOW.md).
