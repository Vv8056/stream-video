// export const config = {
//   runtime: 'edge'
// };

// export default async function handler(req) {
//   try {
//     const url = new URL(req.url);
//     const src = url.searchParams.get('src');
//     if (!src) return new Response('Missing src parameter', { status: 400 });

//     const allowed = ['wayne11.savenow.to'];
//     const p = new URL(src);
//     if (!allowed.includes(p.hostname)) return new Response('Forbidden', { status: 403 });

//     // Forward relevant headers
//     const headers = {};
//     const range = req.headers.get('range');
//     const ua = req.headers.get('user-agent');
//     if (range) headers['range'] = range;
//     if (ua) headers['user-agent'] = ua;
//     headers['referer'] = 'https://wayne11.savenow.to/'; // Helps bypass referer restrictions

//     const upstream = await fetch(src, { headers, redirect: 'follow' });

//     if (!upstream.ok && upstream.status !== 206) {
//       const body = await upstream.text().catch(() => '');
//       return new Response(body || `Upstream error ${upstream.status}`, { status: upstream.status });
//     }

//     // Copy key headers
//     const responseHeaders = new Headers();
//     for (const [k, v] of upstream.headers) {
//       if (['content-type', 'content-length', 'content-range', 'accept-ranges', 'etag', 'cache-control'].includes(k)) {
//         responseHeaders.set(k, v);
//       }
//     }

//     responseHeaders.set('Content-Disposition', 'inline');
//     responseHeaders.set('Access-Control-Allow-Origin', '*');
//     responseHeaders.set('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length');

//     return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
//   } catch (err) {
//     console.error('edge-stream error', err);
//     return new Response('Proxy error', { status: 500 });
//   }
// }



export const config = {
  runtime: 'edge'
};

export default async function handler(req) {
  try {
    const url = new URL(req.url);
    const src = url.searchParams.get('src');
    if (!src) return new Response('Missing src parameter', { status: 400 });

    // ✅ Allow any .savenow.to domain that contains "/pacific/" in the path
    let allowed = false;
    try {
      const p = new URL(src);
      if (
        p.hostname.endsWith('.savenow.to') && 
        p.pathname.includes('/pacific/')
      ) {
        allowed = true;
      }
    } catch {
      return new Response('Invalid src URL', { status: 400 });
    }

    if (!allowed) {
      return new Response('Forbidden: not an allowed source', { status: 403 });
    }

    // Forward relevant headers
    const headers = {};
    const range = req.headers.get('range');
    const ua = req.headers.get('user-agent');
    if (range) headers['range'] = range;
    if (ua) headers['user-agent'] = ua;
    headers['referer'] = 'https://savenow.to/'; // Generic referer

    // Add browser-like headers for compatibility
    headers['accept'] =
      'video/webm,video/ogg,video/*;q=0.9,application/octet-stream;q=0.8,*/*;q=0.5';
    headers['accept-language'] = 'en-US,en;q=0.9';
    headers['sec-fetch-mode'] = 'no-cors';

    const upstream = await fetch(src, { headers, redirect: 'follow' });

    if (!upstream.ok && upstream.status !== 206) {
      const body = await upstream.text().catch(() => '');
      return new Response(body || `Upstream error ${upstream.status}`, { status: upstream.status });
    }

    // Copy important headers
    const responseHeaders = new Headers();
    for (const [k, v] of upstream.headers) {
      if (['content-type', 'content-length', 'content-range', 'accept-ranges', 'etag', 'cache-control'].includes(k)) {
        responseHeaders.set(k, v);
      }
    }

    responseHeaders.set('Content-Disposition', 'inline');
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length');

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders
    });
  } catch (err) {
    console.error('edge-stream error', err);
    return new Response('Proxy error', { status: 500 });
  }
}
