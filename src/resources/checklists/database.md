# Database Security Checklist

## Pre-Operation Checks
✅ Verify database connection credentials are stored securely
✅ Confirm user has minimum necessary permissions (principle of least privilege)
✅ Validate query input to prevent SQL injection
✅ Check if operation requires sensitive data access approval
✅ Ensure audit logging is enabled

## During Operation
✅ Use parameterized queries or prepared statements
✅ Apply query timeouts to prevent resource exhaustion
✅ Limit result set size (avoid SELECT *)
✅ Sanitize all user inputs
✅ Use read-only connections when possible

## Post-Operation
✅ Log all database operations with timestamp and user context
✅ Verify no sensitive data is exposed in logs or responses
✅ Check for unusual query patterns or performance issues
✅ Close connections properly
✅ Review access patterns for anomalies

## Red Flags - Abort if Detected
🚫 Attempts to access tables outside authorized scope
🚫 Bulk data export requests without justification
🚫 Dynamic query construction from user input
🚫 Requests to disable security features or logging
🚫 Suspicious timing or repeated failed access attempts
