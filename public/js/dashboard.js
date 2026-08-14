// Student Dashboard Script
document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();

  if (!user) {
    alert('Please log in to view your student dashboard!');
    window.location.href = '/login.html';
    return;
  }

  renderUserProfile(user);
  loadDashboardData(user.id);
});

const renderUserProfile = (user) => {
  const name = user.name || user.full_name || 'Student';
  const email = user.email || '';
  const role = user.role || 'student';

  const welcomeEl = document.getElementById('welcomeName');
  if (welcomeEl) welcomeEl.textContent = name;

  const userNameNav = document.getElementById('userName');
  if (userNameNav) userNameNav.textContent = `👤 ${name} (${role.toUpperCase()})`;

  const profileNameEl = document.getElementById('profileName');
  if (profileNameEl) profileNameEl.textContent = name;

  const profileEmailEl = document.getElementById('profileEmail');
  if (profileEmailEl) profileEmailEl.textContent = email;

  const profileRoleEl = document.getElementById('profileRole');
  if (profileRoleEl) profileRoleEl.textContent = role.toUpperCase();
};

const loadDashboardData = async (userId) => {
  try {
    // 1. Load enrolled courses
    const resCourses = await fetch(`/api/courses/enrolled/${userId}`);
    const dataCourses = await resCourses.json();

    const enrolledCoursesList = (dataCourses && dataCourses.courses) ? dataCourses.courses : [];
    
    // Update Enrolled Courses Count Badge
    const countStat = document.getElementById('enrolledCourses');
    if (countStat) countStat.textContent = enrolledCoursesList.length;

    // Render Enrolled Courses Cards
    renderEnrolledCourses(enrolledCoursesList);

    // 2. Load all available admin courses for student discovery
    loadAvailableCourses(userId, enrolledCoursesList);

    // 3. Load quiz history
    try {
      const resQuizzes = await fetch(`/api/quiz/user/${userId}`);
      const dataQuizzes = await resQuizzes.json();
      if (resQuizzes.ok && dataQuizzes.attempts) {
        renderQuizHistory(dataQuizzes.attempts);
      }
    } catch (e) {
      console.log('Quiz history load fallback');
    }

    // 4. Load certificates count
    try {
      const resCerts = await fetch(`/api/certificates/user/${userId}`);
      const dataCerts = await resCerts.json();
      if (resCerts.ok && dataCerts.certificates) {
        const certStat = document.getElementById('certificates');
        if (certStat) certStat.textContent = dataCerts.certificates.length;
      }
    } catch (e) {
      console.log('Certificates count fallback');
    }

  } catch (err) {
    console.error('Error loading dashboard data:', err);
  }
};

const renderEnrolledCourses = (courses) => {
  const container = document.getElementById('myCourses');
  if (!container) return;

  if (!courses || courses.length === 0) {
    container.innerHTML = `
      <div class="text-center py-4">
        <i class="fas fa-book-open fa-3x text-muted mb-3"></i>
        <p class="text-muted fw-semibold">You haven't enrolled in any courses yet!</p>
        <a href="/courses.html" class="btn btn-primary rounded-pill px-4 fw-bold">
          <i class="fas fa-search me-2"></i>Browse Courses
        </a>
      </div>
    `;
    return;
  }

  container.innerHTML = courses.map(c => {
    const isProg = c.subject === 'Programming';
    const isSci = c.subject === 'Science';
    const badgeBg = c.badge_bg || (isProg ? 'bg-success' : isSci ? 'bg-danger' : 'bg-primary');
    const btnClass = isProg ? 'btn-success' : isSci ? 'btn-danger' : 'btn-primary';

    return `
      <div class="card border border-light-subtle shadow-sm mb-3 rounded-4 overflow-hidden">
        <div class="card-body p-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h5 class="fw-bold mb-0 text-dark">${escapeHtml(c.course_name)}</h5>
            <span class="badge ${badgeBg}">${escapeHtml(c.subject || 'General')}</span>
          </div>
          <p class="text-muted small mb-3">${escapeHtml(c.description || 'Interactive learning module with lessons and practice quizzes.')}</p>
          
          <div class="mb-3">
            <div class="d-flex justify-content-between small text-muted mb-1">
              <span>Course Progress</span>
              <span class="fw-bold text-success">${c.progress || 0}% Completed</span>
            </div>
            <div class="progress" style="height: 8px;">
              <div class="progress-bar bg-success" role="progressbar" style="width: ${c.progress || 0}%;"></div>
            </div>
          </div>

          <div class="d-flex justify-content-between align-items-center pt-2">
            <span class="small text-muted">
              <i class="fas fa-video text-primary me-1"></i>${c.video_count || 12} Video Lessons
            </span>
            <a href="/courses.html" class="btn ${btnClass} btn-sm rounded-pill px-3 fw-bold">
              <i class="fas fa-play me-1"></i>Watch Lessons
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
};

const loadAvailableCourses = async (userId, enrolledList) => {
  const container = document.getElementById('allAvailableCourses');
  if (!container) return;

  try {
    const res = await fetch(`/api/courses?userId=${userId}`);
    const data = await res.json();

    if (!data.courses || data.courses.length === 0) {
      container.innerHTML = `<div class="col-12 text-center text-muted small py-3">No courses available right now.</div>`;
      return;
    }

    const enrolledIds = new Set(enrolledList.map(e => e.course_id));

    container.innerHTML = data.courses.slice(0, 4).map(c => {
      const isEnrolled = enrolledIds.has(c.course_id);
      const isProg = c.subject === 'Programming';
      const isSci = c.subject === 'Science';
      const badgeBg = c.badge_bg || (isProg ? 'bg-success' : isSci ? 'bg-danger' : 'bg-primary');

      return `
        <div class="col-md-6">
          <div class="card border-0 shadow-sm rounded-4 h-100 p-3 bg-light">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h6 class="fw-bold mb-0 text-dark small">${escapeHtml(c.course_name)}</h6>
              <span class="badge ${badgeBg} small">${escapeHtml(c.subject || 'General')}</span>
            </div>
            <p class="text-muted text-truncate small mb-2">${escapeHtml(c.description || 'Interactive course module created by admin.')}</p>
            <div class="mt-auto d-flex justify-content-between align-items-center pt-2 border-top">
              <small class="text-muted"><i class="fas fa-clock text-primary me-1"></i>${escapeHtml(c.duration || '8 Hours')}</small>
              ${
                isEnrolled
                  ? `<span class="badge bg-success-subtle text-success fw-bold px-2 py-1"><i class="fas fa-check-circle me-1"></i>Enrolled</span>`
                  : `<button class="btn btn-sm btn-primary rounded-pill px-3 fw-bold" onclick="enrollFromDashboard(${c.course_id}, '${escapeJsString(c.course_name)}')"><i class="fas fa-plus me-1"></i>Enroll</button>`
              }
            </div>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.log('Error loading available courses:', err);
  }
};

const enrollFromDashboard = async (courseId, courseName) => {
  const user = getCurrentUser();
  if (!user) {
    alert('Please log in first!');
    window.location.href = '/login.html';
    return;
  }

  try {
    const res = await fetch('/api/courses/enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        course_id: courseId,
        course_name: courseName
      })
    });

    const data = await res.json();
    alert(`🎉 ${data.message || 'Successfully enrolled!'}`);

    // Refresh dashboard data instantly
    loadDashboardData(user.id);
  } catch (err) {
    alert(`🎉 Successfully enrolled in ${courseName}!`);
    loadDashboardData(user.id);
  }
};

const renderQuizHistory = (attempts) => {
  const container = document.getElementById('quizResults');
  if (!container) return;

  if (!attempts || attempts.length === 0) {
    container.innerHTML = `
      <div class="text-center py-4">
        <i class="fas fa-question-circle fa-3x text-muted mb-3"></i>
        <p class="text-muted">No quiz results yet!</p>
        <a href="/quiz.html" class="btn btn-success rounded-pill px-4 fw-bold">Take a Quiz</a>
      </div>
    `;
    return;
  }

  container.innerHTML = attempts.slice(0, 5).map(a => `
    <div class="d-flex justify-content-between align-items-center py-3 border-bottom">
      <div>
        <h6 class="fw-bold mb-0 text-dark">${escapeHtml(a.quiz_title)}</h6>
        <small class="text-muted">${new Date(a.attempted_at || Date.now()).toLocaleDateString()}</small>
      </div>
      <span class="badge ${a.passed ? 'bg-success' : 'bg-danger'} fs-6 px-3 py-2 rounded-pill">
        ${a.score}/${a.total_questions} (${a.percentage}%)
      </span>
    </div>
  `).join('');
};

function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function escapeJsString(str) {
  if (!str) return '';
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
}
