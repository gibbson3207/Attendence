let courseNames = {};
let courseStudents = {};
let attendanceData = {};
let lastSubmitted = {};
let currentCourse = "";

function setupStudentNames() {
    const courseName = document.getElementById("courseName").value.trim();
    const courseCode = document.getElementById("courseCode").value.trim();
    const num = parseInt(document.getElementById("numStudents").value);

    if (!courseName || !courseCode || num <= 0) {
        alert("Fill all fields correctly.");
        return;
    }

    currentCourse = courseCode;
    courseNames[courseCode] = courseName;

    if (courseStudents[courseCode]) {
        students = JSON.parse(JSON.stringify(courseStudents[courseCode]));
        renderForm(courseCode);
        return;
    }

    students = [];
    for (let i = 1; i <= num; i++) {
        let name = prompt(`Enter name for Student ${i}`);
        let reg = prompt(`Enter register no for ${name}`);
        if (!name) name = `Student ${i}`;
        if (!reg) reg = `REG${i}`;
        students.push({ id: i, regNo: reg, name: name, status: "Absent" });
    }

    courseStudents[courseCode] = JSON.parse(JSON.stringify(students));
    renderForm(courseCode);
}

function renderForm(code) {
    const container = document.getElementById("attendanceForm");
    container.innerHTML = `<h3>Mark Attendance for ${code}</h3>`;
    students.forEach((s, i) => {
        container.innerHTML += `
      <div class="student-row">
        <span>${s.regNo} - ${s.name}</span>
        <label><input type="radio" name="status${i}" value="Present" onclick="setStatus(${i}, 'Present')"> Present</label>
        <label><input type="radio" name="status${i}" value="Absent" onclick="setStatus(${i}, 'Absent')" checked> Absent</label>
      </div>`;
    });
    document.getElementById("submitBtn").style.display = "inline-block";
}

function setStatus(index, status) {
    students[index].status = status;
}

function submitAttendance() {
    const now = Date.now();
    const code = currentCourse;

    if (lastSubmitted[code] && now - lastSubmitted[code] < 5 * 60 * 1000) {
        alert("Attendance already submitted within last 5 minutes!");
        return;
    }

    if (!attendanceData[code]) attendanceData[code] = [];

    const timestamp = new Date().toLocaleString();
    const report = students.map(s => ({
        ...s,
        time: timestamp
    }));

    attendanceData[code].push({ timestamp, students: report });
    lastSubmitted[code] = now;

    updateRecordList();
    alert("Attendance Submitted!");

    document.getElementById("attendanceForm").innerHTML = '';
    document.getElementById("submitBtn").style.display = 'none';
}

function updateRecordList() {
    const recordsDiv = document.getElementById("records");
    recordsDiv.innerHTML = '';

    for (const code in attendanceData) {
        const lastTime = attendanceData[code].slice(-1)[0].timestamp;
        const btn = document.createElement("div");
        btn.className = "records-box";
        btn.innerHTML = `
      <strong>${code} - ${courseNames[code]}</strong> <br> 
      Last Attendance: ${lastTime} <br>
      <button onclick="showReport('${code}')">View Report</button>
      <button onclick="startNextAttendance('${code}')">Next Attendance</button>
      <button onclick="deleteCourse('${code}')">Close Attendance</button>`;
        recordsDiv.appendChild(btn);
    }
}

function startNextAttendance(code) {
    if (!courseStudents[code]) return alert("No student data available.");
    currentCourse = code;
    students = JSON.parse(JSON.stringify(courseStudents[code]));
    renderForm(code);
}

function showReport(code) {
    const logs = attendanceData[code];
    const allStudents = courseStudents[code].map(s => s.name);
    const studentStats = {};
    const regMap = {};

    courseStudents[code].forEach(s => {
        studentStats[s.name] = { present: 0, absentDates: [], regNo: s.regNo };
        regMap[s.name] = s.regNo;
    });

    logs.forEach(session => {
        session.students.forEach(s => {
            if (s.status === "Present") {
                studentStats[s.name].present++;
            } else {
                studentStats[s.name].absentDates.push(session.time);
            }
        });
    });

    let html = `<h3>Attendance Report for ${code}</h3>
  <table class="attendance-table">
    <tr><th>Reg No</th><th>Name</th><th>Present</th><th>Total</th><th>%</th><th>AR</th></tr>`;

    allStudents.forEach(name => {
        const stat = studentStats[name];
        const total = logs.length;
        const percent = ((stat.present / total) * 100).toFixed(2);
        const colorClass = percent < 80 ? 'red' : 'green';
        const absentBtn = stat.absentDates.length ?
            `<button onclick="showAbsents('${code}', '${name}')">View</button>` :
            "None";

        html += `<tr>
      <td>${stat.regNo}</td>
      <td>${name}</td>
      <td>${stat.present}</td>
      <td>${total}</td>
      <td class="${colorClass}">${percent}%</td>
      <td>${absentBtn}</td>
    </tr>`;
    });

    html += '</table>';
    document.getElementById("attendanceForm").innerHTML = html;
    document.getElementById("submitBtn").style.display = 'none';
}

function showAbsents(code, name) {
    const logs = attendanceData[code];
    const absents = [];

    logs.forEach(entry => {
        const s = entry.students.find(st => st.name === name);
        if (s && s.status === "Absent") {
            absents.push(entry.time);
        }
    });

    if (absents.length === 0) {
        alert(`${name} has no absents.`);
    } else {
        alert(`${name} was absent on:\n\n${absents.join('\n')}`);
    }
}

function deleteCourse(code) {
    if (confirm("Are you sure you want to delete this course and all records?")) {
        delete attendanceData[code];
        delete courseNames[code];
        delete courseStudents[code];
        updateRecordList();
    }
}
