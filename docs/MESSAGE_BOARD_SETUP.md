# Message Board Setup Instructions

## Database Migration Required

The message board feature requires database tables to be created. Follow these steps to set up the message board:

### Step 1: Apply Database Migration

1. Open your Supabase Dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `docs/coach_messages_migration.sql`
4. Execute the SQL script

### Step 2: Verify Tables Created

After running the migration, you should see these new tables in your Supabase dashboard:

- `coach_messages`
- `coach_message_replies`

### Step 3: Test the Message Board

1. Navigate to `/coaches/dashboard`
2. Scroll down to the "Coaches Message Board" section
3. Click "+ New Message" to create your first message
4. Test replying to messages
5. Test editing and deleting (if you're the author)

## Features Available After Setup

- ✅ Create new messages (1000 character limit)
- ✅ Reply to messages (500 character limit)
- ✅ Edit your own messages and replies
- ✅ Delete your own messages and replies
- ✅ Real-time updates across all users
- ✅ Admin pin/unpin functionality
- ✅ Soft delete (messages are hidden, not permanently deleted)
- ✅ Character counters and validation
- ✅ Mobile-responsive design
- ✅ **Unread Mentions Notification System** (v2.10.5):
  - Toast notification on login/page load when unread mentions exist
  - Red circle indicator with count next to user name in club management header
  - Clickable circle navigates to Messages section and scrolls to message board
  - Circle automatically hides when all mentions are marked as read
  - Real-time count updates when mentions are marked as read

## Troubleshooting

### Error: "Message board tables not yet created"

- This means the database migration hasn't been applied yet
- Follow Step 1 above to create the required tables

### Error: "Admin client not available"

- This has been fixed in the latest code update
- The message board now uses the regular Supabase client with RLS policies

### Messages not appearing in real-time

- Check that Supabase Realtime is enabled in your project settings
- Verify that the tables have the correct RLS policies applied

## Security Features

- Row Level Security (RLS) policies protect all data
- Users can only edit/delete their own content
- Admins have full access to all messages
- All content is validated and sanitized
- Soft deletes maintain data integrity

## Support

If you encounter any issues:

1. Check the browser console for error messages
2. Verify the database migration was applied correctly
3. Ensure your Supabase project has Realtime enabled
4. Check that your user has the correct role (coach or admin)
