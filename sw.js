/* Service worker: все пути относительные, сайт живёт в подпапке GitHub Pages. */
var CACHE = "raspisanie-v2";
/* Стили и скрипты сайта встроены в index.html, отдельные файлы не требуются. */
var CORE = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(CORE) })
      .then(function () { return self.skipWaiting() })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== CACHE }).map(function (k) { return caches.delete(k) }));
      })
      .then(function () { return self.clients.claim() })
  );
});

/* Сначала кэш, если его нет — сеть. Сторонние запросы (Supabase, шрифты) не трогаем. */
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;

  var url;
  try { url = new URL(req.url) } catch (err) { return }
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy) });
        }
        return res;
      });
    })
  );
});
