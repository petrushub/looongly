import { Router } from 'itty-router';
import { customAlphabet } from 'nanoid';

const router = Router();
const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  50,
);

router.post('/links', async request => {
  let slug = nanoid();
  let requestBody = await request.json();
  if ('url' in requestBody) {
    // Add slug to our KV store so it can be retrieved later:
    await LONG_DEV.put(slug, requestBody.url, { expirationTtl: 86400 });
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
  let link = await LONG_DEV.get(request.params.slug);

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


addEventListener('fetch', event => {
  event.respondWith(router.handle(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  return new Response('Hello worker!', {
    headers: { 'content-type': 'text/plain' },
  })
}
