# Real-time Message Board Troubleshooting Guide

## Issue: Messages Not Syncing Between Browsers

### Step 1: Enable Realtime in Supabase Dashboard

1. **Go to Supabase Dashboard** → Your Project → Database → Replication
2. **Check if Realtime is enabled** for your project
3. **If not enabled**, enable it in the Replication settings

### Step 2: Enable Realtime for Message Tables

Run this SQL in Supabase SQL Editor:

```sql
-- Enable Realtime for Message Board Tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.coach_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.coach_message_replies;

-- Verify tables are added to publication
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename IN ('coach_messages', 'coach_message_replies');
```

### Step 3: Check Browser Console

1. **Open Developer Tools** (F12) in both browsers
2. **Look for console logs** starting with `[DEV]` or `Real-time`
3. **Check for errors** related to Supabase or WebSocket connections

### Step 4: Test Real-time Connection

1. **Click the "Test" button** in the message board
2. **Check console logs** for real-time status messages
3. **Look for** "Successfully subscribed to real-time updates"

### Step 5: Verify Database Changes

1. **Create a test message** in one browser
2. **Check Supabase Dashboard** → Table Editor → coach_messages
3. **Verify the message was created** in the database
4. **Check if real-time events are triggered**

### Step 6: Check Network Tab

1. **Open Developer Tools** → Network tab
2. **Look for WebSocket connections** to Supabase
3. **Check for failed requests** or connection errors

### Step 7: Alternative Debugging

If real-time still doesn't work, try this manual test:

1. **Open two browser tabs** with the dashboard
2. **Create a message** in tab 1
3. **Click the refresh button (↻)** in tab 2
4. **Check if the message appears** (this tests the database, not real-time)

### Common Issues and Solutions

#### Issue: "Real-time subscription error"

- **Solution**: Check if Realtime is enabled in Supabase Dashboard
- **Solution**: Verify the tables are added to the supabase_realtime publication

#### Issue: "WebSocket connection failed"

- **Solution**: Check your internet connection
- **Solution**: Try refreshing the page
- **Solution**: Check if your firewall blocks WebSocket connections

#### Issue: "Channel subscription failed"

- **Solution**: Check if RLS policies allow the user to read the tables
- **Solution**: Verify the user is authenticated

#### Issue: Messages appear in database but not in UI

- **Solution**: Check browser console for JavaScript errors
- **Solution**: Verify the loadMessages() function is working
- **Solution**: Check if the real-time subscription is actually triggering

### Testing Steps

1. **Enable Realtime** in Supabase Dashboard
2. **Run the SQL script** to add tables to publication
3. **Refresh both browser tabs**
4. **Create a message** in one tab
5. **Check if it appears** in the other tab automatically
6. **If not, click refresh** in the second tab to test database connectivity

### Fallback Solution

If real-time continues to not work, the manual refresh button (↻) will still allow users to see new messages by manually refreshing the message list.
