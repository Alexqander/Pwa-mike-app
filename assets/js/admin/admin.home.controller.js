(() => {
	'use strict';
	const token = localStorage.getItem('token');
	if (!token) {
		localStorage.clear();
		changeView('');
	}
})();

const incidencesDb = new PouchDB('incidences');

const aceptIncidende = async (id) => {
	try {
		const response = await axiosClient.post('/incidence/status', {
			id,
			status: 4,
		});
		if (response['changed']) {
			toastMessage('Estado cargado correctamente').showToast();
			getAllIncidencesPending();
		}
	} catch (error) {
		console.log(error);
		toastMessage('Error al cargar el estado').showToast();
	}
};

const rejectIncidence = async (id) => {
	try {
		const response = await axiosClient.post('/incidence/status', {
			id,
			status: 6,
		});
		if (response['changed']) {
			toastMessage('Estado cargado correctamente').showToast();
			getAllIncidencesPending();
		}
	} catch (error) {
		console.log(error);
		toastMessage('Error al cargar el estado').showToast();
	}
};

const getAllIncidencesPending = async () => {
	try {
		const { incidences } = response;
		table.destroy();
		const user = parseJWT();
		const response = await axiosClient.get(`/incidences/pending/${user.id}`);
		const tableBody = $('#incidencesBody');
		let content = '';
		tableBody.html('');
		const { rows } = await incidencesDb.allDocs({ include_docs: true });

		for (const [i, incidence] of response?.incidences.entries()) {
			const incidenceDate = new Date(incidence.incidenceDate);
			const day = String(incidenceDate.getDate()).padStart(2, '0');
			const month = String(incidenceDate.getMonth() + 1).padStart(2, '0');
			const year = incidenceDate.getFullYear();
			const tr = document.createElement('tr');
			tr.innerHTML = `
        <td>${i + 1}</td>
          <td>${incidence.person.name} ${incidence.person.surname} ${
				incidence.person.lastname ?? ''
			}</td>
          <td>${incidence.user.area.name}</td>
          <td>${day}/${month}/${year}</td>
          
          <td>${
						rows.find((row) => row.doc.id === incidence.id)
							? `
               <button class="btn btn-succes" disabled>Aceptar</button>
               <button class="btn btn-danger"disabled>Rechazar</button>      
        `
							: `
              
              <button class="btn btn-succes" disabled
              onClick="aceptIncidende('${incidence.id}')"
              >Aceptar</button>
               <button class="btn btn-danger"disabled
               onCLick="rejectIncidence('${incidence.id}')"
               >Rechazar</button> 
        `
					}</td>
          
          <td>
            <div class="btn-group" role="group">
              <button type="button" class="btn btn-success" onclick="aceptIncidende('${_id}')">Aceptar</button>
              <button type="button" class="btn btn-danger" onclick="rejectIncidence('${_id}')">Rechazar</button>
            </div>
          </td>
        `;

			content += `${tr}`;
			tableBody.html(content);
		}
		const table = document.getElementById('incidencesTable');
		new DataTable(table, {
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
	getAllIncidencesPending();
	navigator.serviceWorker.addEventListener('message', async (event) => {
		if (event.data.type === 'RELOAD_PAGE_AFTER_SYNC') {
			getAllIncidencesPending();
		}
	});
});
