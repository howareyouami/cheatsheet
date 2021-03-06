/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts('workbox-v3.6.3/workbox-sw.js');
workbox.setConfig({ modulePathPrefix: 'workbox-v3.6.3' });

workbox.core.setCacheNameDetails({ prefix: 'gatsby-plugin-offline' });

workbox.skipWaiting();
workbox.clientsClaim();

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    url: 'webpack-runtime-2349ec81e933feb137dd.js',
  },
  {
    url: 'commons-06b495302919c2c9a535.js',
  },
  {
    url: 'styles.7c8746e6e6f8f0b3004d.css',
  },
  {
    url: 'styles-d7434838b11f989fa1d4.js',
  },
  {
    url: 'app-299d5f00a88a8aea82af.js',
  },
  {
    url:
      'component---node-modules-gatsby-plugin-offline-app-shell-js-780a51c42fd821cc74a0.js',
  },
  {
    url: 'offline-plugin-app-shell-fallback/index.html',
    revision: 'ee4675e9687b7c68c6f3ad282611e3b5',
  },
  {
    url: 'component---src-pages-404-js-96c846e36ed45c31f152.js',
  },
  {
    url: 'page-data/404.html/page-data.json',
    revision: '83722c6e39a5b04ad40efbcf0cd66d90',
  },
  {
    url: 'page-data/offline-plugin-app-shell-fallback/page-data.json',
    revision: 'cc4bf0bdfc7ceff043091f2fb211d05a',
  },
  {
    url: 'manifest.webmanifest',
    revision: '03b49fbfa9c6f6b928a98169509c89b6',
  },
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.registerRoute(
  /(\.js$|\.css$|static\/)/,
  workbox.strategies.cacheFirst(),
  'GET'
);
workbox.routing.registerRoute(
  /^https?:.*\.(png|jpg|jpeg|webp|svg|gif|tiff|js|woff|woff2|json|css)$/,
  workbox.strategies.staleWhileRevalidate(),
  'GET'
);
workbox.routing.registerRoute(
  /^https?:\/\/fonts\.googleapis\.com\/css/,
  workbox.strategies.staleWhileRevalidate(),
  'GET'
);

/* global importScripts, workbox, idbKeyval */

importScripts(`idb-keyval-iife.min.js`);
const WHITELIST_KEY = `custom-navigation-whitelist`;

const navigationRoute = new workbox.routing.NavigationRoute(({ event }) => {
  const { pathname } = new URL(event.request.url);

  return idbKeyval.get(WHITELIST_KEY).then((customWhitelist = []) => {
    // Respond with the offline shell if we match the custom whitelist
    if (customWhitelist.includes(pathname)) {
      const offlineShell = `/offline-plugin-app-shell-fallback/index.html`;
      const cacheName = workbox.core.cacheNames.precache;

      return caches.match(offlineShell, { cacheName }).then(cachedResponse => {
        if (!cachedResponse) {
          return fetch(offlineShell).then(response => {
            if (response.ok) {
              return caches.open(cacheName).then(cache =>
                // Clone is needed because put() consumes the response body.
                cache.put(offlineShell, response.clone()).then(() => response)
              );
            } else {
              return fetch(event.request);
            }
          });
        }

        return cachedResponse;
      });
    }

    return fetch(event.request);
  });
});

workbox.routing.registerRoute(navigationRoute);

let updatingWhitelist = null;

function rawWhitelistPathnames(pathnames) {
  if (updatingWhitelist !== null) {
    // Prevent the whitelist from being updated twice at the same time
    return updatingWhitelist.then(() => rawWhitelistPathnames(pathnames));
  }

  updatingWhitelist = idbKeyval
    .get(WHITELIST_KEY)
    .then((customWhitelist = []) => {
      pathnames.forEach(pathname => {
        if (!customWhitelist.includes(pathname)) customWhitelist.push(pathname);
      });

      return idbKeyval.set(WHITELIST_KEY, customWhitelist);
    })
    .then(() => {
      updatingWhitelist = null;
    });

  return updatingWhitelist;
}

function rawResetWhitelist() {
  if (updatingWhitelist !== null) {
    return updatingWhitelist.then(() => rawResetWhitelist());
  }

  updatingWhitelist = idbKeyval.set(WHITELIST_KEY, []).then(() => {
    updatingWhitelist = null;
  });

  return updatingWhitelist;
}

const messageApi = {
  whitelistPathnames(event) {
    let { pathnames } = event.data;

    pathnames = pathnames.map(({ pathname, includesPrefix }) => {
      if (!includesPrefix) {
        return `${pathname}`;
      } else {
        return pathname;
      }
    });

    event.waitUntil(rawWhitelistPathnames(pathnames));
  },

  resetWhitelist(event) {
    event.waitUntil(rawResetWhitelist());
  },
};

self.addEventListener(`message`, event => {
  const { gatsbyApi } = event.data;
  if (gatsbyApi) messageApi[gatsbyApi](event);
});
