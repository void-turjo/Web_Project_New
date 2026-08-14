// SmartLearn Interactive Instructor Portal Logic

document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  if (user.name) {
    const el = document.getElementById('instructorName');
    if (el) el.textContent = `👨‍🏫 ${user.name}`;
  }

  loadInstructorOverview();
});

const loadInstructorOverview = async () => {
  await Promise.all([
    loadInstructorCourses(),
    loadInstructorQuizzes(),
    loadUnansweredForumQuestions(),
    loadInstructorStudents()
  ]);
};

// 1. Load Courses Taught by Instructor
const loadInstructorCourses = async () => {
  const grid = document.getElementById('instructorCoursesGrid');
  const courseSelect = document.getElementById('lessonCourseSelect');
  if (!grid) return;

  try {
    const res = await fetch('/api/instructor/courses/10');
    const data = await res.json();

    if (!data.courses || data.courses.length === 0) {
      grid.innerHTML = `<div class="col-12 text-center text-muted py-4">No courses created yet. Click "Add New Course" above!</div>`;
      return;
    }

    grid.innerHTML = data.courses.map(c => `
      <div class="col-md-6">
        <div class="card border-0 shadow-sm rounded-4 h-100 p-3">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="badge ${c.badge_bg || 'bg-primary'}">${c.subject || 'Programming'}</span>
              <small class="text-muted"><i class="fas fa-video me-1"></i>${c.video_count || 1} Lessons</small>
            </div>
            <h5 class="fw-bold text-dark mb-2">${escapeHtml(c.course_name)}</h5>
            <p class="text-muted small mb-3">${escapeHtml(c.description || 'Comprehensive video & PDF lecture notes.')}</p>
            <div class="d-flex justify-content-between align-items-center border-top pt-2">
              <small class="text-muted"><i class="fas fa-users me-1"></i>${c.enrolled_students || 0} Students</small>
              <button class="btn btn-outline-primary btn-sm rounded-pill px-3" onclick="openUploadLessonModal(${c.course_id}, '${escapeHtml(c.course_name)}')">
                <i class="fas fa-plus me-1"></i>Add Lesson
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    if (courseSelect) {
      courseSelect.innerHTML = data.courses.map(c => `<option value="${c.course_id}">${escapeHtml(c.course_name)}</option>`).join('');
    }

    const statCourses = document.getElementById('statCourses');
    if (statCourses) statCourses.textContent = data.courses.length;

  } catch (err) {
    console.error('Error loading instructor courses:', err);
  }
};

// 2. Load Quizzes for Instructor
const loadInstructorQuizzes = async () => {
  const table = document.getElementById('instructorQuizzesTable');
  const quizSelect = document.getElementById('questionQuizSelect');
  if (!table) return;

  try {
    const res = await fetch('/api/instructor/quizzes/10');
    const data = await res.json();

    if (!data.quizzes || data.quizzes.length === 0) {
      table.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">No quizzes created yet.</td></tr>`;
      return;
    }

    table.innerHTML = data.quizzes.map(q => `
      <tr>
        <td>#${q.quiz_id}</td>
        <td class="fw-bold text-dark">${escapeHtml(q.title)}</td>
        <td><span class="badge bg-success">${escapeHtml(q.subject)}</span></td>
        <td>${q.total_questions || 10} Questions</td>
        <td>${q.time_limit || 15} Mins</td>
        <td>
          <button class="btn btn-sm btn-outline-dark rounded-pill px-3" onclick="openAddQuestionModal(${q.quiz_id}, '${escapeHtml(q.title)}')">
            <i class="fas fa-plus me-1"></i>Add Question
          </button>
        </td>
      </tr>
    `).join('');

    if (quizSelect) {
      quizSelect.innerHTML = data.quizzes.map(q => `<option value="${q.quiz_id}">${escapeHtml(q.title)}</option>`).join('');
    }

  } catch (err) {
    console.error('Error loading instructor quizzes:', err);
  }
};

// 3. Load Unanswered Student Forum Questions
const loadUnansweredForumQuestions = async () => {
  const container = document.getElementById('unansweredQuestionsContainer');
  if (!container) return;

  try {
    const res = await fetch('/api/instructor/forum/unanswered');
    const data = await res.json();

    if (!data.questions || data.questions.length === 0) {
      container.innerHTML = `<div class="alert alert-success text-center py-3 mb-0">🎉 All student forum questions answered!</div>`;
      return;
    }

    const statQuestions = document.getElementById('statQuestions');
    if (statQuestions) statQuestions.textContent = data.questions.length;

    container.innerHTML = data.questions.map(q => `
      <div class="card border-0 shadow-sm mb-3 rounded-4 p-3 bg-white">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="badge bg-warning text-dark"><i class="fas fa-question-circle me-1"></i>${escapeHtml(q.category || 'General')}</span>
          <small class="text-muted">Student: ${escapeHtml(q.author_name || 'Student')}</small>
        </div>
        <h6 class="fw-bold text-dark mb-2">${escapeHtml(q.title)}</h6>
        <p class="text-muted small mb-3">${escapeHtml(q.content || '')}</p>

        <!-- Instructor Answer Form -->
        <div class="input-group">
          <input type="text" class="form-control" id="teacherAnsInput_${q.post_id}" placeholder="Write official teacher response & explanation..."/>
          <button class="btn btn-warning fw-bold px-4 text-dark" onclick="publishTeacherAnswer(${q.post_id})">
            <i class="fas fa-paper-plane me-1"></i>Publish Teacher Answer
          </button>
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error('Error loading forum questions:', err);
  }
};

// 4. Load Enrolled Students Table
const loadInstructorStudents = async () => {
  const table = document.getElementById('instructorStudentsTable');
  if (!table) return;

  try {
    const res = await fetch('/api/instructor/students/10');
    const data = await res.json();

    if (!data.students || data.students.length === 0) {
      table.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">No student enrollments found.</td></tr>`;
      return;
    }

    table.innerHTML = data.students.map(s => `
      <tr>
        <td>#${s.enrollment_id}</td>
        <td class="fw-bold text-dark">${escapeHtml(s.student_name)}</td>
        <td>${escapeHtml(s.email)}</td>
        <td><span class="badge bg-primary">${escapeHtml(s.course_name)}</span></td>
        <td style="width: 200px;">
          <div class="progress" style="height: 8px;">
            <div class="progress-bar bg-success" style="width: ${s.progress}%;"></div>
          </div>
          <small class="text-muted">${s.progress}% Complete</small>
        </td>
        <td>${new Date(s.enrolled_at).toLocaleDateString()}</td>
      </tr>
    `).join('');

  } catch (err) {
    console.error('Error loading students:', err);
  }
};

// --- SUBMIT HANDLERS ---

const submitInstructorCourse = async (e) => {
  e.preventDefault();
  const name = document.getElementById('newCourseName').value.trim();
  const subject = document.getElementById('newCourseSubject').value;
  const duration = document.getElementById('newCourseDuration').value.trim();
  const desc = document.getElementById('newCourseDesc').value.trim();

  const user = JSON.parse(localStorage.getItem('user')) || {};

  try {
    const res = await fetch('/api/instructor/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        course_name: name,
        subject,
        duration,
        description: desc,
        instructor_name: user.name || 'Prof. Alan Turing'
      })
    });
    const data = await res.json();
    alert(`🎉 ${data.message}`);

    const modalEl = document.getElementById('addCourseModal');
    if (modalEl) bootstrap.Modal.getInstance(modalEl).hide();
    document.getElementById('createCourseForm').reset();
    loadInstructorCourses();

  } catch (err) {
    alert('Error creating course.');
  }
};

const submitInstructorLesson = async (e) => {
  e.preventDefault();
  const course_id = document.getElementById('lessonCourseSelect').value;
  const title = document.getElementById('lessonTitle').value.trim();
  const video_url = document.getElementById('lessonVideoUrl').value.trim();
  const pdf_url = document.getElementById('lessonPdfUrl').value.trim();

  try {
    const res = await fetch('/api/instructor/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id, title, video_url, pdf_url })
    });
    const data = await res.json();
    alert(`🎥 ${data.message}`);

    const modalEl = document.getElementById('uploadLessonModal');
    if (modalEl) bootstrap.Modal.getInstance(modalEl).hide();
    document.getElementById('uploadLessonForm').reset();
    loadInstructorCourses();

  } catch (err) {
    alert('Error uploading lesson.');
  }
};

const submitInstructorQuiz = async (e) => {
  e.preventDefault();
  const title = document.getElementById('quizTitle').value.trim();
  const subject = document.getElementById('quizSubject').value;
  const time_limit = document.getElementById('quizTimeLimit').value;

  try {
    const res = await fetch('/api/instructor/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, subject, time_limit })
    });
    const data = await res.json();
    alert(`📝 ${data.message}`);

    const modalEl = document.getElementById('addQuizModal');
    if (modalEl) bootstrap.Modal.getInstance(modalEl).hide();
    document.getElementById('createQuizForm').reset();
    loadInstructorQuizzes();

  } catch (err) {
    alert('Error creating quiz.');
  }
};

const submitInstructorQuestion = async (e) => {
  e.preventDefault();
  const quiz_id = document.getElementById('questionQuizSelect').value;
  const question_text = document.getElementById('qText').value.trim();
  const option_a = document.getElementById('qOptA').value.trim();
  const option_b = document.getElementById('qOptB').value.trim();
  const option_c = document.getElementById('qOptC').value.trim();
  const option_d = document.getElementById('qOptD').value.trim();
  const correct_option = document.getElementById('qCorrect').value;
  const explanation = document.getElementById('qExplanation').value.trim();

  try {
    const res = await fetch('/api/instructor/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation })
    });
    const data = await res.json();
    alert(`❓ ${data.message}`);

    const modalEl = document.getElementById('addQuestionModal');
    if (modalEl) bootstrap.Modal.getInstance(modalEl).hide();
    document.getElementById('createQuestionForm').reset();

  } catch (err) {
    alert('Error saving question.');
  }
};

const publishTeacherAnswer = async (postId) => {
  const input = document.getElementById(`teacherAnsInput_${postId}`);
  const content = input ? input.value.trim() : '';

  if (!content) {
    alert('Please enter a teacher response!');
    return;
  }

  const user = JSON.parse(localStorage.getItem('user')) || {};

  try {
    const res = await fetch('/api/instructor/forum/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        post_id: postId,
        teacher_id: user.id || 10,
        teacher_name: user.name || 'Prof. Alan Turing',
        content
      })
    });
    const data = await res.json();
    alert(`👨‍🏫 ${data.message}`);
    loadUnansweredForumQuestions();

  } catch (err) {
    alert('Error publishing teacher response.');
  }
};

function openUploadLessonModal(courseId, courseName) {
  const modalEl = document.getElementById('uploadLessonModal');
  const courseSelect = document.getElementById('lessonCourseSelect');
  if (courseSelect) courseSelect.value = courseId;
  new bootstrap.Modal(modalEl).show();
}

function openAddQuestionModal(quizId, quizTitle) {
  const modalEl = document.getElementById('addQuestionModal');
  const quizSelect = document.getElementById('questionQuizSelect');
  if (quizSelect) quizSelect.value = quizId;
  new bootstrap.Modal(modalEl).show();
}

function logoutInstructor() {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  window.location.href = '/login.html';
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
