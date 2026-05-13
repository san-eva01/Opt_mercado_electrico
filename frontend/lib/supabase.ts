import {createClient} from "@supabase/supabase-js";

const supabaseUrl = "https://uzfsdviemqdyfjrtgyck.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6ZnNkdmllbXFkeWZqcnRneWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMjMyNTIsImV4cCI6MjA1OTc5OTI1Mn0.qu5hlDZCpmpdTxqLD4ualvdFrUir4UgFjiYe9_MLMLU";

export const supabase = createClient(supabaseUrl, supabaseKey);