// SmartLearn Common Main JS Helper
const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user') || localStorage.getItem('smartlearn_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
};

const getAuthToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('smartlearn_token');
};

const logoutUser = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('smartlearn_user');
  localStorage.removeItem('smartlearn_token');
  window.location.href = '/login.html';
};

const updateNavbarAuth = () => {
  const navCollapse = document.getElementById('navbarNav');
  if (!navCollapse) return;

  const user = getCurrentUser();
  const navList = navCollapse.querySelector('.navbar-nav');
  if (!navList) return;

  if (user) {
    // Hide login/register links if user is logged in
    const items = navList.querySelectorAll('.nav-item');
    items.forEach(item => {
      const link = item.querySelector('a');
      if (link) {
        const href = link.getAttribute('href');
        if (href === '/login.html' || href === '/register.html') {
          item.classList.add('d-none');
        }
      }
    });

    // Add user menu if not already added
    if (!document.getElementById('navUserDropdown')) {
      const userLi = document.createElement('li');
      userLi.id = 'navUserDropdown';
      userLi.className = 'nav-item dropdown ms-2';

      let dashboardLink = '<li><a class="dropdown-item" href="/dashboard.html"><i class="fas fa-th-large me-2"></i>Student Dashboard</a></li>';
      if (user.role === 'admin') {
        dashboardLink = '<li><a class="dropdown-item text-danger fw-bold" href="/admin/dashboard.html"><i class="fas fa-user-shield me-2"></i>Admin Panel</a></li>';
      } else if (user.role === 'instructor' || user.role === 'teacher') {
        dashboardLink = '<li><a class="dropdown-item text-warning fw-bold" href="/instructor/dashboard.html"><i class="fas fa-chalkboard-teacher me-2"></i>Instructor Portal</a></li>';
      }

      userLi.innerHTML = `
        <a class="nav-link dropdown-toggle text-warning fw-bold" href="#" role="button" data-bs-toggle="dropdown">
          <i class="fas fa-user-circle me-1"></i>${user.name || 'User'} (${(user.role || 'student').toUpperCase()})
        </a>
        <ul class="dropdown-menu dropdown-menu-end shadow">
          ${dashboardLink}
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item text-danger" href="#" onclick="logoutUser()"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
        </ul>
      `;
      navList.appendChild(userLi);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  updateNavbarAuth();
});
