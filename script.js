const form = document.getElementById('attendanceForm');
const tableBody = document.querySelector('#attendanceTable tbody');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const studentId = document.getElementById('studentId').value;
  const studentName = document.getElementById('studentName').value;
  const status = document.getElementById('status').value;

  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${studentId}</td>
    <td>${studentName}</td>
    <td>${status}</td>
  `;

  tableBody.appendChild(row);

  form.reset();
});
