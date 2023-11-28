const updateDynamicCache = (dynamicCache, req, res) => {
	if (res.ok) {
		return caches.open(dynamicCache).then((cache) => {
			cache.put(req, res.clone());
			return res.clone();
		});
	} else {
		return res;
	}
};
const updateStaticCache = (staticCache, req, APP_SHELL_INMUTABLE) => {
	if (APP_SHELL_INMUTABLE.includes(req.url)) {
		return;
	}
	return fetch(req).then((res) => {
		return updateDynamicCache(staticCache, req, res);
	});
};

const apiInidenceMananger = (cacheName, req) => {
	// only network
	if (
		req.url.indexOf('/api/notification' || req.url.indexOf('/api/auth')) >= 0
	) {
		return fetch(req);
	}
	// network with cache fallback
	if (req.clone().method === 'POST') {
		if (self.registration.sync && !navigator.onLine) {
			return req
				.clone()
				.text()
				.then((body) => {
					const bodyObj = JSON.parse(body);
					return saveIncidents(bodyObj);
				});
		} else {
			return fetch(req);
		}
	} else {
		return fetch(req)
			.then((res) => {
				updateDynamicCache(cacheName, req, res.clone());
				return res.clone();
			})
			.catch((err) => caches.match(req));
	}
};
