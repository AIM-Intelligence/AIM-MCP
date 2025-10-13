# File Operations Security Checklist

## Pre-Operation Checks
✅ Validate file path to prevent directory traversal
✅ Verify file type matches expected MIME type
✅ Check file size against allowed limits
✅ Confirm user has appropriate read/write permissions
✅ Scan for malware or malicious content

## During Operation
✅ Use secure file handling APIs
✅ Validate file extensions and content
✅ Apply sandboxing for file processing
✅ Encrypt sensitive files at rest
✅ Use secure temporary directories

## Post-Operation
✅ Log all file operations (read, write, delete)
✅ Clean up temporary files
✅ Verify file integrity (checksums)
✅ Update file access audit trail
✅ Check for unauthorized file modifications

## Red Flags - Abort if Detected
🚫 Path traversal attempts (../, ..\\ patterns)
🚫 Executable file uploads without approval
🚫 Files with double extensions (.pdf.exe)
🚫 Unusual file access patterns or bulk operations
🚫 Attempts to access system files or directories
