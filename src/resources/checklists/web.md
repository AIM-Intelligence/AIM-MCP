# Web Request Security Checklist

## Pre-Operation Checks
✅ Validate and sanitize all URLs
✅ Verify SSL/TLS certificate validity
✅ Check domain reputation and blacklists
✅ Confirm rate limiting policies
✅ Validate request headers and parameters

## During Operation
✅ Use HTTPS for all sensitive operations
✅ Implement request timeouts
✅ Apply rate limiting and backoff strategies
✅ Validate response content type and size
✅ Sanitize all received data

## Post-Operation
✅ Log all HTTP requests and responses
✅ Check for error patterns or anomalies
✅ Monitor for rate limit violations
✅ Verify no sensitive data in URL parameters
✅ Review response for security headers

## Red Flags - Abort if Detected
🚫 Requests to suspicious or blacklisted domains
🚫 Missing or invalid SSL certificates
🚫 Unusual redirect chains
🚫 Requests containing credentials in URL
🚫 Excessive request rates indicating DDoS attempts
