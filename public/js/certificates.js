// Certificates Page Script
document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();

  if (!user) {
    alert('Please log in to view your certificates!');
    window.location.href = '/login.html';
    return;
  }

  loadCertificates(user.id);
});

const loadCertificates = async (userId) => {
  const container = document.getElementById('certificatesContainer');
  if (!container) return;

  try {
    const res = await fetch(`/api/certificates/user/${userId}`);
    const data = await res.json();

    if (!res.ok) throw new Error('Failed to load certificates');

    if (data.certificates.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="card border-0 shadow-sm p-5 rounded-4">
            <i class="fas fa-award fa-4x text-warning mb-3"></i>
            <h4 class="fw-bold">No Certificates Earned Yet</h4>
            <p class="text-muted mb-4">Complete 100% progress and pass course quizzes to unlock your verified certificates.</p>
            <div>
              <a href="/courses.html" class="btn btn-primary rounded-pill fw-bold">
                <i class="fas fa-graduation-cap me-2"></i>Explore Courses
              </a>
            </div>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = data.certificates.map(cert => `
      <div class="col-md-6 mb-4">
        <div class="card border-3 border-warning shadow-sm rounded-4 overflow-hidden position-relative bg-white">
          <div class="card-body p-4 text-center">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="badge bg-warning text-dark"><i class="fas fa-shield-alt me-1"></i>Verified Certificate</span>
              <small class="text-muted fw-bold">${cert.certificate_code}</small>
            </div>
            <i class="fas fa-graduation-cap fa-3x text-primary mb-2"></i>
            <h6 class="text-uppercase tracking-wider text-muted small">Certificate of Completion</h6>
            <h4 class="fw-bold text-dark my-2">${cert.user_name}</h4>
            <p class="small text-muted mb-3">has successfully completed the online course</p>
            <h5 class="fw-bold text-primary mb-3">${cert.course_name}</h5>
            <div class="border-top pt-3 d-flex justify-content-between align-items-center">
              <small class="text-muted">Issued: ${new Date(cert.issued_at).toLocaleDateString()}</small>
              <button class="btn btn-outline-primary btn-sm rounded-pill fw-bold" onclick="window.print()">
                <i class="fas fa-print me-1"></i>Print / Download
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error('Certificates error:', err);
    container.innerHTML = `<div class="col-12 text-center text-danger"><p>Failed to load certificates.</p></div>`;
  }
};
