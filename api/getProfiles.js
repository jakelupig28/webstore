const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

module.exports = async (req, res) => {
  // 1. Get JWT from Authorization header
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  // 2. Validate JWT with Supabase
  const userRes = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!userRes.ok) {
    return res.status(401).json({ error: 'Invalid or missing JWT' });
  }
  const user = await userRes.json();

  // 3. Check user role in profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profileError || !profile || profile.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admins only' });
  }

  // 4. Continue with your logic
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, created_at');

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
};
