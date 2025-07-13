const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

module.exports = async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, created_at');

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json(data);
};
