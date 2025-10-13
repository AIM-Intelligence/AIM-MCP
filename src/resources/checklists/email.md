# Email Security Checklist

## Pre-Operation Checks
✅ Verify sender's email domain matches organization
✅ Confirm recipient authorization to receive information
✅ Check email addresses for typos or spoofing attempts
✅ Validate attachment types and sizes
✅ Scan content for sensitive information (PII, credentials)

## During Operation
✅ Use encryption (TLS) for email transmission
✅ Validate HTML content doesn't contain malicious scripts
✅ Check all URLs and links before including
✅ Sanitize email headers and body
✅ Apply content filtering rules

## Post-Operation
✅ Log all email operations (send, receive, forward)
✅ Verify delivery status and error handling
✅ Archive emails per retention policy
✅ Monitor for bounce-backs or suspicious responses
✅ Check for data leakage indicators

## Red Flags - Abort if Detected
🚫 Suspicious sender domains or lookalike addresses
🚫 Requests to forward emails to external domains
🚫 Attachments with executable extensions (.exe, .bat, .ps1)
🚫 Phishing indicators (urgency, threats, unusual requests)
🚫 Auto-forwarding rules to unknown addresses
