// service-worker.js

const CACHE_NAME = 'health-video-cache-v1';
// 캐싱할 기본 파일 목록
const FILES_TO_CACHE = [
  '/',
  'index.html',
  'style.css',
  'script.js',
  'images/icon-192.png',
  'images/icon-512.png'
];

// 서비스 워커 설치 이벤트
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('캐시가 열렸습니다. 기본 파일들을 저장합니다.');
        return cache.addAll(FILES_TO_CACHE);
      })
  );
});

// 네트워크 요청 발생 시 이벤트 (캐시 전략)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    // 먼저 캐시에서 찾아보고, 없으면 네트워크로 요청
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});