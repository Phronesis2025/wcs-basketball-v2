# Resend MCP Server Setup Guide

## Overview
This guide explains how to install and configure the Resend MCP server for use with Cursor. The MCP server allows automated email verification during E2E testing.

## Prerequisites
- Resend API key (from your Resend dashboard)
- Verified domain (if sending to addresses other than your own)
- Cursor IDE installed

## Installation Steps

### 1. Clone and Build (Already Completed)
The Resend MCP server has been cloned and built at:
```
C:\dev\mcp-send-email
```

### 2. Get Your Resend API Key
1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Copy your API key to clipboard
3. Keep this key secure - you'll need it for configuration

### 3. Configure in Cursor

#### Step 3.1: Open Cursor Settings
1. Press `Ctrl + Shift + P` (Windows) to open Command Palette
2. Type "Cursor Settings" and select it
3. Or go to: **File** → **Preferences** → **Settings** → **MCP**

#### Step 3.2: Add MCP Server Configuration
1. In Cursor Settings, select **MCP** from the left sidebar
2. Click **"Add new global MCP server"**
3. Add the following configuration:

```json
{
  "mcpServers": {
    "resend": {
      "type": "command",
      "command": "node",
      "args": ["C:\\dev\\mcp-send-email\\build\\index.js", "--key=YOUR_RESEND_API_KEY"],
      "env": {}
    }
  }
}
```

**Important**: Replace `YOUR_RESEND_API_KEY` with your actual Resend API key.

#### Alternative Configuration (Using Environment Variable)
If you prefer to use an environment variable for the API key:

```json
{
  "mcpServers": {
    "resend": {
      "type": "command",
      "command": "node",
      "args": ["C:\\dev\\mcp-send-email\\build\\index.js"],
      "env": {
        "RESEND_API_KEY": "YOUR_RESEND_API_KEY"
      }
    }
  }
}
```

#### Optional Configuration Options
You can also configure optional settings:

```json
{
  "mcpServers": {
    "resend": {
      "type": "command",
      "command": "node",
      "args": [
        "C:\\dev\\mcp-send-email\\build\\index.js",
        "--key=YOUR_RESEND_API_KEY",
        "--sender=your-verified-email@yourdomain.com",
        "--reply-to=support@yourdomain.com"
      ],
      "env": {}
    }
  }
}
```

**Configuration Parameters:**
- `--key`: Your Resend API key (required)
- `--sender`: Sender email address from verified domain (optional)
- `--reply-to`: Reply-to email address (optional)

**Note**: If you don't provide a sender email address, the MCP server will ask you to provide one each time you call the tool.

### 4. Restart Cursor
After adding the configuration, restart Cursor to load the MCP server.

### 5. Verify Installation
1. Open Cursor in Agent mode (select "Agent" from the dropdown in the bottom left)
2. Try asking Cursor: "Can you send a test email using the Resend MCP?"
3. Or test using the `email.md` file in the cloned repository:
   - Open `C:\dev\mcp-send-email\email.md`
   - Replace the `to:` email address with your own
   - Select all text and press `Ctrl + L`
   - Ask Cursor: "send this as an email"

## Usage in E2E Tests

The Resend MCP server can be used during test execution to:
- Verify emails were sent
- Check email logs
- Verify email delivery status
- Query email history

## Troubleshooting

### MCP Server Not Appearing
- Ensure the path to `build/index.js` is correct (use forward slashes or escaped backslashes)
- Restart Cursor after configuration
- Check Cursor's developer console for errors

### API Key Issues
- Verify your Resend API key is valid
- Ensure the API key has the correct permissions
- Check that the key is not expired or revoked

### Email Sending Fails
- Verify your domain is verified in Resend
- Check that the sender email matches a verified domain
- Review Resend dashboard for error logs

## Security Notes

- **Never commit your API key to version control**
- The API key in the MCP configuration is stored in Cursor's settings (local to your machine)
- Use environment variables for additional security if preferred
- Rotate your API keys regularly

## Resources

- [Resend MCP Documentation](https://resend.com/docs/knowledge-base/mcp-server#cursor)
- [Resend API Documentation](https://resend.com/docs)
- [MCP Protocol Documentation](https://modelcontextprotocol.io/)

## Next Steps

After configuration, this MCP server will be available for use in:
1. E2E test automation (email verification)
2. Development workflows (test email sending)
3. Debugging email delivery issues

The MCP server will be automatically available in Cursor's Agent mode once properly configured.

