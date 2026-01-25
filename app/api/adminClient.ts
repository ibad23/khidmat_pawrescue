import { createClient } from "@supabase/supabase-js";

// Admin client with service role key - server-side only!
// Required for creating auth users programmatically
const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export default adminClient;
