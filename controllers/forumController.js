const db = require('../config/db');

// Ensure database columns exist on startup
db.query("ALTER TABLE forum_posts ADD COLUMN author_role VARCHAR(50) DEFAULT 'student'", () => {});
db.query("ALTER TABLE forum_comments ADD COLUMN author_role VARCHAR(50) DEFAULT 'student'", () => {});

// Initial Fallback Forum Posts with categories & teacher replies
let fallbackPosts = [
  {
    post_id: 1,
    user_id: 2,
    author_name: 'Ahmed Khan',
    author_role: 'student',
    title: 'How to solve quadratic equations using the general formula?',
    content: 'I am having trouble solving quadratic equations when the discriminant is negative. Can someone explain step-by-step how to handle complex roots?',
    category: 'Mathematics',
    likes_count: 14,
    reply_count: 2,
    created_at: new Date(Date.now() - 3600000 * 2)
  },
  {
    post_id: 2,
    user_id: 3,
    author_name: 'Sara Ahmed',
    author_role: 'student',
    title: 'Which language is better for Web Development: Python or JavaScript?',
    content: 'I want to build full-stack web applications. Should I focus first on JavaScript or Python for backend API development?',
    category: 'Programming',
    likes_count: 28,
    reply_count: 2,
    created_at: new Date(Date.now() - 3600000 * 5)
  },
  {
    post_id: 3,
    user_id: 4,
    author_name: 'Test Student',
    author_role: 'student',
    title: 'What is the key difference between SQL (Relational) and NoSQL (MongoDB)?',
    content: 'When designing a database schema for an e-learning website, when should we prefer MySQL tables over MongoDB documents?',
    category: 'Database',
    likes_count: 19,
    reply_count: 1,
    created_at: new Date(Date.now() - 3600000 * 12)
  },
  {
    post_id: 4,
    user_id: 5,
    author_name: 'Rahim Ali',
    author_role: 'student',
    title: 'Supervised vs Unsupervised Machine Learning explained simply?',
    content: 'Can someone explain the core difference between Supervised learning algorithms like Decision Trees and Unsupervised clustering like K-Means?',
    category: 'AI/ML',
    likes_count: 32,
    reply_count: 1,
    created_at: new Date(Date.now() - 3600000 * 24)
  },
  {
    post_id: 5,
    user_id: 6,
    author_name: 'Fatima Begum',
    author_role: 'student',
    title: 'What are the best study habits for preparing for final exams?',
    content: 'What techniques do top students use to retain complex physics formulas and coding syntax during exam week?',
    category: 'General Discussion',
    likes_count: 45,
    reply_count: 1,
    created_at: new Date(Date.now() - 3600000 * 48)
  }
];

let fallbackComments = {
  1: [
    { comment_id: 101, post_id: 1, user_id: 10, author_name: 'Prof. Alan Turing', author_role: 'instructor', content: 'Great question Ahmed! When discriminant D = (b² - 4ac) < 0, the equation has two complex conjugate roots x = (-b ± i√|D|) / 2a.', likes_count: 8, created_at: new Date(Date.now() - 3600000 * 1) },
    { comment_id: 102, post_id: 1, user_id: 2, author_name: 'Ahmed Khan', author_role: 'student', content: 'Thank you Professor Turing! That makes it crystal clear.', likes_count: 3, created_at: new Date(Date.now() - 1800000) }
  ],
  2: [
    { comment_id: 201, post_id: 2, user_id: 11, author_name: 'John Doe', author_role: 'instructor', content: 'For modern full-stack web development, JavaScript is indispensable since it runs both in the browser (frontend) and on Node.js server (backend)!', likes_count: 15, created_at: new Date(Date.now() - 3600000 * 4) },
    { comment_id: 202, post_id: 2, user_id: 3, author_name: 'Sara Ahmed', author_role: 'student', content: 'Understood! I will start with HTML, CSS, JavaScript, and Node.js.', likes_count: 5, created_at: new Date(Date.now() - 3600000 * 3) }
  ],
  3: [
    { comment_id: 301, post_id: 3, user_id: 12, author_name: 'Dr. Sarah Connor', author_role: 'instructor', content: 'SQL databases (like MySQL) use structured tables with foreign keys and strict ACID transactions — ideal for users, course enrollments, and payments.', likes_count: 11, created_at: new Date(Date.now() - 3600000 * 10) }
  ],
  4: [
    { comment_id: 401, post_id: 4, user_id: 13, author_name: 'Dr. Richard Feynman', author_role: 'instructor', content: 'Supervised learning trains on labeled datasets (inputs + true target labels). Unsupervised learning discovers hidden patterns in unlabeled data!', likes_count: 18, created_at: new Date(Date.now() - 3600000 * 20) }
  ],
  5: [
    { comment_id: 501, post_id: 5, user_id: 14, author_name: 'Marie Curie', author_role: 'instructor', content: 'Practice Active Recall and Spaced Repetition! Test yourself using SmartLearn online quizzes 3 times a week instead of passive reading.', likes_count: 22, created_at: new Date(Date.now() - 3600000 * 40) }
  ]
};

// 1. Get all forum posts with filter search
const getPosts = (req, res) => {
  const { category, search } = req.query;

  let sql = `
    SELECT fp.*, COUNT(fc.comment_id) as reply_count
    FROM forum_posts fp
    LEFT JOIN forum_comments fc ON fp.post_id = fc.post_id
  `;
  const params = [];

  if (category && category !== 'all' && category !== 'All Discussions') {
    sql += ' WHERE fp.category = ?';
    params.push(category);
  }

  sql += ' GROUP BY fp.post_id ORDER BY fp.created_at DESC';

  db.query(sql, params, (err, results) => {
    if (err || !results || results.length === 0) {
      let filtered = fallbackPosts;
      if (category && category !== 'all' && category !== 'All Discussions') {
        filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }
      if (search && search.trim() !== '') {
        const q = search.toLowerCase();
        filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
      }
      return res.status(200).json({ posts: filtered });
    }

    let posts = results;
    if (search && search.trim() !== '') {
      const q = search.toLowerCase();
      posts = posts.filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }

    res.status(200).json({ posts });
  });
};

// 2. Create new forum post (Handles DB & In-Memory fallback gracefully)
const createPost = (req, res) => {
  const { user_id, author_name, author_role, title, content, category } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required!' });
  }

  const newPost = {
    post_id: Date.now(),
    user_id: parseInt(user_id) || 1,
    author_name: author_name || 'Student',
    author_role: author_role || 'student',
    title,
    content,
    category: category || 'General Discussion',
    likes_count: 0,
    reply_count: 0,
    created_at: new Date()
  };

  fallbackPosts.unshift(newPost);
  fallbackComments[newPost.post_id] = [];

  // Dual DB insert strategy (with & without author_role for compatibility)
  const sqlWithRole = 'INSERT INTO forum_posts (user_id, author_name, author_role, title, content, category) VALUES (?, ?, ?, ?, ?, ?)';
  const sqlStandard = 'INSERT INTO forum_posts (user_id, author_name, title, content, category) VALUES (?, ?, ?, ?, ?)';

  db.query(sqlWithRole, [newPost.user_id, newPost.author_name, newPost.author_role, title, content, newPost.category], (err, result) => {
    if (err) {
      db.query(sqlStandard, [newPost.user_id, newPost.author_name, title, content, newPost.category], (err2, result2) => {
        if (!err2 && result2) newPost.post_id = result2.insertId;
        return res.status(201).json({ message: 'Discussion topic posted successfully! 💬', post: newPost });
      });
    } else {
      if (result) newPost.post_id = result.insertId;
      return res.status(201).json({ message: 'Discussion topic posted successfully! 💬', post: newPost });
    }
  });
};

// 3. Get single post with all replies/comments
const getPostComments = (req, res) => {
  const { postId } = req.params;
  const pIdNum = parseInt(postId);

  db.query('SELECT * FROM forum_comments WHERE post_id = ? ORDER BY created_at ASC', [pIdNum], (err, results) => {
    if (err || !results || results.length === 0) {
      return res.status(200).json({ comments: fallbackComments[pIdNum] || [] });
    }
    res.status(200).json({ comments: results });
  });
};

// 4. Add reply/comment to discussion
const addComment = (req, res) => {
  const { post_id, user_id, author_name, author_role, content } = req.body;

  if (!post_id || !content) {
    return res.status(400).json({ message: 'Reply content cannot be empty!' });
  }

  const pIdNum = parseInt(post_id);
  const newComment = {
    comment_id: Date.now(),
    post_id: pIdNum,
    user_id: parseInt(user_id) || 1,
    author_name: author_name || 'Student',
    author_role: author_role || 'student',
    content,
    likes_count: 0,
    created_at: new Date()
  };

  if (!fallbackComments[pIdNum]) fallbackComments[pIdNum] = [];
  fallbackComments[pIdNum].push(newComment);

  const post = fallbackPosts.find(p => p.post_id === pIdNum);
  if (post) post.reply_count = (post.reply_count || 0) + 1;

  const sqlWithRole = 'INSERT INTO forum_comments (post_id, user_id, author_name, author_role, content) VALUES (?, ?, ?, ?, ?)';
  const sqlStandard = 'INSERT INTO forum_comments (post_id, user_id, author_name, content) VALUES (?, ?, ?, ?)';

  db.query(sqlWithRole, [pIdNum, newComment.user_id, newComment.author_name, newComment.author_role, content], (err, result) => {
    if (err) {
      db.query(sqlStandard, [pIdNum, newComment.user_id, newComment.author_name, content], (err2, result2) => {
        if (!err2 && result2) newComment.comment_id = result2.insertId;
        return res.status(201).json({ message: 'Reply submitted successfully! 💬', comment: newComment });
      });
    } else {
      if (result) newComment.comment_id = result.insertId;
      return res.status(201).json({ message: 'Reply submitted successfully! 💬', comment: newComment });
    }
  });
};

// 5. Like / Upvote post
const likePost = (req, res) => {
  const { postId } = req.params;
  const pIdNum = parseInt(postId);

  const post = fallbackPosts.find(p => p.post_id === pIdNum);
  if (post) post.likes_count = (post.likes_count || 0) + 1;

  db.query('UPDATE forum_posts SET likes_count = likes_count + 1 WHERE post_id = ?', [pIdNum], () => {
    res.status(200).json({ message: 'Discussion post upvoted! 👍' });
  });
};

// 6. Delete post (Author or Admin)
const deletePost = (req, res) => {
  const { postId } = req.params;
  const pIdNum = parseInt(postId);

  fallbackPosts = fallbackPosts.filter(p => p.post_id !== pIdNum);
  delete fallbackComments[pIdNum];

  db.query('DELETE FROM forum_posts WHERE post_id = ?', [pIdNum], () => {
    res.status(200).json({ message: 'Discussion post removed successfully! 🗑️' });
  });
};

// 7. Edit post (Author)
const editPost = (req, res) => {
  const { postId } = req.params;
  const { title, content, category } = req.body;
  const pIdNum = parseInt(postId);

  const post = fallbackPosts.find(p => p.post_id === pIdNum);
  if (post) {
    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;
  }

  db.query('UPDATE forum_posts SET title = ?, content = ?, category = ? WHERE post_id = ?', [title, content, category, pIdNum], () => {
    res.status(200).json({ message: 'Discussion post updated successfully! ✏️' });
  });
};

module.exports = {
  getPosts,
  createPost,
  getPostComments,
  addComment,
  likePost,
  deletePost,
  editPost
};
