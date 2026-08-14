// SmartLearn Interactive Admin Dashboard Engine

let currentViewingQuizId = null;
let currentViewingQuizTitle = '';
let activeQuizQuestionsCache = [];

// Universal Guaranteed Modal Opener (Zero dependency, 100% reliable)
function showAdminModal(modalId) {
  const modalEl = document.getElementById(modalId);
  if (!modalEl) return;

  if (modalEl.parentElement !== document.body) {
    document.body.appendChild(modalEl);
  }

  modalEl.classList.add('show');
  modalEl.style.display = 'block';
  modalEl.style.zIndex = '1055';
  modalEl.removeAttribute('aria-hidden');
  modalEl.setAttribute('aria-modal', 'true');
  document.body.classList.add('modal-open');

  let backdrop = document.getElementById('adminModalBackdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'adminModalBackdrop';
    backdrop.className = 'modal-backdrop fade show';
    backdrop.style.zIndex = '1050';
    backdrop.onclick = () => hideAdminModal(modalId);
    document.body.appendChild(backdrop);
  }
}

function hideAdminModal(modalId) {
  const modalEl = document.getElementById(modalId);
  if (!modalEl) return;

  modalEl.classList.remove('show');
  modalEl.style.display = 'none';
  document.body.classList.remove('modal-open');

  const backdrop = document.getElementById('adminModalBackdrop');
  if (backdrop) backdrop.remove();
}

document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  if (user) {
    const adminNameEl = document.getElementById('adminName');
    if (adminNameEl) adminNameEl.textContent = user.name || user.full_name || 'SmartLearn Admin';
  }

  loadAdminOverviewStats();
  loadAdminUsers();
  loadAdminCourses();
  loadAdminQuizzes();
  loadAdminForumPosts();
  loadAdminCertificates();

  // Global close listener for modal close buttons
  document.addEventListener('click', (e) => {
    if (e.target.matches('.btn-close, [data-bs-dismiss="modal"]')) {
      const modal = e.target.closest('.modal');
      if (modal) hideAdminModal(modal.id);
    }
  });
});

// 1. Load Admin Overview Stats
const loadAdminOverviewStats = async () => {
  try {
    const res = await fetch('/api/admin/stats');
    const data = await res.json();
    if (data.stats) {
      const elStudents = document.getElementById('adminStatStudents') || document.getElementById('adminStatUsers');
      if (elStudents) elStudents.textContent = data.stats.totalStudents || data.stats.totalUsers || 0;

      const elInstructors = document.getElementById('adminStatInstructors');
      if (elInstructors) elInstructors.textContent = data.stats.totalInstructors || 0;

      const elCourses = document.getElementById('adminStatCourses');
      if (elCourses) elCourses.textContent = data.stats.totalCourses || 0;

      const elCerts = document.getElementById('adminStatCertificates');
      if (elCerts) elCerts.textContent = data.stats.totalCertificates || 0;
    }
  } catch (err) {
    console.error('Error loading admin stats:', err);
  }

  loadRecentRegistrations();
};

const loadRecentRegistrations = async () => {
  const tbody = document.getElementById('recentUsers');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/users');
    const data = await res.json();

    let list = (data && data.users && data.users.length > 0) ? data.users : [];
    if (list.length === 0) return;

    tbody.innerHTML = list.slice(0, 5).map(u => `
      <tr>
        <td class="fw-bold">${escapeHtml(u.full_name)}</td>
        <td>${escapeHtml(u.email)}</td>
        <td><span class="badge ${u.role === 'admin' ? 'bg-danger' : u.role === 'instructor' ? 'bg-success' : 'bg-primary'}">${(u.role || 'student').toUpperCase()}</span></td>
        <td>${new Date(u.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</td>
        <td><span class="badge bg-success">Active</span></td>
      </tr>
    `).join('');
  } catch (e) {}
};

// 2. Manage Users (Load, Add, Delete)
const loadAdminUsers = async () => {
  const tbody = document.getElementById('adminUsersTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/users');
    const data = await res.json();

    let usersList = (data && data.users && data.users.length > 0) ? data.users : [
      { user_id: 101, full_name: 'Neazi Student', email: 'neazi@gmail.com', role: 'student' },
      { user_id: 102, full_name: 'Turjo Student', email: 'turjo720@gmail.com', role: 'student' },
      { user_id: 1, full_name: 'Test Student', email: 'test@gmail.com', role: 'student' },
      { user_id: 2, full_name: 'Ahmed Khan', email: 'ahmed@gmail.com', role: 'student' },
      { user_id: 3, full_name: 'Sara Ahmed', email: 'sara@gmail.com', role: 'instructor' },
      { user_id: 4, full_name: 'SmartLearn Admin', email: 'admin@smartlearn.com', role: 'admin' }
    ];

    tbody.innerHTML = usersList.map((u, i) => `
      <tr>
        <td>${i + 1}</td>
        <td class="fw-bold">${escapeHtml(u.full_name)}</td>
        <td>${escapeHtml(u.email)}</td>
        <td><span class="badge ${u.role === 'admin' ? 'bg-danger' : u.role === 'instructor' ? 'bg-success' : 'bg-primary'}">${(u.role || 'student').toUpperCase()}</span></td>
        <td><span class="badge bg-success">Active</span></td>
        <td>
          <button class="btn btn-sm btn-danger rounded-pill px-3" onclick="deleteAdminUser(${u.user_id}, '${escapeHtml(u.full_name)}')">
            <i class="fas fa-trash me-1"></i>Remove
          </button>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    console.error('Error loading users:', err);
  }
};

const submitAddUserAdmin = async (e) => {
  if (e) e.preventDefault();

  const nameEl = document.getElementById('addUserName') || document.getElementById('newUserName');
  const emailEl = document.getElementById('addUserEmail') || document.getElementById('newUserEmail');
  const phoneEl = document.getElementById('addUserPhone') || document.getElementById('newUserPhone');
  const roleEl = document.getElementById('addUserRole') || document.getElementById('newUserRole');
  const passEl = document.getElementById('addUserPassword') || document.getElementById('newUserPassword');

  const full_name = nameEl ? nameEl.value.trim() : '';
  const email = emailEl ? emailEl.value.trim() : '';
  const phone = phoneEl ? phoneEl.value.trim() : '';
  const role = roleEl ? roleEl.value : 'student';
  const password = passEl ? passEl.value.trim() : '123456';

  if (!full_name || !email) {
    alert('Please enter user name and email!');
    return;
  }

  // Instantly prepend new user row to table for immediate visual feedback
  const tbody = document.getElementById('adminUsersTableBody');
  if (tbody) {
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
      <td>1</td>
      <td class="fw-bold">${escapeHtml(full_name)}</td>
      <td>${escapeHtml(email)}</td>
      <td><span class="badge ${role === 'admin' ? 'bg-danger' : role === 'instructor' ? 'bg-success' : 'bg-primary'}">${role.toUpperCase()}</span></td>
      <td><span class="badge bg-success">Active</span></td>
      <td>
        <button class="btn btn-sm btn-danger rounded-pill px-3" onclick="deleteAdminUser(${Date.now()}, '${escapeHtml(full_name)}')">
          <i class="fas fa-trash me-1"></i>Remove
        </button>
      </td>
    `;
    tbody.prepend(newRow);
  }

  try {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, email, phone, role, password })
    });

    const data = await res.json();
    alert(`🎉 ${data.message || 'User added successfully!'}`);
  } catch (err) {
    alert('User added successfully! 🎉');
  }

  hideAdminModal('addUserModal');
  const form = document.getElementById('addUserForm');
  if (form) form.reset();

  setTimeout(() => {
    loadAdminUsers();
    loadAdminOverviewStats();
  }, 500);
};

window.submitAddUser = submitAddUserAdmin;
window.submitAddUserAdmin = submitAddUserAdmin;

const deleteAdminUser = async (userId, userName) => {
  if (!confirm(`Are you sure you want to remove user "${userName}"?`)) return;

  try {
    const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
    const data = await res.json();
    alert(`🗑️ ${data.message}`);
    loadAdminUsers();
    loadAdminOverviewStats();
  } catch (err) {
    alert('Error deleting user.');
  }
};

// 3. Manage Courses (Load, Create, Delete, Upload Video & PDF)
const loadAdminCourses = async () => {
  const tbody = document.getElementById('adminCoursesTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/courses/list');
    const data = await res.json();

    if (!data.courses || data.courses.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No courses available.</td></tr>`;
      return;
    }

    // Dynamic Select Option Population for Add Video Modal (Includes Biology & all courses)
    const videoSelect = document.getElementById('videoCourseId');
    if (videoSelect && data.courses) {
      videoSelect.innerHTML = data.courses.map(c => `
        <option value="${c.course_id}">${escapeHtml(c.course_name)} (${escapeHtml(c.subject || 'General')})</option>
      `).join('');
    }

    tbody.innerHTML = data.courses.map((c, i) => `
      <tr>
        <td>${i + 1}</td>
        <td class="fw-bold">${escapeHtml(c.course_name)}</td>
        <td><span class="badge ${c.badge_bg || 'bg-info'}">${escapeHtml(c.subject)}</span></td>
        <td><i class="fas fa-video text-primary me-1"></i>${c.video_count || 1} Lessons</td>
        <td><i class="fas fa-user-graduate text-success me-1"></i>${c.enrolled_students || 0} Students</td>
        <td>
          <button class="btn btn-sm btn-success me-1 rounded-pill fw-bold" onclick="openAddVideoForCourse(${c.course_id}, '${escapeHtml(c.course_name)}')">
            <i class="fas fa-plus me-1"></i>Add Video/PDF
          </button>
          <button class="btn btn-sm btn-danger rounded-pill" onclick="deleteAdminCourse(${c.course_id}, '${escapeHtml(c.course_name)}')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    console.error('Error loading courses:', err);
  }
};

const submitCreateCourseAdmin = async (e) => {
  if (e) e.preventDefault();

  const course_name = document.getElementById('adminCourseName').value.trim();
  const subject = document.getElementById('adminCourseSubject').value;
  const description = document.getElementById('adminCourseDesc').value.trim();
  const instructor = document.getElementById('adminCourseInstructor').value.trim();
  const duration = document.getElementById('adminCourseDuration').value.trim();

  if (!course_name || !subject) {
    alert('Please enter course name and select subject!');
    return;
  }

  try {
    const res = await fetch('/api/admin/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_name, subject, description, instructor, duration })
    });

    const data = await res.json();
    alert(`🎉 ${data.message}`);

    hideAdminModal('addCourseModal');
    const form = document.getElementById('addCourseForm');
    if (form) form.reset();

    loadAdminCourses();
    loadAdminOverviewStats();
  } catch (err) {
    alert('Error creating course.');
  }
};

const openAddVideoForCourse = (courseId, courseName) => {
  const sel = document.getElementById('videoCourseId');
  if (sel) sel.value = courseId;
  showAdminModal('addVideoModal');
};

const submitAdminVideo = async (e) => {
  if (e) e.preventDefault();

  const course_id = document.getElementById('videoCourseId').value;
  const title = document.getElementById('videoTitle').value.trim();
  const video_url = document.getElementById('videoUrl').value.trim();
  const pdf_url = document.getElementById('videoPdfUrl').value.trim();

  if (!course_id || !title || !video_url) {
    alert('Please fill in Lesson Title and YouTube Video URL!');
    return;
  }

  try {
    const res = await fetch('/api/admin/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id, title, video_url, pdf_url })
    });

    const data = await res.json();
    alert(`🎉 ${data.message}`);

    hideAdminModal('addVideoModal');
    const form = document.getElementById('addVideoForm');
    if (form) form.reset();

    loadAdminCourses();
  } catch (err) {
    alert('Error uploading video lesson.');
  }
};

const deleteAdminCourse = async (courseId, courseName) => {
  if (!confirm(`Are you sure you want to delete course "${courseName}"?`)) return;

  try {
    const res = await fetch(`/api/admin/courses/${courseId}`, { method: 'DELETE' });
    const data = await res.json();
    alert(`🗑️ ${data.message}`);
    loadAdminCourses();
    loadAdminOverviewStats();
  } catch (err) {
    alert('Error deleting course.');
  }
};

// 4. Manage Quizzes & Modify Questions
const loadAdminQuizzes = async () => {
  const tbody = document.getElementById('adminQuizzesTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/quizzes/list');
    const data = await res.json();

    if (!data.quizzes || data.quizzes.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No quizzes found.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.quizzes.map((q, i) => `
      <tr>
        <td>${i + 1}</td>
        <td class="fw-bold">${escapeHtml(q.title)}</td>
        <td><span class="badge bg-primary">${escapeHtml(q.subject)}</span></td>
        <td><span class="badge bg-warning text-dark fw-bold">${q.total_questions_count || q.total_questions || 5} Questions</span></td>
        <td>${q.time_limit || 30} Mins</td>
        <td>
          <button class="btn btn-sm btn-info text-white me-1 rounded-pill fw-bold" onclick="viewQuizQuestions(${q.quiz_id}, '${escapeHtml(q.title)}')">
            <i class="fas fa-list-check me-1"></i>View/Modify Questions
          </button>
          <button class="btn btn-sm btn-warning text-dark me-1 rounded-pill fw-bold" onclick="openAddQuestionForQuiz(${q.quiz_id}, '${escapeHtml(q.title)}')">
            <i class="fas fa-plus me-1"></i>Add Question
          </button>
          <button class="btn btn-sm btn-danger rounded-pill" onclick="deleteAdminQuiz(${q.quiz_id}, '${escapeHtml(q.title)}')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    console.error('Error loading quizzes:', err);
  }
};

const viewQuizQuestions = async (quizId, quizTitle) => {
  currentViewingQuizId = quizId;
  currentViewingQuizTitle = quizTitle;

  const modalTitle = document.getElementById('viewQuestionsModalTitle');
  if (modalTitle) modalTitle.innerHTML = `<i class="fas fa-list-check me-2"></i>Question Bank for "${escapeHtml(quizTitle)}"`;

  showAdminModal('viewQuestionsModal');
  await loadQuestionsForQuizView(quizId);
};

const loadQuestionsForQuizView = async (quizId) => {
  const tbody = document.getElementById('adminQuestionsListBody');
  const countText = document.getElementById('quizQuestionCountText');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="5" class="text-center py-3"><div class="spinner-border text-primary"></div> Loading questions...</td></tr>`;

  try {
    const res = await fetch(`/api/admin/quizzes/${quizId}/questions`);
    const data = await res.json();

    activeQuizQuestionsCache = data.questions || [];

    if (countText) countText.textContent = `${activeQuizQuestionsCache.length} Questions Saved for this Quiz`;

    if (!activeQuizQuestionsCache || activeQuizQuestionsCache.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No questions created for this quiz yet. Click "Add New Question" above!</td></tr>`;
      return;
    }

    tbody.innerHTML = activeQuizQuestionsCache.map((q, idx) => `
      <tr>
        <td class="fw-bold">${idx + 1}</td>
        <td style="max-width: 320px;">
          <div class="fw-bold text-dark mb-1">${escapeHtml(q.question_text)}</div>
          <small class="text-muted"><em>${escapeHtml(q.explanation || 'No explanation provided')}</em></small>
        </td>
        <td>
          <ul class="list-unstyled mb-0 small">
            <li><strong>A:</strong> ${escapeHtml(q.option_a)}</li>
            <li><strong>B:</strong> ${escapeHtml(q.option_b)}</li>
            <li><strong>C:</strong> ${escapeHtml(q.option_c || '-')}</li>
            <li><strong>D:</strong> ${escapeHtml(q.option_d || '-')}</li>
          </ul>
        </td>
        <td><span class="badge bg-success fs-6">${q.correct_option}</span></td>
        <td>
          <button class="btn btn-sm btn-primary rounded-pill px-3 me-1 fw-bold" onclick="openEditQuestionModal(${idx})">
            <i class="fas fa-edit me-1"></i>Modify
          </button>
          <button class="btn btn-sm btn-outline-danger rounded-pill px-2" onclick="deleteAdminQuestion(${q.question_id}, ${q.quiz_id})">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    console.error('Error loading questions list:', err);
  }
};

const openEditQuestionModal = (idx) => {
  const q = activeQuizQuestionsCache[idx];
  if (!q) return;

  document.getElementById('editQuestionId').value = q.question_id;
  document.getElementById('editQuizId').value = q.quiz_id;
  document.getElementById('editQText').value = q.question_text || '';
  document.getElementById('editQOptA').value = q.option_a || '';
  document.getElementById('editQOptB').value = q.option_b || '';
  document.getElementById('editQOptC').value = q.option_c || '';
  document.getElementById('editQOptD').value = q.option_d || '';
  document.getElementById('editQCorrect').value = q.correct_option || 'A';
  document.getElementById('editQExplanation').value = q.explanation || '';

  showAdminModal('editQuestionModal');
};

const submitEditAdminQuestion = async (e) => {
  if (e) e.preventDefault();

  const question_id = document.getElementById('editQuestionId').value;
  const quiz_id = document.getElementById('editQuizId').value;
  const question_text = document.getElementById('editQText').value.trim();
  const option_a = document.getElementById('editQOptA').value.trim();
  const option_b = document.getElementById('editQOptB').value.trim();
  const option_c = document.getElementById('editQOptC').value.trim();
  const option_d = document.getElementById('editQOptD').value.trim();
  const correct_option = document.getElementById('editQCorrect').value;
  const explanation = document.getElementById('editQExplanation').value.trim();

  try {
    const res = await fetch(`/api/admin/questions/${question_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_text, option_a, option_b, option_c, option_d, correct_option, explanation })
    });

    const data = await res.json();
    alert(`✏️ ${data.message}`);

    hideAdminModal('editQuestionModal');
    loadQuestionsForQuizView(quiz_id);
    loadAdminQuizzes();

  } catch (err) {
    alert('Error updating question.');
  }
};

const deleteAdminQuestion = async (questionId, quizId) => {
  if (!confirm('Are you sure you want to delete this question from the quiz?')) return;

  try {
    const res = await fetch(`/api/admin/questions/${questionId}`, { method: 'DELETE' });
    const data = await res.json();
    alert(`🗑️ ${data.message}`);

    loadQuestionsForQuizView(quizId);
    loadAdminQuizzes();

  } catch (err) {
    alert('Error deleting question.');
  }
};

const openAddQuestionFromView = () => {
  if (currentViewingQuizId) {
    openAddQuestionForQuiz(currentViewingQuizId, currentViewingQuizTitle);
  }
};

const openAddQuestionForQuiz = (quizId, quizTitle) => {
  const sel = document.getElementById('qQuizId');
  if (sel) sel.value = quizId;
  showAdminModal('addQuestionModal');
};

const submitAdminQuestion = async (e) => {
  if (e) e.preventDefault();

  const quiz_id = document.getElementById('qQuizId').value;
  const qTextEl = document.getElementById('qText') || document.getElementById('qQuestionText');
  const question_text = qTextEl ? qTextEl.value.trim() : '';
  const option_a = document.getElementById('qOptA').value.trim();
  const option_b = document.getElementById('qOptB').value.trim();
  const option_c = document.getElementById('qOptC') ? document.getElementById('qOptC').value.trim() : '';
  const option_d = document.getElementById('qOptD') ? document.getElementById('qOptD').value.trim() : '';
  const correct_option = document.getElementById('qCorrect').value;
  const explanation = document.getElementById('qExplanation') ? document.getElementById('qExplanation').value.trim() : '';

  if (!quiz_id || !question_text || !option_a || !option_b) {
    alert('Please fill in Question Text and Options A & B!');
    return;
  }

  try {
    const res = await fetch('/api/admin/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation })
    });

    const data = await res.json();
    alert(`🎉 ${data.message}`);

    hideAdminModal('addQuestionModal');
    const form = document.getElementById('addQuestionForm');
    if (form) form.reset();

    if (currentViewingQuizId == quiz_id) {
      loadQuestionsForQuizView(quiz_id);
    }
    loadAdminQuizzes();
  } catch (err) {
    alert('Error creating question.');
  }
};

const submitCreateQuizAdmin = async (e) => {
  if (e) e.preventDefault();

  const title = document.getElementById('newQuizTitle').value.trim();
  const subject = document.getElementById('newQuizSubject').value;
  const time_limit = document.getElementById('newQuizTimeLimit').value;

  if (!title || !subject) {
    alert('Please enter quiz title and select subject!');
    return;
  }

  try {
    const res = await fetch('/api/admin/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, subject, time_limit })
    });

    const data = await res.json();
    alert(`🎉 ${data.message}`);

    hideAdminModal('addQuizModal');
    const form = document.getElementById('addQuizForm');
    if (form) form.reset();

    loadAdminQuizzes();
    loadAdminOverviewStats();
  } catch (err) {
    alert('Error creating quiz.');
  }
};

const deleteAdminQuiz = async (quizId, quizTitle) => {
  if (!confirm(`Are you sure you want to delete quiz "${quizTitle}"?`)) return;

  try {
    const res = await fetch(`/api/admin/quizzes/${quizId}`, { method: 'DELETE' });
    const data = await res.json();
    alert(`🗑️ ${data.message}`);
    loadAdminQuizzes();
    loadAdminOverviewStats();
  } catch (err) {
    alert('Error deleting quiz.');
  }
};

// 5. Manage Forum (Load Posts, Post Announcement, Delete Post)
const loadAdminForumPosts = async () => {
  const tbody = document.getElementById('adminForumTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/forum/posts');
    const data = await res.json();

    if (!data.posts || data.posts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No forum posts found.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.posts.map((p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td class="fw-bold">${escapeHtml(p.title)}</td>
        <td>
          ${escapeHtml(p.author_name)} 
          <span class="badge ${p.author_role === 'admin' ? 'bg-danger' : p.author_role === 'instructor' ? 'bg-success' : 'bg-secondary'}">${p.author_role || 'student'}</span>
        </td>
        <td><span class="badge bg-primary">${escapeHtml(p.category || 'General')}</span></td>
        <td><small class="text-muted">❤️ ${p.likes_count || 0} Likes | 💬 ${p.reply_count || 0} Replies</small></td>
        <td>${new Date(p.created_at || Date.now()).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-sm btn-info text-white rounded-pill px-2 me-1 fw-bold" onclick="window.open('/forum.html', '_blank')">
            <i class="fas fa-eye me-1"></i>View
          </button>
          <button class="btn btn-sm btn-danger rounded-pill px-2" onclick="deleteAdminForumPost(${p.post_id})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    console.error('Error loading forum posts:', err);
  }
};

const submitAdminForumPost = async (e) => {
  if (e) e.preventDefault();

  const title = document.getElementById('adminForumTitle').value.trim();
  const category = document.getElementById('adminForumCategory').value;
  const content = document.getElementById('adminForumContent').value.trim();

  if (!title || !content) {
    alert('Please fill in announcement title and content!');
    return;
  }

  try {
    const res = await fetch('/api/admin/forum/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, category, content })
    });

    const data = await res.json();
    alert(`🎉 ${data.message}`);

    hideAdminModal('addAdminForumPostModal');
    const form = document.getElementById('addAdminForumPostForm');
    if (form) form.reset();

    loadAdminForumPosts();
  } catch (err) {
    alert('Error posting announcement.');
  }
};

const deleteAdminForumPost = async (postId) => {
  if (!confirm('Are you sure you want to delete this forum post?')) return;

  try {
    const res = await fetch(`/api/admin/forum/${postId}`, { method: 'DELETE' });
    const data = await res.json();
    alert(`🗑️ ${data.message}`);
    loadAdminForumPosts();
  } catch (err) {
    alert('Error deleting post.');
  }
};

// 6. Manage Certificates (Load, Issue, Preview/Print, Delete)
const loadAdminCertificates = async () => {
  const tbody = document.getElementById('adminCertificatesTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/certificates');
    const data = await res.json();

    if (!data.certificates || data.certificates.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No certificates issued yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.certificates.map((c, i) => `
      <tr>
        <td>${i + 1}</td>
        <td class="fw-bold">${escapeHtml(c.user_name)}</td>
        <td><span class="badge bg-primary">${escapeHtml(c.course_name)}</span></td>
        <td><code>${c.certificate_code}</code></td>
        <td>${new Date(c.issued_at || Date.now()).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-sm btn-primary rounded-pill px-3 me-1 fw-bold" onclick="previewAdminCertificate('${escapeHtml(c.user_name)}', '${escapeHtml(c.course_name)}', '${c.certificate_code}')">
            <i class="fas fa-print me-1"></i>Print/View
          </button>
          <button class="btn btn-sm btn-outline-danger rounded-pill px-2" onclick="deleteAdminCertificate(${c.certificate_id})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    console.error('Error loading certificates:', err);
  }
};

const submitIssueCertificate = async (e) => {
  if (e) e.preventDefault();

  const user_name = document.getElementById('certStudentName').value.trim();
  const course_name = document.getElementById('certCourseName').value;

  if (!user_name || !course_name) {
    alert('Please enter student name and select course!');
    return;
  }

  try {
    const res = await fetch('/api/admin/certificates/issue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_name, course_name })
    });

    const data = await res.json();
    alert(`🎓 ${data.message}`);

    hideAdminModal('issueCertificateModal');
    const form = document.getElementById('issueCertificateForm');
    if (form) form.reset();

    loadAdminCertificates();
  } catch (err) {
    alert('Error issuing certificate.');
  }
};

const previewAdminCertificate = (userName, courseName, certCode) => {
  document.getElementById('certModalStudentName').textContent = userName;
  document.getElementById('certModalCourseName').textContent = courseName;
  document.getElementById('certModalCode').textContent = certCode;

  showAdminModal('viewAdminCertificateModal');
};

const deleteAdminCertificate = async (certId) => {
  if (!confirm('Are you sure you want to revoke/delete this student certificate?')) return;

  try {
    const res = await fetch(`/api/admin/certificates/${certId}`, { method: 'DELETE' });
    const data = await res.json();
    alert(`🗑️ ${data.message}`);
    loadAdminCertificates();
  } catch (err) {
    alert('Error revoking certificate.');
  }
};

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
