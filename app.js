// public/app.js

document.addEventListener('DOMContentLoaded', () => {
  const recordsTableBody = document.querySelector('#recordsTable tbody');
  const statsDiv = document.getElementById('stats');
  const refreshBtn = document.getElementById('refreshBtn');
  const addForm = document.getElementById('addForm');

  const fetchRecords = async () => {
    const res = await fetch('/api/records');
    const data = await res.json();
    recordsTableBody.innerHTML = '';
    data.forEach(rec => {
      const row = document.createElement('tr');
      row.innerHTML = `
  <td>${rec.id}</td>
  <td>${rec.date}</td>
  <td>${rec.location || ''}</td>
  <td>${rec.temperature ?? ''}</td>
  <td>${rec.co2 ?? ''}</td>
  <td>${rec.description || ''}</td>
  <td>
    <button onclick="deleteRecord(${rec.id})">
      Delete
    </button>
  </td>
`;   
      recordsTableBody.appendChild(row);
    });
  };

  const fetchStats = async () => {
    const res = await fetch('/api/stats');
    const { avgTemp, avgCo2 } = await res.json();
    statsDiv.innerHTML = `<p>Average Temperature: ${avgTemp?.toFixed(2) ?? 'N/A'} °C</p>` +
                         `<p>Average CO₂: ${avgCo2?.toFixed(2) ?? 'N/A'} ppm</p>`;
  };

  const refresh = () => {
    fetchRecords();
    fetchStats();
  };

  refreshBtn.addEventListener('click', refresh);

  addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(addForm);
    const payload = {};
    formData.forEach((value, key) => {
      if (value) payload[key] = value;
    });
    await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    addForm.reset();
    refresh();
  });

  // Initial load
 window.deleteRecord = async function(id) {

  if (!confirm('Delete this record?')) return;

  await fetch(`/api/records/${id}`, {
    method: 'DELETE'
  });

  refresh();
};
  refresh();
});
