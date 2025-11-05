# MCP (Model Context Protocol) Setup Guide

**Last Updated**: January 2025  
**Status**: ✅ Configured

---

## Overview

This document consolidates all MCP-related setup and configuration information for the WCS Basketball v2.0 project.

---

## MCP Servers Configured

### 1. Supabase MCP

**Status**: ✅ Active  
**Configuration**: Uses environment variables for credentials

**Credentials:**
- Supabase Access Token: From `SUPABASE_ACCESS_TOKEN` environment variable
- Database Password: From `SUPABASE_DB_PASSWORD` environment variable
- Service Role Key: From `SUPABASE_SERVICE_ROLE_KEY` environment variable

**Security**: ✅ All credentials use environment variables (not hardcoded)

### 2. Stripe MCP

**Status**: ✅ Active  
**Configuration**: Uses environment variables

**API Key**: From `STRIPE_SECRET_KEY` environment variable

**Security Note**: The MCP configuration file (`.cursor/mcp.json`) is in `.gitignore` to prevent accidental exposure of credentials.

### 3. Postman MCP

**Status**: ✅ Active  
**Configuration**: Uses environment variables

**API Key**: From `POSTMAN_API_KEY` environment variable

**Security Note**: The MCP configuration file (`.cursor/mcp.json`) is in `.gitignore` to prevent accidental exposure of credentials.

### 4. Resend MCP

**Status**: ✅ Active  
**Configuration**: Uses environment variables

**API Key**: From `RESEND_API_KEY` environment variable

---

## Security Best Practices

### ✅ Implemented

1. **Environment Variables**: All MCP credentials use environment variables
2. **Git Ignore**: `.cursor/mcp.json` is in `.gitignore`
3. **No Hardcoded Keys**: No actual API keys in documentation
4. **Template Files**: Use `.cursor/mcp.json.template` for sharing configuration structure

### 🔒 Security Checklist

- ✅ `.cursor/mcp.json` is in `.gitignore`
- ✅ No actual API keys committed to git
- ✅ All credentials use environment variables
- ✅ Documentation uses placeholder values only

---

## Configuration Files

### `.cursor/mcp.json`

**Location**: `.cursor/mcp.json` (not in git)  
**Purpose**: Contains MCP server configurations

**Security**: This file is git-ignored and should never be committed.

**Example Structure** (without actual keys):
```json
{
  "mcpServers": {
    "supabase": {
      "env": {
        "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}",
        "SUPABASE_DB_PASSWORD": "${SUPABASE_DB_PASSWORD}",
        "SUPABASE_SERVICE_ROLE_KEY": "${SUPABASE_SERVICE_ROLE_KEY}"
      }
    },
    "stripe": {
      "env": {
        "STRIPE_SECRET_KEY": "${STRIPE_SECRET_KEY}"
      }
    },
    "postman": {
      "env": {
        "POSTMAN_API_KEY": "${POSTMAN_API_KEY}"
      }
    }
  }
}
```

### `.cursor/mcp.json.template`

**Location**: `.cursor/mcp.json.template` (in git)  
**Purpose**: Template file showing MCP configuration structure without sensitive data

---

## Troubleshooting

### MCP Not Working After Configuration Changes

**Solution**: Restart Cursor completely
1. Save all work
2. Close ALL Cursor windows
3. Wait 10 seconds
4. Reopen Cursor
5. MCP servers will reload with new configuration

### Environment Variables Not Resolving

**Issue**: Cursor's MCP system doesn't automatically load environment variables from `.env.local` files.

**Solution Options**:
1. Set system environment variables (Windows: `setx VARIABLE_NAME "value"`)
2. Use a script to inject env vars before starting Cursor
3. Reference actual values in `mcp.json` (ensure file is in `.gitignore`)

---

## Related Documentation

- `docs/ENVIRONMENT_SETUP.md` - Environment variable configuration
- `docs/security/SECURITY_AUDITS.md` - Security audit findings
- `docs/CHANGELOG.md` - MCP-related changes

---

## Important Notes

⚠️ **Never commit `.cursor/mcp.json` to git**

- The file is in `.gitignore` ✓
- If sharing the repository, only commit `.cursor/mcp.json.template`
- All actual API keys should be kept secure and never exposed

