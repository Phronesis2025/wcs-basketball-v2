# Stripe and Postman MCP Setup Guide

## ✅ Installation Complete

Both Stripe MCP and Postman MCP have been added to your `.cursor/mcp.json` configuration file.

---

## 🔑 Getting Your API Keys

### 1. Stripe API Key (Secret Key)

**Steps to get your Stripe Secret Key:**

1. **Log in to Stripe Dashboard**
   - Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
   - Sign in with your Stripe account

2. **Navigate to API Keys**
   - Click on **Developers** in the left sidebar
   - Click on **API keys**

3. **Get Your Secret Key**
   - Under **Secret key**, click **Reveal test key** (for test mode) or **Reveal live key** (for production)
   - Copy the key (starts with `sk_test_` for test mode or `sk_live_` for production)
   - ⚠️ **Important**: The secret key is only shown once when created. If you don't have one, click **Create secret key**

4. **Add to Environment**
   - The key will be read from your `.env.local` file as `STRIPE_SECRET_KEY`
   - If you already have this set up for your application, the MCP will use it automatically
   - Otherwise, add it to `.env.local`:
     ```bash
     STRIPE_SECRET_KEY=sk_test_your_key_here
     ```

**Important Notes:**
- Use **test keys** (start with `sk_test_`) for development and testing
- Use **live keys** (start with `sk_live_`) only for production
- Test mode is free and unlimited - perfect for E2E testing
- Keep your secret keys secure - never commit them to version control

**Stripe Dashboard Link:** [https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)

---

### 2. Postman API Key

**Steps to get your Postman API Key:**

1. **Log in to Postman**
   - Go to [https://www.postman.com](https://www.postman.com)
   - Sign in with your Postman account

2. **Navigate to API Keys**
   - Click on your **profile icon** (top right)
   - Select **Settings** from the dropdown
   - In the left sidebar, click **API Keys**

3. **Generate API Key**
   - If you don't have an API key, click **Generate API Key**
   - Give it a descriptive name (e.g., "Cursor MCP Integration")
   - Copy the generated API key
   - ⚠️ **Important**: The API key is only shown once when created

4. **Add to Environment**
   - Add it to your `.env.local` file:
     ```bash
     POSTMAN_API_KEY=your_postman_api_key_here
     ```

**Important Notes:**
- Postman API keys are free
- API keys don't expire automatically
- You can create multiple API keys for different purposes
- Keep your API keys secure - never commit them to version control

**Postman Settings Link:** [https://www.postman.com/settings/api-keys](https://www.postman.com/settings/api-keys)

---

## ⚙️ Configuration

### Current Configuration

Both MCPs have been added to `.cursor/mcp.json`:

**Stripe MCP:**
```json
"stripe": {
  "command": "npx",
  "args": ["-y", "@stripe/mcp", "--tools=all"],
  "env": {
    "STRIPE_SECRET_KEY": "${STRIPE_SECRET_KEY}"
  }
}
```

**Postman MCP:**
```json
"postman": {
  "url": "https://mcp.postman.com/mcp",
  "headers": {
    "Authorization": "Bearer ${POSTMAN_API_KEY}"
  },
  "env": {
    "POSTMAN_API_KEY": "${POSTMAN_API_KEY}"
  }
}
```

### Environment Variables Required

Make sure your `.env.local` file includes:

```bash
# Stripe MCP
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here

# Postman MCP
POSTMAN_API_KEY=your_postman_api_key_here
```

---

## 🔄 Activating the MCPs

After adding the API keys to `.env.local`:

1. **Restart Cursor** completely (close and reopen)
2. The MCPs will automatically load on startup
3. You can verify they're working by:
   - Checking Cursor's MCP status in settings
   - Trying to use Stripe/Postman tools in Agent mode

---

## ✅ Verification

### Stripe MCP Verification

Once configured, you can use Stripe MCP to:
- Query payment intents
- Check payment status
- View customer data
- Verify webhook events
- Check test mode transactions

**Test it:** Ask Cursor in Agent mode: "Check the latest Stripe payment intent"

### Postman MCP Verification

Once configured, you can use Postman MCP to:
- Query API collections
- Run API tests
- Check API responses
- Verify webhook endpoints
- View API documentation

**Test it:** Ask Cursor in Agent mode: "List my Postman collections"

---

## 🔧 Troubleshooting

### Stripe MCP Not Working

1. **Check API Key**
   - Verify `STRIPE_SECRET_KEY` is set in `.env.local`
   - Ensure key starts with `sk_test_` (test mode) or `sk_live_` (production)
   - Key should not have any extra spaces or quotes

2. **Check MCP Configuration**
   - Verify `.cursor/mcp.json` has the Stripe MCP entry
   - Restart Cursor after making changes

3. **Check Network**
   - Ensure you can access Stripe API (not blocked by firewall)

### Postman MCP Not Working

1. **Check API Key**
   - Verify `POSTMAN_API_KEY` is set in `.env.local`
   - Ensure key is valid (not expired or revoked)
   - Key should not have any extra spaces or quotes

2. **Check MCP Configuration**
   - Verify `.cursor/mcp.json` has the Postman MCP entry
   - Check that the URL is correct: `https://mcp.postman.com/mcp`
   - Restart Cursor after making changes

3. **Check Network**
   - Ensure you can access Postman API (not blocked by firewall)
   - Verify you're using the correct region (US or EU)

---

## 📚 Resources

### Stripe MCP
- **Documentation:** [https://docs.stripe.com/mcp](https://docs.stripe.com/mcp)
- **API Keys:** [https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
- **Test Mode Cards:** [https://stripe.com/docs/testing](https://stripe.com/docs/testing)

### Postman MCP
- **Documentation:** [https://learning.postman.com/docs/developer/postman-api/postman-mcp-server/](https://learning.postman.com/docs/developer/postman-api/postman-mcp-server/)
- **API Keys:** [https://www.postman.com/settings/api-keys](https://www.postman.com/settings/api-keys)
- **MCP Server Info:** [https://mcp.postman.com](https://mcp.postman.com)

---

## 🎯 Use Cases for Your Project

### Stripe MCP Use Cases
- ✅ **E2E Testing**: Verify payments during registration flow tests
- ✅ **Payment Verification**: Check payment status after webhooks
- ✅ **Customer Management**: Query customer data for test players
- ✅ **Webhook Testing**: Verify Stripe webhook events
- ✅ **Payment Metrics**: Check payment amounts and statuses

### Postman MCP Use Cases
- ✅ **API Testing**: Verify API endpoints during E2E tests
- ✅ **Webhook Testing**: Test Stripe webhook endpoints
- ✅ **API Documentation**: Access your API collection docs
- ✅ **Request/Response Verification**: Check API data structures
- ✅ **Integration Testing**: Automate API workflow testing

---

## ✨ Next Steps

1. ✅ Add `STRIPE_SECRET_KEY` to `.env.local`
2. ✅ Add `POSTMAN_API_KEY` to `.env.local`
3. ✅ Restart Cursor
4. ✅ Verify MCPs are working by testing with Agent mode
5. ✅ Use Stripe MCP in E2E tests for payment verification
6. ✅ Use Postman MCP for API testing and webhook verification

---

**Setup Complete!** 🎉

Both MCPs are configured and ready to use. Once you add the API keys to `.env.local` and restart Cursor, they'll be available for use in Agent mode.

