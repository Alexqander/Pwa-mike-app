(() => {
	'use strict';
	const token = localStorage.getItem('token');
	if (!token) {
		localStorage.clear();
		changeView('');
	}
})();

let payload = {
	title: '',
	type: '',
	description: '',
	incidenceDate: '',
	status: { id: 4 },
	annexes: [],
	location: {
		lat: '',
		lng: '',
	},
};

const camera = new Camera($('#player')[0]);
const incidencesDB = new PouchDB('docentIncidences');
const cancelIncidence = async (id) => {};
const editIncidence = async (id) => {};

const currenceLocation = async () => {
	try {
		if (navigator.geolocation) {
			toastMessage('cargando mapa..').showToast();
			navigator.geolocation.getCurrentPosition((position) => {
				const { latitude, longitude } = position.coords;
				const myLatlng = { lat: latitude, lng: longitude };
				const map = new google.maps.Map(document.getElementById('map'), {
					zoom: 18,
					center: myLatlng,
				});
				const marker = new google.maps.Marker({
					position: myLatlng,
					map,
					title: 'Hello World!',
				});
				$('#map').show();
				$('#map').css('height', '400px');
				$('#map').css('width', '100%');
				toastMessage('mapa cargado').showToast();
			});
		}
		const location = await getLocation();
		payload.location = location;
	} catch (error) {
		console.log(error);
	}
};

const getAllIncidencesByEmployee = async () => {
	try {
		const table = $('#incidencesTable').DataTable();
		table.destroy();
		const user = parseJwt();
		const response = await axiosClient.get(`/incidences/${user.id}`);
		const incidences = document.getElementById('ownIncidences');
		let content = ``;
		incidences.innerHTML = ``;
		const { rows } = await incidencesDB.allDocs({ include_docs: true });
		for (const [i, incidence] of response?.incidences.entries()) {
			const date = new Date(incidence.incidenceDate);
			const day = String(date.getDate()).padStart(2, '0'); // Ensure two-digit day
			const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure two-digit month (months are zero-based)
			const year = date.getFullYear();
			content += `
        <tr>
          <th scope="row">${i + 1}</th>
          <td>${
						incidence.person.name +
						' ' +
						incidence.person.surname +
						' ' +
						(incidence.person.lastname ?? '')
					}</td>
          <td>${incidence.user.area.name}</td>
          <td>${day}-${month}-${year}</td>
          <td><span class="badge bg-info">${
						incidence.status.description
					}</span></td>
          <td>
            <button onclick="editIncidence(${i})" class="btn btn-warning btn-sm">EDITAR</button>
            <button onclick="cancelIncidence(${i})" class="btn btn-danger btn-sm">CANCELAR</button>
          </td>
        </tr>
        `;
		}
		incidences.innerHTML = content;
		new DataTable($('#incidencesTable'), {
			columnDefs: [{ orderable: false, targets: 4 }],
			language: {
				url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json',
			},
		});
	} catch (error) {
		console.log(error);
	}
};

$(document).ready(function () {
	if (!fullname) fullname = localStorage.getItem('fullname');
	if (!role) role = localStorage.getItem('activeRole');
	$('#fullname').text(fullname);
	$('#fullname2').text(fullname);
	$('#role').text(role);
	getAllIncidencesByEmployee();
});
