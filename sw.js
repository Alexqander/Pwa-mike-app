import('https://cdn.jsdelivr.net/npm/pouchdb@8.0.1/dist/pouchdb.min.js');
import('/assets/js/utils/db-utils.js');
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const INMUTABLE_CACHE = 'inmutable-v1';

const APP_SHELL = [
	'/',
	'/index.html',
	'/assets/css/style.css',
	'/assets/img/img-404.png',
	'/assets/img/report.ico',
	'/assets/img/reports.png',
	'/assets/js/main.js',
	'assets/js/**.js',
	'/pages/',
];

const APP_SHELL_INMUTABLE = [
	'/ assets / js / jquery - 3.7.1.min.js',
	'/assets/vendor/**',
];

const clear = (cacheName, sizeItems = 50) => {
	caches.open(cacheName).then((cache) => {
		cache.keys().then((keys) => {
			if (keys.length >= sizeItems) {
				cache.delete(keys[0]).then(clear(cacheName, sizeItems));
			}
		});
	});
};

self.addEventListener('install', (e) => {
	const cacheStatic = caches
		.open(STATIC_CACHE)
		.then((cache) => cache.addAll(APP_SHELL));
	const cacheInmutable = caches
		.open(INMUTABLE_CACHE)
		.then((cache) => cache.addAll(APP_SHELL_INMUTABLE));
	e.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
});

self.addEventListener('activate', (e) => {
	const respuesta = caches.keys().then((keys) => {
		keys.forEach((key) => {
			if (key !== STATIC_CACHE && key.includes('static')) {
				return caches.delete(key);
			}
			if (key !== DYNAMIC_CACHE && key.includes('dynamic')) {
				return caches.delete(key);
			}
		});
	});
	e.waitUntil(respuesta);
});

self.addEventListener('fetch', (e) => {
	let response;
	if (e.request.url.includes('api')) {
		//
		response = apiInidenceMananger(DYNAMIC_CACHE, e.request);
	} else {
		response = caches.match(e.request).then((res) => {
			if (res) {
				updateStaticCache(STATIC_CACHE, e.request, APP_SHELL_INMUTABLE);
				return res;
			} else {
				return fetch(e.request).then((res) => {
					return updateDynamicCache(DYNAMIC_CACHE, e.request, res);
				});
			}
		});
	}
	e.respondWith(response);
});

self.addEventListener('sync', (e) => {
	if (e.tag === 'incidence-post') {
		const respuesta = savePostIncidents();
		e.waitUntil(respuesta);
	}
});
