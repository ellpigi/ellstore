// Remi Relay Worker v71
// Deploy ke Cloudflare Worker. Ganti BOTCAHX_KEY kalau Videy dipakai.

const BOTCAHX_KEY = 'ISI_APIKEY_BOTCAHX_LU';
const CUKI_KEY = 'cuki-x';

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const url = new URL(request.url);
    const type = (url.searchParams.get('type') || '').toLowerCase().trim();
    const target = url.searchParams.get('url') || '';
    const q = url.searchParams.get('q') || '';

    if (!type) return json({ status: false, message: 'Parameter type kosong' }, 400);

    let api = '';

    if (type === 'tiktok') {
      if (!target) return json({ status: false, message: 'URL TikTok kosong' }, 400);
      api = `https://api.cuki.biz.id/api/downloader/tiktok?apikey=${encodeURIComponent(CUKI_KEY)}&url=${encodeURIComponent(target)}`;
    }
    else if (type === 'capcut') {
      if (!target) return json({ status: false, message: 'URL CapCut kosong' }, 400);
      api = `https://api.cuki.biz.id/api/downloader/capcut?apikey=${encodeURIComponent(CUKI_KEY)}&url=${encodeURIComponent(target)}`;
    }
    else if (type === 'mediafire') {
      if (!target) return json({ status: false, message: 'URL MediaFire kosong' }, 400);
      api = `https://api.cuki.biz.id/api/downloader/mediafire?apikey=${encodeURIComponent(CUKI_KEY)}&url=${encodeURIComponent(target)}`;
    }
    else if (type === 'facebook') {
      if (!target) return json({ status: false, message: 'URL Facebook kosong' }, 400);
      api = `https://api.nexray.eu.cc/downloader/facebook?url=${encodeURIComponent(target)}`;
    }
    else if (type === 'instagram') {
      if (!target) return json({ status: false, message: 'URL Instagram kosong' }, 400);
      api = `https://api.nexray.eu.cc/downloader/instagram?url=${encodeURIComponent(target)}`;
    }
    else if (type === 'spotify') {
      if (!target) return json({ status: false, message: 'URL Spotify kosong' }, 400);
      api = `https://api.nexray.eu.cc/downloader/spotify?url=${encodeURIComponent(target)}`;
    }
    else if (type === 'spotifyplay') {
      if (!q) return json({ status: false, message: 'Query Spotify kosong' }, 400);
      api = `https://api.nexray.eu.cc/downloader/spotifyplay?q=${encodeURIComponent(q)}`;
    }
    else if (type === 'ytplay') {
      if (!q) return json({ status: false, message: 'Query YouTube kosong' }, 400);
      api = `https://api.nexray.eu.cc/downloader/ytplay?q=${encodeURIComponent(q)}`;
    }
    else if (type === 'ytplayvid') {
      if (!q) return json({ status: false, message: 'Query YouTube kosong' }, 400);
      api = `https://api.nexray.eu.cc/downloader/ytplayvid?q=${encodeURIComponent(q)}`;
    }
    else if (type === 'videy') {
      if (!target) return json({ status: false, message: 'URL Videy kosong' }, 400);
      api = `https://api.botcahx.eu.org/api/download/videy?apikey=${encodeURIComponent(BOTCAHX_KEY)}&url=${encodeURIComponent(target)}`;
    }
    else {
      return json({ status: false, message: 'Type tidak dikenal', type }, 400);
    }

    try {
      const res = await fetch(api, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json,text/plain,*/*'
        }
      });

      const text = await res.text();
      return new Response(text, {
        status: 200,
        headers: corsHeaders('application/json')
      });
    } catch (e) {
      return json({
        status: false,
        message: e.message || 'Relay gagal request API',
        api
      }, 500);
    }
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: corsHeaders('application/json')
  });
}

function corsHeaders(type = 'application/json') {
  return {
    'Content-Type': type,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': '*'
  };
}
