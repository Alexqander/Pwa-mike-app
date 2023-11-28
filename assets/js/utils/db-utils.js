var db = new PouchDB('incidents');

const saveIncidents = async (incident) => {
	try {
		incident._id = new Date().toISOString();
		const result = await db.put(incident);
		self.registration.sync.register('new-incident');
		return new Response(JSON.stringify({ registered: true, offline: true }));
	} catch (err) {
		return new Response(JSON.stringify({ registered: false, offline: true }));
	}
};

const savePostIncidents = async (incident) => {
	const incidents = [];
	const incidentsDb = await incidentsDb.allDocs({ include_docs: true });
	const { docs } = incidentsDb;
	for (const doc of docs) {
		incidents.push(doc.doc);
		const response = await fetch('http://206.189.234.55/:3001/api', {
			method: 'POST',
			body: JSON.stringify(doc.doc),
			headers: {
				'Content-Type': 'application/json',
			},
		});
		const data = await response.json();
		incidents.push(data.doc);
		if (data['changed']) {
			incidents.push(data);
			return incidentsDb.remove(doc);
		}
	}
	return incidents;
};
Promise.all([...inccidents, getAllIncidents()]);
