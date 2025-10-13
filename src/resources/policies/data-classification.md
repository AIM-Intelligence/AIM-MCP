# Data Classification Policy

## Classification Levels

### 🟢 PUBLIC
- **Definition**: Information intended for public disclosure
- **Examples**: Marketing materials, published documentation, public website content
- **Handling**: Standard business practices, no special restrictions
- **Transmission**: Any method (email, web, public cloud)
- **Storage**: No encryption required

### 🟡 INTERNAL
- **Definition**: Information for internal use only
- **Examples**: Internal memos, organizational charts, internal project documentation
- **Handling**: Share only with employees and authorized contractors
- **Transmission**: Encrypted email, secure internal systems
- **Storage**: Access-controlled systems

### 🟠 CONFIDENTIAL
- **Definition**: Sensitive business information
- **Examples**: Financial data, business plans, customer data, employee records
- **Handling**: Need-to-know basis, require authorization
- **Transmission**: Encrypted channels only
- **Storage**: Encrypted at rest, access logging required

### 🔴 RESTRICTED
- **Definition**: Highly sensitive information requiring maximum protection
- **Examples**: Trade secrets, M&A plans, security credentials, regulated data (PII, PHI)
- **Handling**: Strictly need-to-know, senior approval required
- **Transmission**: End-to-end encryption, approved channels only
- **Storage**: Encrypted, multi-factor authentication, comprehensive audit logging

## Handling Requirements by Classification

| Requirement | Public | Internal | Confidential | Restricted |
|-------------|--------|----------|--------------|-----------|
| Encryption in Transit | Optional | Recommended | Required | Required (E2E) |
| Encryption at Rest | No | No | Yes | Yes |
| Access Logging | No | Recommended | Required | Required |
| Multi-Factor Auth | No | No | Recommended | Required |
| Data Loss Prevention | No | Optional | Required | Required |
| Regular Access Review | No | Annual | Quarterly | Monthly |
| Incident Response | Standard | Standard | Priority | Critical |
