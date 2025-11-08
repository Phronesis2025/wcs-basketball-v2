# Getting a Domain for Email - Quick Options

**Problem**: Resend requires a verified domain to send emails to real recipients  
**Solution**: Get a cheap domain (can be as low as $1-2/year)

---

## 🚀 Quick Domain Options

### Option 1: Cheap Domain Registrars (Recommended)

**Best for**: Quick setup, low cost

1. **Namecheap** - Often has $0.99-$1.99/year deals

   - Go to [namecheap.com](https://www.namecheap.com)
   - Search for domains (try `.xyz`, `.site`, `.online` for cheapest options)
   - Can get domains for $1-2/year
   - Example: `wcsbasketball.xyz` or `wcsbasketball.site`

2. **Google Domains** (now Squarespace Domains)

   - Simple interface
   - Usually $12-15/year for `.com` domains
   - Example: `wcsbasketball.com`

3. **Cloudflare Registrar**
   - At-cost pricing (no markup)
   - Usually $8-12/year for `.com`
   - Example: `wcsbasketball.com`

### Option 2: Free Subdomain Services

**Best for**: Testing only (not recommended for production)

- **Freenom** - Free `.tk`, `.ml`, `.ga` domains (limited reliability)
- **No-IP** - Free subdomains (not suitable for email verification)

**⚠️ Note**: Free domains often have restrictions and may not work with Resend verification.

### Option 3: Use Existing Domain

**Best for**: If you have any domain already

- If you own ANY domain (even if not using it for the website)
- You can verify it in Resend
- Use it just for email (e.g., `noreply@yourdomain.com`)
- Doesn't need to match your website domain

---

## ✅ Recommended: Get a Cheap Domain

### Step-by-Step (5-10 minutes)

1. **Go to Namecheap** (or your preferred registrar)
2. **Search for a domain**:
   - Try: `wcsbasketball.xyz` or `wcsbasketball.site` (cheapest)
   - Or: `wcsbasketball.com` (more professional, $10-15/year)
3. **Purchase the domain** ($1-15 depending on TLD)
4. **Access DNS settings** in your registrar's dashboard
5. **Add Resend DNS records** (see `docs/RESEND_DOMAIN_VERIFICATION_GUIDE.md`)
6. **Verify in Resend** (1-4 hours)
7. **Update `RESEND_FROM` in Vercel**

**Total Cost**: $1-15/year  
**Time**: 5-10 minutes to purchase, 1-4 hours for DNS verification

---

## 💡 Temporary Workaround (Until Domain Ready)

**For now**, the code is already set up to route ALL emails to `phronesis700@gmail.com` when using sandbox mode. This means:

1. ✅ **All emails will be received** at `phronesis700@gmail.com`
2. ✅ **You can manually forward** important emails to parents
3. ✅ **You can test the full flow** to ensure everything works
4. ✅ **Once domain is verified**, just update `RESEND_FROM` and emails will automatically go to real recipients

**Current Behavior**:

- Parent registration emails → `phronesis700@gmail.com`
- Admin notification emails → `phronesis700@gmail.com`
- Approval emails → `phronesis700@gmail.com`
- Payment confirmation emails → `phronesis700@gmail.com`

**Email body will show**: Original intended recipient in a yellow box at the top

---

## 🎯 Recommended Action Plan

1. **Immediate**: Continue testing with emails going to `phronesis700@gmail.com`
2. **This Week**: Purchase a cheap domain ($1-15)
3. **This Week**: Verify domain in Resend (1-4 hours)
4. **This Week**: Update `RESEND_FROM` in Vercel
5. **Done**: Emails will automatically work for all recipients

---

## 📝 Domain Suggestions

**Cheap Options** ($1-5/year):

- `wcsbasketball.xyz`
- `wcsbasketball.site`
- `wcsbasketball.online`
- `wcsbasketball.tech`

**Professional Options** ($10-15/year):

- `wcsbasketball.com`
- `wcsbasketball.org`
- `westcoastsports.com`

**Note**: The domain doesn't need to match your website URL. You can use it just for email!

---

## ✅ Once You Have a Domain

1. Follow `docs/RESEND_DOMAIN_VERIFICATION_GUIDE.md` to verify it
2. Update `RESEND_FROM` in Vercel
3. Redeploy
4. Emails will automatically work! 🎉
