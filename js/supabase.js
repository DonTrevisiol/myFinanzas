/* ./myFinanzas/js/supabase.js */
const supabaseUrl = "https://areeemctdmsbhzjrjcxm.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyZWVlbWN0ZG1zYmh6anJqY3htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0Mzk1MDQsImV4cCI6MjA4OTAxNTUwNH0.oU0ewW_8c6Aazj_C7cOYqBKZZ679vYGNciX_lTFNfK0"

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey)
