import { supabase } from '../config/supabase.js';
import { getApiEnv } from '../config/env.js';

export async function getActiveBanner(today) {
  const env = getApiEnv();

  const { data: banners, error } = await supabase
    .from('sponsor_banners')
    .select('*')
    .eq('is_active', true)
    .or(`starts_on.is.null,starts_on.lte.${today}`)
    .or(`ends_on.is.null,ends_on.gte.${today}`)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !banners || banners.length === 0) {
    return null;
  }

  const banner = banners[0];
  const { data: pubData } = supabase.storage
    .from(env.BANNER_BUCKET)
    .getPublicUrl(banner.image_path);

  return {
    id: banner.id,
    title: banner.title,
    image_url: pubData?.publicUrl || null,
    link_url: banner.link_url,
  };
}
