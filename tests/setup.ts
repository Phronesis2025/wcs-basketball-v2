// tests/setup.ts
import { createClient } from "@supabase/supabase-js";

// Mock functions for Playwright tests
const mockFn = (returnValue?: any) => {
  const fn: any = () => returnValue;
  fn.mockResolvedValue = (value: any) => {
    fn.mockReturnValue = () => value;
    return fn;
  };
  fn.mockReturnThis = () => fn;
  return fn;
};

// Mock Supabase client for all tests
const mockCreateClient = () => ({
  auth: {
    signInWithPassword: mockFn().mockResolvedValue({
      data: { user: { id: "550e8400-e29b-41d4-a716-446655440000" } }, // Mock coach user ID from DB_SETUP.md
      error: null,
    }),
    getUser: mockFn().mockResolvedValue({
      data: { user: { id: "550e8400-e29b-41d4-a716-446655440000" } },
      error: null,
    }),
  },
  from: mockFn((table: string) => ({
    select: mockFn().mockReturnThis(),
    eq: mockFn().mockReturnThis(),
    single: mockFn().mockReturnThis(),
    insert: mockFn().mockResolvedValue({ data: [{ id: "new-id" }], error: null }), // Mock successful insert
    update: mockFn().mockResolvedValue({ data: [{ id: "updated-id" }], error: null }), // Mock update
    delete: mockFn().mockResolvedValue({ error: null }), // Mock delete (soft delete)
    // Mock initial data from DB_SETUP.md for team_updates
    // Expand this as needed for specific tests
    data:
      table === "team_updates"
        ? [
            {
              id: "123e4567-e89b-12d3-a456-426614174000",
              team_id: "550e8400-e29b-41d4-a716-446655440001", // Sample team ID
              title: "Game Recap",
              content: "Great win against the Vipers!",
              image_url: null,
              created_by: "550e8400-e29b-41d4-a716-446655440000",
              created_at: "2025-02-10T12:00:00Z",
              deleted_at: null,
            },
          ]
        : [],
  })),
});

// Mock the createClient function
(createClient as any) = mockCreateClient;

// Add more mocks here as we expand tests (e.g., for CSRF, file uploads)
