/* ---------- api/stream.js ---------- */
// const fetch = require('node-fetch');
// const { pipeline } = require('stream');
// const { promisify } = require('util');
// const pipe = promisify(pipeline);


// module.exports = async (req, res) => {
// try {
// const src = (req.query && req.query.src) || new URL(req.url, `http://${req.headers.host}`).searchParams.get('src');
// if (!src) return res.status(400).send('Missing src parameter');


// const ALLOWLIST = ['wayne11.savenow.to'];
// const parsed = new URL(src);
// if (!ALLOWLIST.includes(parsed.hostname)) return res.status(403).send('Source not allowed');


// const range = req.headers['range'];
// const headers = {};
// if (range) headers['range'] = range;


// const upstream = await fetch(src, { headers, redirect: 'follow' });
// if (!upstream.ok && upstream.status !== 206) {
// const body = await upstream.text().catch(() => '');
// return res.status(upstream.status).send(body || `Upstream returned ${upstream.status}`);
// }


// ['content-type', 'content-length', 'content-range', 'accept-ranges', 'etag', 'cache-control'].forEach((h) => {
// const val = upstream.headers.get(h);
// if (val) res.setHeader(h, val);
// });


// res.setHeader('Content-Disposition', 'inline');
// res.setHeader('Access-Control-Allow-Origin', '*');


// await pipe(upstream.body, res);
// } catch (err) {
// console.error(err);
// if (!res.headersSent) res.status(500).send('Proxy error');
// }

// };


const fetch = require('node-fetch');
const { pipeline } = require('stream');
const { promisify } = require('util');
const pipe = promisify(pipeline);

module.exports = async (req, res) => {
  try {
    const src = (req.query && req.query.src) || new URL(req.url, `http://${req.headers.host}`).searchParams.get('src');
    if (!src) return res.status(400).send('Missing src parameter');

    const ALLOWLIST = ['wayne11.savenow.to'];
    const parsed = new URL(src);
    if (!ALLOWLIST.includes(parsed.hostname)) return res.status(403).send('Source not allowed');

    const range = req.headers['range'];
    const headers = {};
    if (range) headers['range'] = range;

    const upstream = await fetch(src, { headers, redirect: 'follow' });
    if (!upstream.ok && upstream.status !== 206) {
      const body = await upstream.text().catch(() => '');
      return res.status(upstream.status).send(body || `Upstream returned ${upstream.status}`);
    }

    ['content-type', 'content-length', 'content-range', 'accept-ranges', 'etag', 'cache-control'].forEach((h) => {
      const val = upstream.headers.get(h);
      if (val) res.setHeader(h, val);
    });

    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Access-Control-Allow-Origin', '*');

    await pipe(upstream.body, res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).send('Proxy error');
  }
};
