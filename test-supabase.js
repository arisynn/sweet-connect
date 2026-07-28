import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);
async function test() {
  const { data, error } = await supabase.from('multiplayer_rooms').select('*').limit(1);
  console.log("multiplayer_rooms:", error ? error.message : "EXISTS");
  const { data: d2, error: e2 } = await supabase.from('rooms').select('*').limit(1);
  console.log("rooms:", e2 ? e2.message : "EXISTS");
}
test();
