# Namecheap DNS Setup - Quick Reference

**Domain**: `wcsbasketball.site`  
**Purpose**: Add DNS records from Resend to enable email sending

---

## 📍 Where to Find DNS Settings in Namecheap

1. **Log in**: https://www.namecheap.com
2. **Go to**: Domain List (left sidebar or top menu)
3. **Click**: "Manage" next to `wcsbasketball.site`
4. **Click**: "Advanced DNS" tab
5. **Find**: "Host Records" section (scroll down if needed)
6. **Click**: "Add New Record" button to add each record

---

## 📋 Records to Add (Copy from Resend)

### Record 1: DKIM (Domain Verification)
- **Type**: `TXT Record`
- **Host**: `resend._domainkey`
- **Value**: [Copy entire Content from Resend - long string starting with `p=MIGf...`]

### Record 2: MX (Enable Sending)
- **Type**: `MX Record`
- **Host**: `send`
- **Value**: [Copy Content from Resend - looks like `feedback-smtp.us-east-...`]
- **Priority**: `10`

### Record 3: SPF (Enable Sending)
- **Type**: `TXT Record`
- **Host**: `send`
- **Value**: [Copy entire Content from Resend - starts with `v=spf1 include:amazons...`]

### Record 4: DMARC (Enable Sending - Optional)
- **Type**: `TXT Record`
- **Host**: `_dmarc`
- **Value**: [Copy Content from Resend - usually `v=DMARC1; p=none;`]

---

## ✅ After Adding All Records

1. **Verify in Namecheap**: You should see all 4 records in your Host Records table
2. **Go to Resend**: https://resend.com/domains
3. **Click**: "Verify" button next to `wcsbasketball.site`
4. **Wait**: 1-4 hours for DNS propagation (usually faster)
5. **Check**: Status should change from "Pending" to "Verified" ✅

---

## 🎯 Namecheap Interface Tips

- **Host Records Table**: Shows all your DNS records
- **Add New Record**: Green button or link to add records
- **Type Dropdown**: Select TXT Record or MX Record
- **Host Field**: Enter the hostname (e.g., `send`, `resend._domainkey`, `_dmarc`)
- **Value Field**: Paste the long Content string from Resend
- **Save**: Green checkmark icon or Save button
- **Edit**: Pencil icon to modify existing records
- **Delete**: Trash icon to remove records

---

## ⚠️ Common Mistakes to Avoid

- ❌ Don't include `http://` or `www.` in hostnames
- ❌ Don't truncate the long Content values - copy the ENTIRE string
- ❌ Don't forget the underscore in `_dmarc`
- ❌ Don't forget Priority `10` for the MX record
- ✅ Do match hostnames exactly (case-sensitive)
- ✅ Do copy the complete Content values from Resend

---

**Need Help?** See `docs/SETUP_WCSBASKETBALL_SITE.md` for detailed step-by-step instructions.

