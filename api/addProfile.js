const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { role } = req.body;

    const { data, error } = await supabase.from('profiles').insert([
      {
        id: uuidv4(),
        role,
        created_at: new Date().toISOString()
      }
    ]);

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json({ message: 'Profile added', data });
  } catch (err) {
    res.status(500).json({ error: 'Invalid request body' });
  }
};
