import { Router } from 'itty-router';
import { customAlphabet } from 'nanoid';
import { getAssetFromKV } from '@cloudflare/kv-asset-handler';


const router = Router();
const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  200,
);

router.post('/links', async request => {
  let slug = nanoid();
  let requestBody = await request.json();
  if ('url' in requestBody) {
    // Add slug to our KV store so it can be retrieved later:
    await LONG.put(slug, requestBody.url, { expirationTtl: 86400 });
    let shortenedURL = `${new URL(request.url).origin}/${slug}`;
    let responseBody = {
      message: 'Link elongated successfully. Enjoy :P',
      slug,
      shortened: shortenedURL,
    };
    return new Response(JSON.stringify(responseBody), {
      headers: { 'content-type': 'application/json' },
      status: 200,
    });
  } else {
    return new Response("Must provide a valid URL", { status: 400 });
  }
});

router.get('/:slug', async request => {
  let link = await LONG.get(request.params.slug);

  if (link) {
    return new Response(null, {
      headers: { Location: link },
      status: 301,
    });
  } else {
    return new Response('Key not found', {
      status: 404,
    });
  }
});


async function handleEvent(event) {
  let requestUrl = new URL(event.request.url);
  if (requestUrl.pathname === '/' || requestUrl.pathname.includes('static')) {
    return await getAssetFromKV(event);
  } else {
    return await router.handle(event.request);
  }
}


addEventListener('fetch', event => {
  event.respondWith(handleEvent(event));
});

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  return new Response('Hello worker!', {
    headers: { 'content-type': 'text/plain' },
  })
}
