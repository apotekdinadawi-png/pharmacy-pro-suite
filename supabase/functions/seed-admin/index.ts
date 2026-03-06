import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const MASTER_EMAIL = "apotekdinadawi@gmail.com";
  const MASTER_PASSWORD = "dinaiwongbersama";

  // Check if master already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const masterUser = existingUsers?.users?.find(u => u.email === MASTER_EMAIL);

  if (masterUser) {
    // Ensure role is 'apj' and status is 'approved'
    await supabase.from('user_roles').upsert(
      { user_id: masterUser.id, role: 'apj' },
      { onConflict: 'user_id,role' }
    );
    // Delete any non-apj roles for master
    await supabase.from('user_roles').delete()
      .eq('user_id', masterUser.id)
      .neq('role', 'apj');
    await supabase.from('profiles').update({ status: 'approved' })
      .eq('user_id', masterUser.id);

    return new Response(JSON.stringify({ message: "Master APJ account verified", userId: masterUser.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Create master user
  const { data, error } = await supabase.auth.admin.createUser({
    email: MASTER_EMAIL,
    password: MASTER_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "Apoteker Penanggung Jawab", username: "apj_master" },
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ message: "Master APJ created", userId: data.user.id }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
