/* ---------- api/edge-stream.js ---------- */
export const config = { runtime: 'edge' };


export default async function handler(req) {
try {
const url = new URL(req.url);
const src = url.searchParams.get('src');
if (!src) return new Response('Missing src parameter', { status: 400 });


const allowed = ['wayne11.savenow.to'];
const p = new URL(src);
if (!allowed.includes(p.hostname)) return new Response('Forbidden', { status: 403 });


const headers = {};
const range = req.headers.get('range');
if (range) headers['range'] = range;


const upstream = await fetch(src, { headers, redirect: 'follow' });


const responseHeaders = new Headers();
for (const [k, v] of upstream.headers) {
if (['content-type', 'content-length', 'content-range', 'accept-ranges', 'etag', 'cache-control'].includes(k)) {
responseHeaders.set(k, v);
}
}
responseHeaders.set('Content-Disposition', 'inline');
responseHeaders.set('Access-Control-Allow-Origin', '*');


return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
} catch (err) {
console.error('edge-stream error', err);
return new Response('Proxy error', { status: 500 });
}
}