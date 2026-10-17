import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://pxwpdtnqkucgkrpumctg.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4d3BkdG5xa3VjZ2tycHVtY3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxNTg2NjYsImV4cCI6MjEwNzczNDY2Nn0.XN6-y1ZFlaoQaUHkVjaz4IKT5XuvlP8jRBIU8sDCX-Q';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
