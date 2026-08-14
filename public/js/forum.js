// SmartLearn Interactive Discussion Forum Engine

let activeCategory = 'all';
let currentPostId = null;

document.addEventListener('DOMContentLoaded', () => {
  loadForumPosts();
});

// 1. Load Forum Posts with Category Filter & Live Search
const loadForumPosts = async (category = 'all', searchQuery = '') => {
  activeCategory = category;
  const container = document.getElementById('postsContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="text-muted mt-2">Loading discussion topics...</p>
    </div>
  `;

  try {
    let url = `/api/forum/posts?category=${encodeURIComponent(category)}`;
    if (searchQuery && searchQuery.trim() !== '') {
      url += `&search=${encodeURIComponent(searchQuery.trim())}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    if (!data.posts || data.posts.length === 0) {
      container.innerHTML = `
        <div class="card border-0 shadow-sm p-5 text-center rounded-4">
          <i class="fas fa-comments fa-3x text-muted mb-3"></i>
          <h5 class="fw-bold">No Discussion Topics Found</h5>
          <p class="text-muted">Be the first to ask a question in this category!</p>
          <div>
            <button class="btn btn-primary rounded-pill px-4 fw-bold" data-bs-toggle="modal" data-bs-target="#createPostModal">
              <i class="fas fa-plus me-2"></i>Create New Post
            </button>
          </div>
        </div>
      `;
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem('user')) || {};

    container.innerHTML = data.posts.map(p => {
      const categoryBadge = getCategoryBadge(p.category);
      const isTeacher = p.author_role === 'instructor' || p.author_role === 'teacher' || p.author_role === 'admin';
      const authorRoleBadge = isTeacher 
        ? `<span class="badge bg-warning text-dark me-2"><i class="fas fa-chalkboard-teacher me-1"></i>Teacher</span>`
        : `<span class="badge bg-light text-dark border me-2">Student</span>`;
      
      const isOwner = currentUser.id === p.user_id || currentUser.role === 'admin';

      return `
        <div class="card border-0 shadow-sm mb-3 post-item rounded-4 transition-hover">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div>
                ${categoryBadge}
                ${authorRoleBadge}
              </div>
              <small class="text-muted"><i class="far fa-clock me-1"></i>${new Date(p.created_at || Date.now()).toLocaleDateString()}</small>
            </div>
            
            <h5 class="fw-bold text-dark mb-2" style="cursor: pointer;" onclick="openDiscussionThread(${p.post_id})">
              ${escapeHtml(p.title)}
            </h5>
            
            <p class="text-muted mb-3" style="line-height: 1.6;">
              ${escapeHtml(p.content.length > 180 ? p.content.substring(0, 180) + '...' : p.content)}
            </p>
            
            <div class="d-flex align-items-center justify-content-between pt-2 border-top">
              <div class="d-flex align-items-center">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(p.author_name)}&background=${isTeacher ? 'ffc107' : '0d6efd'}&color=${isTeacher ? '000' : 'fff'}&size=32" class="rounded-circle me-2 shadow-sm"/>
                <span class="fw-semibold text-dark me-2 small">${escapeHtml(p.author_name)}</span>
              </div>

              <div class="d-flex align-items-center gap-2">
                <button class="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold" onclick="openDiscussionThread(${p.post_id})">
                  <i class="fas fa-comment me-1"></i>${p.reply_count || 0} Replies
                </button>
                <button class="btn btn-sm btn-outline-success rounded-pill px-3 fw-bold" onclick="upvoteForumPost(${p.post_id}, this)">
                  <i class="fas fa-thumbs-up me-1"></i><span class="like-count">${p.likes_count || 0}</span>
                </button>
                ${isOwner ? `
                  <button class="btn btn-sm btn-outline-danger rounded-pill px-2" onclick="deleteForumPostUser(${p.post_id})">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Error loading forum posts:', err);
  }
};

// 2. Open Discussion Thread Modal & Load Replies
const openDiscussionThread = async (postId) => {
  currentPostId = postId;
  const modalEl = document.getElementById('threadModal');
  if (!modalEl) return;

  const modal = new bootstrap.Modal(modalEl);
  modal.show();

  const titleEl = document.getElementById('threadPostTitle');
  const metaEl = document.getElementById('threadPostMeta');
  const bodyEl = document.getElementById('threadPostBody');
  const repliesContainer = document.getElementById('threadRepliesContainer');

  repliesContainer.innerHTML = `<div class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div> Loading replies...</div>`;

  try {
    // Fetch post comments
    const res = await fetch(`/api/forum/comments/${postId}`);
    const data = await res.json();

    // Fetch post details
    const postsRes = await fetch('/api/forum/posts');
    const postsData = await postsRes.json();
    const post = postsData.posts.find(p => p.post_id === postId);

    if (post) {
      const isTeacher = post.author_role === 'instructor' || post.author_role === 'teacher' || post.author_role === 'admin';
      titleEl.textContent = post.title;
      metaEl.innerHTML = `
        Posted by <strong class="${isTeacher ? 'text-warning' : 'text-primary'}">${escapeHtml(post.author_name)}</strong> 
        ${isTeacher ? '<span class="badge bg-warning text-dark ms-1">Teacher</span>' : ''} • ${new Date(post.created_at || Date.now()).toLocaleDateString()}
      `;
      bodyEl.textContent = post.content;
    }

    if (!data.comments || data.comments.length === 0) {
      repliesContainer.innerHTML = `
        <div class="alert alert-light text-center py-4 border rounded-3 mb-0">
          <p class="mb-0 text-muted">No replies yet. Be the first teacher or student to answer!</p>
        </div>
      `;
      return;
    }

    repliesContainer.innerHTML = data.comments.map(c => {
      const isTeacher = c.author_role === 'instructor' || c.author_role === 'teacher' || c.author_role === 'admin';
      return `
        <div class="card border-0 shadow-sm mb-3 rounded-4 ${isTeacher ? 'border-start border-warning border-4 bg-warning bg-opacity-10' : 'bg-light'}">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div class="d-flex align-items-center">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(c.author_name)}&background=${isTeacher ? 'ffc107' : '0d6efd'}&color=${isTeacher ? '000' : 'fff'}&size=28" class="rounded-circle me-2"/>
                <strong class="me-2 small">${escapeHtml(c.author_name)}</strong>
                ${isTeacher ? `<span class="badge bg-warning text-dark fw-bold"><i class="fas fa-chalkboard-teacher me-1"></i>Teacher Answer</span>` : `<span class="badge bg-secondary opacity-75 small">Student</span>`}
              </div>
              <small class="text-muted">${new Date(c.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
            </div>
            <p class="mb-0 text-dark small" style="line-height: 1.6;">${escapeHtml(c.content)}</p>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Error loading replies:', err);
  }
};

// 3. Submit Reply to Post
const submitForumReply = async () => {
  if (!currentPostId) return;

  const contentInput = document.getElementById('replyContent');
  const content = contentInput.value.trim();

  if (!content) {
    alert('Please enter a reply message!');
    return;
  }

  const currentUser = JSON.parse(localStorage.getItem('user')) || { id: 1, name: 'Student', role: 'student' };

  try {
    const res = await fetch('/api/forum/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        post_id: currentPostId,
        user_id: currentUser.id,
        author_name: currentUser.name || 'Student',
        author_role: currentUser.role || 'student',
        content
      })
    });

    const data = await res.json();
    contentInput.value = '';

    // Reload thread replies & posts
    openDiscussionThread(currentPostId);
    loadForumPosts(activeCategory);

  } catch (err) {
    alert('Error posting reply.');
  }
};

// 4. Submit New Discussion Post
const submitNewForumPost = async (e) => {
  if (e) e.preventDefault();

  const title = document.getElementById('postTitle').value.trim();
  const content = document.getElementById('postContent').value.trim();
  const category = document.getElementById('postCategory').value;

  if (!title || !content) {
    alert('Please enter both Title and Content!');
    return;
  }

  const currentUser = JSON.parse(localStorage.getItem('user')) || { id: 1, name: 'Student', role: 'student' };

  try {
    const res = await fetch('/api/forum/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: currentUser.id,
        author_name: currentUser.name || 'Student',
        author_role: currentUser.role || 'student',
        title,
        content,
        category
      })
    });

    const data = await res.json();
    alert(`🎉 ${data.message}`);

    const modalEl = document.getElementById('createPostModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }
    const form = document.getElementById('createPostForm');
    if (form) form.reset();

    loadForumPosts(activeCategory);

  } catch (err) {
    alert('Error creating post.');
  }
};

// 5. Upvote Post
const upvoteForumPost = async (postId, btn) => {
  try {
    const res = await fetch(`/api/forum/like/${postId}`, { method: 'POST' });
    if (res.ok) {
      const countEl = btn.querySelector('.like-count');
      if (countEl) countEl.textContent = parseInt(countEl.textContent) + 1;
      btn.classList.remove('btn-outline-success');
      btn.classList.add('btn-success');
      btn.disabled = true;
    }
  } catch (err) {
    console.error('Error liking post:', err);
  }
};

// 6. Delete Post
const deleteForumPostUser = async (postId) => {
  if (!confirm('Are you sure you want to delete this discussion topic?')) return;

  try {
    const res = await fetch(`/api/forum/posts/${postId}`, { method: 'DELETE' });
    const data = await res.json();
    alert(`🗑️ ${data.message}`);
    loadForumPosts(activeCategory);
  } catch (err) {
    alert('Error deleting post.');
  }
};

// Category Badge Helper
function getCategoryBadge(category) {
  switch (category) {
    case 'Mathematics':
      return `<span class="badge bg-primary me-1"><i class="fas fa-square-root-alt me-1"></i>Mathematics</span>`;
    case 'Programming':
      return `<span class="badge bg-success me-1"><i class="fas fa-code me-1"></i>Programming</span>`;
    case 'Database':
      return `<span class="badge bg-warning text-dark me-1"><i class="fas fa-database me-1"></i>Database</span>`;
    case 'AI/ML':
      return `<span class="badge bg-info text-dark me-1"><i class="fas fa-robot me-1"></i>AI/ML</span>`;
    default:
      return `<span class="badge bg-secondary me-1"><i class="fas fa-comments me-1"></i>General Discussion</span>`;
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
