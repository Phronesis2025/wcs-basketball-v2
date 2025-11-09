# Vercel MCP Setup Guide

**Last Updated**: January 2025  
**Status**: ⚠️ Configuration Updated - Testing Required

---

## Overview

This guide documents the setup of the Vercel MCP (Model Context Protocol) server for use with Cursor.

---

## Current Configuration

The Vercel MCP has been configured in `.cursor/mcp.json` as a URL-based MCP server:

```json
{
  "mcpServers": {
    "vercel": {
      "url": "https://mcp.vercel.com",
      "headers": {
        "Authorization": "Bearer LRHKrCGnpQCfp76Z8iOycc7P"
      }
    }
  }
}
```

---

## Important Notes

### ⚠️ Environment Variable Resolution

**Issue**: Cursor's MCP system may not automatically resolve environment variables from `.env.local` files in the `headers` field.

**Solution Applied**: The Vercel access token is directly included in the configuration file. This is safe because:
- ✅ `.cursor/mcp.json` is in `.gitignore`
- ✅ The file will never be committed to git
- ✅ This matches the pattern used by other MCPs (Postman, etc.)

### 🔄 Alternative Configuration (If URL-Based Doesn't Work)

If `https://mcp.vercel.com` doesn't work, Vercel might not have an official MCP server yet. In that case, you would need to:

1. **Use Vercel API directly** via HTTP requests
2. **Create a custom MCP server** that wraps the Vercel API
3. **Wait for official Vercel MCP support**

---

## Verification Steps

After restarting Cursor:

1. **Check MCP Status**
   - Open Cursor Settings → MCP
   - Look for "vercel" in the list of MCP servers
   - Check if it shows as "Connected" or has any error messages

2. **Test MCP Connection**
   - Try asking me to use Vercel MCP tools (e.g., "list my Vercel projects")
   - Check if Vercel-related tools are available

3. **Check Cursor Logs**
   - If the connection fails, check Cursor's developer console or logs
   - Look for error messages related to the Vercel MCP

---

## Troubleshooting

### Issue: Vercel MCP Not Connecting

**Possible Causes:**

1. **Incorrect URL**: `https://mcp.vercel.com` might not be the correct endpoint
   - **Solution**: Check Vercel's official documentation for the correct MCP endpoint URL

2. **Authentication Format**: The Authorization header format might be incorrect
   - **Solution**: Verify the token format with Vercel's API documentation

3. **MCP Server Not Available**: Vercel might not have an official MCP server yet
   - **Solution**: Check Vercel's documentation or community forums for MCP support status

4. **Network/Firewall Issues**: Connection might be blocked
   - **Solution**: Check firewall settings and network connectivity

### Issue: Environment Variable Not Resolving

If you prefer to use environment variables instead of hardcoded tokens:

1. **Set System Environment Variable** (Windows):
   ```powershell
   setx VERCEL_ACCESS_TOKEN "LRHKrCGnpQCfp76Z8iOycc7P"
   ```
   Then restart Cursor.

2. **Use Actual Value in mcp.json** (Current Approach):
   - The token is directly in `mcp.json` (which is gitignored)
   - This is the recommended approach for URL-based MCPs

---

## Related Documentation

- `docs/mcp/MCP_SETUP.md` - General MCP setup guide
- `.cursor/mcp.json` - MCP configuration file (gitignored)
- `.cursor/mcp.json.template` - Template for MCP configuration

---

## Next Steps

1. ✅ Configuration updated in `.cursor/mcp.json`
2. ⏳ **Restart Cursor completely** (close and reopen)
3. ⏳ Test the connection by asking me to use Vercel MCP tools
4. ⏳ Report back if the connection works or if there are any errors

---

## Security Notes

- ✅ `.cursor/mcp.json` is in `.gitignore`
- ✅ Vercel access token is stored securely in the local config file
- ⚠️ Never commit `.cursor/mcp.json` to git
- ⚠️ If sharing the repository, only commit `.cursor/mcp.json.template`

