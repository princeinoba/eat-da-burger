# Security policy

## Supported release

The current clean-room BurgerForge AI source is the supported portfolio release.

## Reporting

Use the GitHub Security Advisory flow for `princeinoba/eat-da-burger` or the final owner-approved release repository. Do not disclose active secrets publicly.

## Security boundaries

- No account or server-side user profile.
- No database.
- Board and journal are browser-local.
- Provider credentials remain server-side.
- Preference requests are bounded and allowlisted.
- Provider requests have a timeout.
- Provider errors are normalized.
- The service worker excludes API requests.
- Vercel headers include CSP, HSTS, frame denial, MIME protection, referrer and permissions policies.

## Food safety is outside the security guarantee

BurgerForge cannot verify allergens, cross-contact, medical diets, nutrition or cooking safety. Those claims require authoritative sources and qualified review.

## Future cloud release

A shared product requires authentication, ownership, abuse controls, distributed rate limiting, retention/deletion, monitoring, backups and incident response before launch.
