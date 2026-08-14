// Courses Page Dynamic Script
let currentSubjectFilter = 'All Courses';

document.addEventListener('DOMContentLoaded', () => {
  loadCourses();
  setupFiltersAndSearch();
});

const loadCourses = async () => {
  const container = document.getElementById('coursesContainer');
  if (!container) return;

  const user = getCurrentUser();
  const userId = user ? user.id : '';

  try {
    let url = `/api/courses?subject=${encodeURIComponent(currentSubjectFilter)}`;
    if (userId) url += `&userId=${userId}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Failed to load courses');

    renderCourses(data.courses);
  } catch (err) {
    console.error('Error loading courses:', err);
    container.innerHTML = `<div class="col-12 text-center text-danger"><p>Failed to load courses. Please make sure database is running.</p></div>`;
  }
};

const renderCourses = (courses) => {
  const container = document.getElementById('coursesContainer');
  if (!container) return;

  if (courses.length === 0) {
    container.innerHTML = `<div class="col-12 text-center py-5"><h5 class="text-muted">No courses found in this subject.</h5></div>`;
    return;
  }

  const user = getCurrentUser();

  container.innerHTML = courses.map(c => `
    <div class="col-md-4 mb-4">
      <div class="card subject-card h-100 border-0 shadow-sm overflow-hidden">
        <div class="card-header ${c.header_bg || 'bg-primary'} text-white text-center py-4">
          <i class="fas ${c.icon_class || 'fa-book'} fa-3x mb-2"></i>
          <span class="badge ${c.badge_bg || 'bg-info'} position-absolute top-0 end-0 m-3">${c.subject}</span>
        </div>
        <div class="card-body d-flex flex-column p-4">
          <h5 class="fw-bold">${c.course_name}</h5>
          <p class="text-muted small flex-grow-1">${c.description || 'Master key concepts with structured video lessons and notes.'}</p>
          <div class="d-flex justify-content-between text-muted small mb-3">
            <span><i class="fas fa-video text-primary me-1"></i>${c.video_count || 12} Videos</span>
            <span><i class="fas fa-file-pdf text-danger me-1"></i>${c.pdf_count || 5} Notes</span>
            <span><i class="fas fa-clock text-warning me-1"></i>${c.duration || '6h'}</span>
          </div>
          ${
            c.isEnrolled
              ? `<button class="btn btn-secondary w-100 fw-bold" disabled><i class="fas fa-check-circle me-1"></i>Enrolled</button>`
              : `<button class="btn btn-primary w-100 fw-bold" onclick="handleEnroll(${c.course_id}, '${c.course_name.replace(/'/g, "\\'")}')"><i class="fas fa-plus-circle me-1"></i>Enroll Now</button>`
          }
        </div>
      </div>
    </div>
  `).join('');
};

const handleEnroll = async (courseId, courseName) => {
  const user = getCurrentUser();

  if (!user) {
    alert('Please log in first to enroll in courses!');
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

    if (res.ok) {
      alert(`🎉 ${data.message}`);
      loadCourses(); // Refresh buttons
    } else {
      alert(data.message || 'Enrollment failed!');
    }
  } catch (err) {
    console.error('Enroll error:', err);
    alert('Error connecting to server.');
  }
};

const setupFiltersAndSearch = () => {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active', 'btn-primary'));
      filterBtns.forEach(b => b.classList.add('btn-outline-primary'));
      btn.classList.remove('btn-outline-primary');
      btn.classList.add('btn-primary', 'active');

      currentSubjectFilter = btn.textContent.trim();
      loadCourses();
    });
  });

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const cards = document.querySelectorAll('#coursesContainer .col-md-4');
      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(term) ? 'block' : 'none';
      });
    });
  }
};
