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

  const ensureMasterAccess = async (userId: string) => {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingProfile) {
      await supabase
        .from('profiles')
        .update({
          full_name: "Apoteker Penanggung Jawab",
          username: "apj_master",
          status: "approved",
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    } else {
      await supabase.from('profiles').insert({
        user_id: userId,
        full_name: "Apoteker Penanggung Jawab",
        username: "apj_master",
        phone: "",
        sipa: "",
        avatar_url: "",
        status: "approved",
      });
    }

    await supabase.from('user_roles').upsert(
      { user_id: userId, role: 'apj' },
      { onConflict: 'user_id,role' }
    );

    await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .neq('role', 'apj');
  };

  // Check if master already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const masterUser = existingUsers?.users?.find(u => u.email === MASTER_EMAIL);

  if (masterUser) {
    await ensureMasterAccess(masterUser.id);

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

  if (data.user?.id) {
    await ensureMasterAccess(data.user.id);
  }

  return new Response(JSON.stringify({ message: "Master APJ created", userId: data.user?.id ?? null }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
