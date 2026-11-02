// ASC 売上記録アプリ：ホーム画面アプリ用
// 毎回まず最新の版を取りに行き（GitHubに上げた更新がすぐ反映される）、電波がないときだけ保存済みの版を使う。
// 売上データ（Firebase）はこのファイルでは扱わない（常にFirebaseへ直接つなぐ）。
const PREFIX = "asc-sales-";
const CACHE = PREFIX + "v1";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  // 同じGitHubアカウントの他アプリ（到着日チェックなど）の保存分は消さない
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match("./index.html")))
  );
});
