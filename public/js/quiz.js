// Quiz Page Interactive Engine
let activeQuiz = null;
let currentQuestions = [];
let userAnswers = {};

document.addEventListener('DOMContentLoaded', () => {
  loadQuizzes();
});

const loadQuizzes = async (subject = 'All Subjects') => {
  const container = document.getElementById('quizListContainer');
  if (!container) return;

  try {
    const res = await fetch(`/api/quiz?subject=${encodeURIComponent(subject)}`);
    const data = await res.json();

    if (!res.ok) throw new Error('Failed to load quizzes');

    if (data.quizzes.length === 0) {
      container.innerHTML = `<div class="col-12 text-center py-4 text-muted"><p>No quizzes available for this category yet.</p></div>`;
      return;
    }

    container.innerHTML = data.quizzes.map(q => `
      <div class="col-md-4 mb-4">
        <div class="card border-0 shadow-sm h-100 rounded-4">
          <div class="card-body p-4 d-flex flex-column">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="badge bg-primary rounded-pill">${q.subject}</span>
              <span class="small text-muted"><i class="fas fa-clock me-1"></i>${q.time_limit || 10} Mins</span>
            </div>
            <h5 class="fw-bold mt-2">${q.title}</h5>
            <p class="text-muted small flex-grow-1">Test your concepts with ${q.total_questions || 5} multiple-choice questions.</p>
            <button class="btn btn-outline-primary w-100 rounded-pill fw-bold mt-3" onclick="startQuiz(${q.quiz_id})">
              <i class="fas fa-play me-2"></i>Start Quiz
            </button>
          </div>
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error('Quiz loading error:', err);
    container.innerHTML = `<div class="col-12 text-center text-danger"><p>Unable to load quizzes. Check database connection.</p></div>`;
  }
};

const startQuiz = async (quizId) => {
  const user = getCurrentUser();
  if (!user) {
    alert('Please log in to attempt quizzes!');
    window.location.href = '/login.html';
    return;
  }

  try {
    const res = await fetch(`/api/quiz/${quizId}`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Failed to start quiz');

    activeQuiz = data.quiz;
    currentQuestions = data.questions;
    userAnswers = {};

    renderQuizModal();
    const modalEl = document.getElementById('quizModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }

  } catch (err) {
    alert(err.message || 'Error starting quiz.');
  }
};

const renderQuizModal = () => {
  const modalBody = document.getElementById('quizModalBody');
  const modalTitle = document.getElementById('quizModalTitle');

  if (!modalBody || !modalTitle) return;

  modalTitle.textContent = activeQuiz.title;

  if (currentQuestions.length === 0) {
    modalBody.innerHTML = `<p class="text-center text-muted">No questions found in this quiz.</p>`;
    return;
  }

  modalBody.innerHTML = `
    <form id="quizForm">
      ${currentQuestions.map((q, idx) => `
        <div class="card border-0 bg-light mb-4 p-3 rounded-3">
          <h6 class="fw-bold mb-3">${idx + 1}. ${q.question_text}</h6>
          <div class="form-check mb-2">
            <input class="form-check-input" type="radio" name="q_${q.question_id}" value="A" id="q_${q.question_id}_A" onchange="recordAnswer(${q.question_id}, 'A')">
            <label class="form-check-label w-100 p-2 border bg-white rounded cursor-pointer" for="q_${q.question_id}_A">
              A) ${q.option_a}
            </label>
          </div>
          <div class="form-check mb-2">
            <input class="form-check-input" type="radio" name="q_${q.question_id}" value="B" id="q_${q.question_id}_B" onchange="recordAnswer(${q.question_id}, 'B')">
            <label class="form-check-label w-100 p-2 border bg-white rounded cursor-pointer" for="q_${q.question_id}_B">
              B) ${q.option_b}
            </label>
          </div>
          <div class="form-check mb-2">
            <input class="form-check-input" type="radio" name="q_${q.question_id}" value="C" id="q_${q.question_id}_C" onchange="recordAnswer(${q.question_id}, 'C')">
            <label class="form-check-label w-100 p-2 border bg-white rounded cursor-pointer" for="q_${q.question_id}_C">
              C) ${q.option_c}
            </label>
          </div>
          <div class="form-check mb-2">
            <input class="form-check-input" type="radio" name="q_${q.question_id}" value="D" id="q_${q.question_id}_D" onchange="recordAnswer(${q.question_id}, 'D')">
            <label class="form-check-label w-100 p-2 border bg-white rounded cursor-pointer" for="q_${q.question_id}_D">
              D) ${q.option_d}
            </label>
          </div>
        </div>
      `).join('')}
      <button type="button" class="btn btn-success btn-lg w-100 fw-bold rounded-pill" onclick="submitActiveQuiz()">
        <i class="fas fa-check-circle me-2"></i>Submit Quiz Answers
      </button>
    </form>
  `;
};

const recordAnswer = (questionId, option) => {
  userAnswers[questionId] = option;
};

const submitActiveQuiz = async () => {
  const user = getCurrentUser();
  if (!user || !activeQuiz) return;

  if (Object.keys(userAnswers).length < currentQuestions.length) {
    if (!confirm('You have unanswered questions. Are you sure you want to submit?')) {
      return;
    }
  }

  try {
    const res = await fetch('/api/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        quiz_id: activeQuiz.quiz_id,
        answers: userAnswers
      })
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.message || 'Submission failed');

    // Hide Modal & Show Result Alert
    const modalEl = document.getElementById('quizModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    alert(`🏆 ${result.message}\nScore: ${result.score} / ${result.totalQuestions} (${result.percentage}%)`);

  } catch (err) {
    alert(err.message || 'Error submitting quiz.');
  }
};
