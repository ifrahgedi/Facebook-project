import './style.css'

// State Management
let appState = {
  currentUser: null,
  token: localStorage.getItem('fb_token') || null,
  posts: [],
  trendingPosts: [],
  navHistory: ['tab-home'],
  currentChatUser: null,
  selectedImage: null,
  selectedFeeling: null,
  editingPostId: null
};

const savedUser = localStorage.getItem('fb_username');
if (appState.token && savedUser) {
  appState.currentUser = savedUser;
}

function saveAuth(username, token) {
  appState.currentUser = username;
  appState.token = token;
  localStorage.setItem('fb_token', token);
  localStorage.setItem('fb_username', username);
}

function clearAuth() {
  appState.currentUser = null;
  appState.token = null;
  localStorage.removeItem('fb_token');
  localStorage.removeItem('fb_username');
}

function getAuthHeaders() {
  return { 'Authorization': `Bearer ${appState.token}`, 'Content-Type': 'application/json' };
}

// Global UI Interaction
document.addEventListener('click', (e) => {
    // Close plus dropdown if clicked outside
    const plusDropdown = document.getElementById('plus-dropdown');
    const plusBtn = document.getElementById('btn-plus-menu');
    if (plusDropdown && !plusDropdown.classList.contains('hidden') && !plusBtn.contains(e.target) && !plusDropdown.contains(e.target)) {
        plusDropdown.classList.add('hidden');
    }
    
    // Close all post dropdowns
    document.querySelectorAll('.post-action-dropdown').forEach(dropdown => {
        const trigger = document.querySelector(`.post-dropdown-trigger[data-id="${dropdown.dataset.id}"]`);
        if (trigger && !trigger.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });
});

// DOM Elements
const loginView = document.getElementById('login-view');
const mainView = document.getElementById('main-view');

// Login Elements
const loginFormContainer = document.getElementById('login-form-container');
const loginMobileEmail = document.getElementById('login-mobile-email');
const loginPassword = document.getElementById('login-password');
const btnLogin = document.getElementById('btn-login');
const loginError = document.getElementById('login-error');
const btnShowRegister = document.getElementById('btn-show-register');

// Register Elements
const registerFormContainer = document.getElementById('register-form-container');
const btnCancelRegister = document.getElementById('btn-cancel-register');
const regFirstname = document.getElementById('reg-firstname');
const regSurname = document.getElementById('reg-surname');
const regMobileEmail = document.getElementById('reg-mobile-email');
const regPassword = document.getElementById('reg-password');
const regDob = document.getElementById('reg-dob');
const btnSubmitRegister = document.getElementById('btn-submit-register');
const registerError = document.getElementById('register-error');

// Log Out
const btnLogout = document.getElementById('btn-logout');

// Navigation
const navTriggers = document.querySelectorAll('[data-target]');
const tabContents = document.querySelectorAll('.tab-content');
const btnPlusMenu = document.getElementById('btn-plus-menu');
const plusDropdown = document.getElementById('plus-dropdown');

// Profile Avatars
const postUserAvatar = document.getElementById('post-user-avatar');
const profilePageAvatar = document.getElementById('profile-page-avatar');
const profilePageName = document.getElementById('profile-page-name');
const hmbgAvatar = document.getElementById('hmbg-avatar');
const hmbgName = document.getElementById('hmbg-name');

// Post Create Elements
const postInput = document.getElementById('post-input');
const btnAddPhoto = document.getElementById('btn-add-photo');
const postImageInput = document.getElementById('post-image-input');
const postPreviewContainer = document.getElementById('post-preview-container');
const postPreviewImage = document.getElementById('post-preview-image');
const btnRemovePreview = document.getElementById('btn-remove-preview');
const btnSubmitPost = document.getElementById('btn-submit-post');
const postsStream = document.getElementById('posts-stream');
const feedsPostsStream = document.getElementById('feeds-posts-stream');

// Trending
const trendingContainer = document.getElementById('trending-container');
const trendingPostsStream = document.getElementById('trending-posts-stream');

// Post Edit Elements
const editPostModal = document.getElementById('edit-post-modal');
const btnCloseEdit = document.getElementById('btn-close-edit');
const editPostInput = document.getElementById('edit-post-input');
const editImageInput = document.getElementById('edit-image-input');
const btnEditPhoto = document.getElementById('btn-edit-photo');
const btnRemoveEditPreview = document.getElementById('btn-remove-edit-preview');
const editPreviewContainer = document.getElementById('edit-preview-container');
const editPreviewImage = document.getElementById('edit-preview-image');
const btnUpdatePost = document.getElementById('btn-update-post');

// Search Elements
const mainSearchInput = document.getElementById('main-search-input');
const btnExecuteSearch = document.getElementById('btn-execute-search');
const searchResultsList = document.getElementById('search-results-list');

// Chat & Friends Elements
const usersMessageList = document.getElementById('users-message-list');
const messagesListView = document.getElementById('messages-list-view');
const messagesChatView = document.getElementById('messages-chat-view');
const btnBackMessages = document.getElementById('btn-back-messages');
const chatOtherUser = document.getElementById('chat-other-user');
const chatHeaderAvatar = document.getElementById('chat-header-avatar');
const chatMessagesContainer = document.getElementById('chat-messages-container');
const chatInput = document.getElementById('chat-input');
const btnSendChat = document.getElementById('btn-send-chat');

const friendsListContainer = document.getElementById('friends-list-container');


// Initialize App
function init() {
  if (appState.currentUser && appState.token) {
    showMainFeed();
  } else {
    showLogin();
  }
}

function showLogin() {
  loginView.classList.remove('hidden');
  mainView.classList.add('hidden');
  loginError.style.display = 'none';
  registerError.style.display = 'none';
}

function showMainFeed() {
  loginView.classList.add('hidden');
  mainView.classList.remove('hidden');

  const initial = appState.currentUser.charAt(0).toUpperCase();
  if (postUserAvatar) postUserAvatar.textContent = initial;
  if (profilePageAvatar) profilePageAvatar.textContent = initial;
  if (profilePageName) profilePageName.textContent = appState.currentUser;
  if (hmbgAvatar) hmbgAvatar.textContent = initial;
  if (hmbgName) hmbgName.textContent = appState.currentUser;

  injectBackButtons();
  
  appState.navHistory = ['tab-home'];
  switchTab('tab-home');

  fetchPosts();
  fetchTrendingPosts();
  loadUsersForMessages();
  loadFriendSuggestions();
}

// Inject Back Buttons into inner pages dynamically
function injectBackButtons() {
    const innerTabs = ['tab-search', 'tab-groups', 'tab-pages', 'tab-saved', 'tab-events', 'tab-birthdays', 'tab-memories', 'tab-meta-ai', 'tab-meta-verified', 'tab-profile', 'tab-reels', 'tab-friends', 'tab-feeds'];
    innerTabs.forEach(tabId => {
        const tabEl = document.getElementById(tabId);
        if (!tabEl) return;
        const titleEls = tabEl.querySelectorAll('h2');
        if (titleEls.length > 0) {
            const titleEl = titleEls[0];
            // Only inject once
            if(!titleEl.querySelector('.btn-back-nav')) {
                titleEl.style.display = 'flex';
                titleEl.style.alignItems = 'center';
                
                const backBtn = document.createElement('button');
                backBtn.className = 'icon-btn-circle btn-back-nav';
                backBtn.style.marginRight = '12px';
                backBtn.style.background = 'transparent';
                backBtn.style.color = 'var(--fb-blue)';
                backBtn.innerHTML = '<ion-icon name="arrow-back" style="font-size:24px;"></ion-icon>';
                
                backBtn.onclick = (e) => {
                     e.stopPropagation();
                     // Pop current tab
                     if(appState.navHistory.length > 1) appState.navHistory.pop(); 
                     const prevTab = appState.navHistory[appState.navHistory.length - 1];
                     switchTab(prevTab, null, true); // true to avoid pushing to history again
                };
                
                titleEl.insertBefore(backBtn, titleEl.firstChild);
            }
        }
    });
}

// View Toggles
btnShowRegister.onclick = () => {
    loginFormContainer.classList.add('hidden');
    registerFormContainer.classList.remove('hidden');
};

btnCancelRegister.onclick = (e) => {
    e.preventDefault();
    registerFormContainer.classList.add('hidden');
    loginFormContainer.classList.remove('hidden');
};


// Auth Logic
btnLogin.addEventListener('click', async () => {
    const mobile_or_email = loginMobileEmail.value.trim();
    const password = loginPassword.value.trim();
    if (!mobile_or_email || !password) return (loginError.textContent = "Please enter login details", loginError.style.display = 'block');
  
    try {
      const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mobile_or_email, password }) });
      const data = await res.json();
      if (res.ok) { 
        saveAuth(data.username, data.token); 
        loginMobileEmail.value = ''; 
        loginPassword.value = ''; 
        showMainFeed(); 
      } else { 
        loginError.textContent = data.error; loginError.style.display = 'block'; 
      }
    } catch (e) { loginError.textContent = "Connection error"; loginError.style.display = 'block'; }
});

btnSubmitRegister.addEventListener('click', async () => {
    const first_name = regFirstname.value.trim();
    const surname = regSurname.value.trim();
    const mobile_or_email = regMobileEmail.value.trim();
    const dob = regDob.value;
    const password = regPassword.value.trim();
    const genderEl = document.querySelector('input[name="reg-gender"]:checked');
    const gender = genderEl ? genderEl.value : '';

    if (!first_name || !surname || !mobile_or_email || !password) {
        registerError.textContent = "Please fill in all required fields"; registerError.style.display = 'block';
        return;
    }

    try {
        const payload = { first_name, surname, mobile_or_email, dob, gender, password };
        const res = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await res.json();
        if (res.ok) { 
            loginMobileEmail.value = mobile_or_email;
            loginPassword.value = password;
            btnLogin.click(); // Auto login
        } else { 
             registerError.textContent = data.error; registerError.style.display = 'block';
        }
    } catch (e) { registerError.textContent = "Connection error"; registerError.style.display = 'block'; }
});

btnLogout.addEventListener('click', () => { clearAuth(); showLogin(); });

// Search Logic
if (mainSearchInput) {
    mainSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') executeSearch();
    });
}
if (btnExecuteSearch) {
    btnExecuteSearch.addEventListener('click', executeSearch);
}
const searchNavBtn = document.getElementById('btn-search-nav');
if (searchNavBtn) {
    searchNavBtn.addEventListener('click', () => {
        // Just open the Search tab
        const q = mainSearchInput?.value.trim() || '';
        if (q) executeSearch(); 
    });
}
async function executeSearch() {
    const q = mainSearchInput.value.trim();
    if (!q) return;
    
    switchTab('tab-search');
    searchResultsList.innerHTML = '<p style="padding:16px;">Searching...</p>';
    
    try {
        const res = await fetch(`/api/search/users?q=${encodeURIComponent(q)}`, { headers: getAuthHeaders() });
        const data = await res.json();
        searchResultsList.innerHTML = '';
        if (data.users && data.users.length > 0) {
            data.users.forEach(u => {
                const div = document.createElement('div');
                div.className = 'friend-item';
                div.innerHTML = `
                    <div class="user-avatar" style="background:#1877f2">${u.charAt(0).toUpperCase()}</div>
                    <div class="friend-info"><h4>${u}</h4><p>Click to message</p></div>
                `;
                div.onclick = () => {
                    switchTab('tab-messages');
                    openChat(u);
                };
                searchResultsList.appendChild(div);
            });
        } else {
            searchResultsList.innerHTML = '<p style="padding:16px;">No users found.</p>';
        }
    } catch(err) { searchResultsList.innerHTML = '<p style="padding:16px;">Error searching.</p>'; }
}


// Navigation Logic
btnPlusMenu.onclick = (e) => {
    e.stopPropagation();
    plusDropdown.classList.toggle('hidden');
};

navTriggers.forEach(trigger => {
  trigger.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent dropdown auto-close
    const targetId = trigger.getAttribute('data-target');
    switchTab(targetId, trigger);
    
    if (targetId === 'tab-messages' && !appState.currentChatUser) {
        loadUsersForMessages();
    }
    if (targetId === 'tab-friends') {
        loadFriendSuggestions();
    }
    
    // Auto close plus menu if changing tabs
    plusDropdown.classList.add('hidden');
  });
});

function switchTab(targetId, activeTrigger = null, isBackAction = false) {
  // Navigation Tracker Push
  if (!isBackAction) {
      if (appState.navHistory[appState.navHistory.length - 1] !== targetId) {
          appState.navHistory.push(targetId);
      }
  }

  tabContents.forEach(tab => tab.classList.add('hidden'));
  const targetTab = document.getElementById(targetId);
  if (targetTab) {
    targetTab.classList.remove('hidden');
    window.scrollTo(0, 0);
  }

  // Handle active styling
  let currentTrigger = activeTrigger;
  if (!currentTrigger) currentTrigger = document.querySelector(`[data-target="${targetId}"]`);
  
  if (currentTrigger && currentTrigger.classList.contains('nav-icon')) {
      document.querySelectorAll('.nav-icon').forEach(t => t.classList.remove('active'));
      currentTrigger.classList.add('active');
  } else if (!currentTrigger) {
      const homeBtn = document.querySelector('[data-target="tab-home"]');
      if (homeBtn && targetId === 'tab-home') {
          document.querySelectorAll('.nav-icon').forEach(t => t.classList.remove('active'));
           homeBtn.classList.add('active');
      } else if (targetId !== 'tab-search') {
          // Inner page active (remove active line from tabs)
          document.querySelectorAll('.nav-icon').forEach(t => t.classList.remove('active'));
      }
  }
}

// Create Post Logic
async function submitPost() {
    const content = postInput.value.trim();
    if (!content && !appState.selectedImage) return;

    try {
        const res = await fetch('/api/posts', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ 
                content, 
                image: appState.selectedImage,
                feeling: appState.selectedFeeling
            })
        });
        const data = await res.json();
        if (res.ok && data.post) {
            appState.posts.unshift(data.post);
            postInput.value = '';
            removePostPreview();
            btnSubmitPost.classList.add('hidden');
            renderPosts();
        }
    } catch(e) { console.error("Error creating post"); }
}

btnSubmitPost.onclick = submitPost;

postInput.addEventListener('input', () => {
    if (postInput.value.trim() || appState.selectedImage) {
        btnSubmitPost.classList.remove('hidden');
    } else {
        btnSubmitPost.classList.add('hidden');
    }
});

btnAddPhoto.onclick = () => postImageInput.click();

postImageInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            appState.selectedImage = event.target.result;
            postPreviewImage.src = appState.selectedImage;
            postPreviewContainer.classList.remove('hidden');
            btnSubmitPost.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
};

function removePostPreview() {
    appState.selectedImage = null;
    postPreviewContainer.classList.add('hidden');
    postPreviewImage.src = '';
    postImageInput.value = '';
}
btnRemovePreview.onclick = removePostPreview;

// Fetch External Posts
async function fetchPosts() {
  try {
    const res = await fetch('/api/posts', { headers: getAuthHeaders() });
    if (res.status === 401 || res.status === 403) { clearAuth(); showLogin(); return; }
    const data = await res.json();
    if (data.posts) { appState.posts = data.posts; renderPosts(); }
  } catch(e) { console.error("Failed fetching posts", e); }
}

async function fetchTrendingPosts() {
  try {
    const res = await fetch('/api/posts/trending', { headers: getAuthHeaders() });
    const data = await res.json();
    if (data.posts && data.posts.length > 0) { 
        appState.trendingPosts = data.posts; 
        if (trendingContainer) trendingContainer.style.display = 'block';
        renderTrendingPosts(); 
    }
  } catch(e) { console.error("Failed fetching trending posts", e); }
}

// Delete & Edit Post
async function deletePost(postId) {
    if(!confirm("Are you sure you want to delete this post?")) return;
    try {
        const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE', headers: getAuthHeaders() });
        if(res.ok) {
            appState.posts = appState.posts.filter(p => p.id !== postId);
            renderPosts();
            fetchTrendingPosts(); // Refresh trending
        } else {
            alert("Could not delete post");
        }
    } catch(e) { console.error(e); }
}

function openEditModal(post) {
    appState.editingPostId = post.id;
    editPostInput.value = post.content || '';
    if (post.image) {
        editPreviewImage.src = post.image;
        editPreviewContainer.classList.remove('hidden');
    } else {
        editPreviewImage.src = '';
        editPreviewContainer.classList.add('hidden');
    }
    editPostModal.classList.remove('hidden');
}

btnCloseEdit.onclick = () => {
    editPostModal.classList.add('hidden');
    appState.editingPostId = null;
    editImageInput.value = '';
};

btnEditPhoto.onclick = () => editImageInput.click();
editImageInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
            editPreviewImage.src = evt.target.result;
            editPreviewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
};

btnRemoveEditPreview.onclick = () => {
    editPreviewImage.src = '';
    editImageInput.value = '';
    editPreviewContainer.classList.add('hidden');
};

btnUpdatePost.addEventListener('click', async () => {
    if (!appState.editingPostId) return;
    
    // We check if the image was removed (hidden container or no src)
    let newImage = editPreviewContainer.classList.contains('hidden') ? null : editPreviewImage.src;
    
    // If the image is the same from before or updated via file reader
    const content = editPostInput.value.trim();

    try {
        const res = await fetch(`/api/posts/${appState.editingPostId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ content, image: newImage })
        });
        const data = await res.json();
        if (res.ok && data.post) {
            // Update local state
            const index = appState.posts.findIndex(p => p.id === appState.editingPostId);
            if (index > -1) {
                appState.posts[index].content = data.post.content;
                appState.posts[index].image = data.post.image;
            }
            editPostModal.classList.add('hidden');
            renderPosts();
            fetchTrendingPosts();
        } else {
            alert("Could not update post");
        }
    } catch(e) { console.error(e); }
});

// Like Logic
async function toggleLike(postId) {
  try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST', headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) {
          // Update Regular
          const post = appState.posts.find(p => p.id === postId);
          if (post) {
             post.isLiked = data.liked;
             post.likes += data.liked ? 1 : -1;
             renderPosts(); 
          }
          // Update Trending UI concurrently
          fetchTrendingPosts();
      }
  } catch(e) { console.error("Error toggling like"); }
}

// Comment Logic
async function loadComments(postId, container) {
    container.innerHTML = '<p style="font-size:12px; color:var(--text-secondary)">Loading...</p>';
    try {
        const res = await fetch(`/api/posts/${postId}/comments`, { headers: getAuthHeaders() });
        const data = await res.json();
        container.innerHTML = '';
        if (data.comments && data.comments.length > 0) {
            data.comments.forEach(c => {
                const commentDiv = document.createElement('div');
                commentDiv.className = 'comment-item';
                
                let deleteHtml = '';
                if (c.username === appState.currentUser) {
                    deleteHtml = `<button class="btn-delete-comment" data-id="${c.id}" style="background:transparent; border:none; color:var(--danger-color); cursor:pointer; font-size:16px; margin-left:8px; opacity: 0.7;"><ion-icon name="trash"></ion-icon></button>`;
                }

                commentDiv.innerHTML = `
                    <div class="user-avatar" style="width:32px; height:32px; font-size:14px; margin-right:8px;">${c.usernameInitial}</div>
                    <div style="flex:1; display:flex; align-items:center;">
                        <div class="comment-bubble">
                            <div class="comment-author">${escapeHTML(c.username)}</div>
                            <div class="comment-text">${escapeHTML(c.content)}</div>
                        </div>
                        ${deleteHtml}
                    </div>
                `;
                
                if (c.username === appState.currentUser) {
                    commentDiv.querySelector('.btn-delete-comment').onclick = () => deleteComment(postId, c.id, container);
                }

                container.appendChild(commentDiv);
            });
        }
    } catch(e) { container.innerHTML = '<p>Error.</p>'; }
}

async function submitComment(postId, inputEl, listContainer) {
    const text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';
    try {
        const res = await fetch(`/api/posts/${postId}/comments`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ content: text }) });
        if (res.ok) loadComments(postId, listContainer);
    } catch(e) { console.error(e); }
}

async function deleteComment(postId, commentId, listContainer) {
    if(!confirm("Delete this comment?")) return;
    try {
        const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, { method: 'DELETE', headers: getAuthHeaders() });
        if (res.ok) loadComments(postId, listContainer);
    } catch(e) { console.error(e); }
}

// Reusable Post Creation UI Logic
function createPostElement(post, isTrending = false) {
    const postEl = document.createElement('div');
    postEl.className = 'card post';
    const likeClass = post.isLiked ? 'liked' : '';
    const likeIconSolid = post.isLiked ? 'thumbs-up' : 'thumbs-up-outline';
    
    let imageHtml = post.image ? `<img src="${post.image}" class="post-image" alt="Post photo" />` : '';
    
    // Edit/Delete logic (Disable on trending to avoid UI conflicts simply)
    let actionMenuHtml = '';
    if (!isTrending && post.author === appState.currentUser) {
        actionMenuHtml = `
            <button class="post-dropdown-trigger" data-id="${post.id}" style="background:transparent; border:none; color:var(--text-secondary); cursor:pointer; font-size:20px; padding:4px;"><ion-icon name="ellipsis-horizontal"></ion-icon></button>
            <div id="action-dropdown-${post.id}" class="post-action-dropdown hidden" data-id="${post.id}">
                <div class="post-dropdown-item btn-edit-post" data-id="${post.id}"><ion-icon name="pencil-outline"></ion-icon> Edit</div>
                <div class="post-dropdown-item btn-delete-post" data-id="${post.id}" style="color:var(--danger-color);"><ion-icon name="trash-outline"></ion-icon> Delete</div>
            </div>
        `;
    }

    const uniqueIdModifier = isTrending ? 'trending-' : '';

    postEl.innerHTML = `
      <div class="post-header" style="justify-content:space-between;">
        <div style="display:flex; align-items:center;">
            <div class="user-avatar" style="font-size: 16px;">${post.authorInitial}</div>
            <div class="post-header-info">
              <div class="post-author">${escapeHTML(post.author)}</div>
              <div class="post-time">${post.time} <ion-icon name="earth"></ion-icon> ${isTrending ? '• <strong style="color:var(--fb-blue);">Trending</strong>' : ''}</div>
            </div>
        </div>
        ${actionMenuHtml}
      </div>
      <div class="post-body">${escapeHTML(post.content)}</div>
      ${imageHtml}
      <div class="post-stats" style="display:flex; justify-content:space-between; align-items:center;">
        <div class="like-count-display"><ion-icon name="thumbs-up"></ion-icon><span class="like-count">${post.likes}</span></div>
        ${post.comments > 0 ? `<div class="comment-count-display" style="font-size:14px; color:var(--text-secondary); cursor:pointer;">${post.comments} comment${post.comments === 1 ? '' : 's'}</div>` : ''}
      </div>
      <div class="post-actions">
        <button class="action-btn like-btn ${likeClass}"><ion-icon name="${likeIconSolid}"></ion-icon><span>Like</span></button>
        <button class="action-btn comment-btn"><ion-icon name="chatbubble-outline"></ion-icon><span>Comment</span></button>
        <button class="action-btn"><ion-icon name="arrow-redo-outline"></ion-icon><span>Share</span></button>
      </div>
      <div class="comments-section hidden" id="comments-section-${uniqueIdModifier}${post.id}">
          <div class="comments-list" id="comments-list-${uniqueIdModifier}${post.id}"></div>
          <div class="comment-input-area">
             <div class="user-avatar" style="width:32px; height:32px; font-size:14px; margin-right:8px;">${appState.currentUser ? appState.currentUser.charAt(0).toUpperCase() : '?'}</div>
             <input type="text" class="comment-input" id="comment-input-${uniqueIdModifier}${post.id}" placeholder="Write a comment..." />
          </div>
      </div>
    `;

    // Bindings
    postEl.querySelector('.like-btn').onclick = () => toggleLike(post.id);
    
    const commentSection = postEl.querySelector(`#comments-section-${uniqueIdModifier}${post.id}`);
    const commentsList = postEl.querySelector(`#comments-list-${uniqueIdModifier}${post.id}`);
    const commentInput = postEl.querySelector(`#comment-input-${uniqueIdModifier}${post.id}`);
    postEl.querySelector('.comment-btn').onclick = () => {
        commentSection.classList.toggle('hidden');
        if (!commentSection.classList.contains('hidden')) { loadComments(post.id, commentsList); commentInput.focus(); }
    };
    commentInput.onkeypress = (e) => { if (e.key === 'Enter') submitComment(post.id, commentInput, commentsList); };

    // Dropdown bindings
    if (!isTrending && post.author === appState.currentUser) {
        const trigger = postEl.querySelector(`.post-dropdown-trigger`);
        const dropdown = postEl.querySelector(`#action-dropdown-${post.id}`);
        trigger.onclick = (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
        };
        postEl.querySelector('.btn-delete-post').onclick = (e) => {
            e.stopPropagation();
            deletePost(post.id);
        };
        postEl.querySelector('.btn-edit-post').onclick = (e) => {
            e.stopPropagation();
            dropdown.classList.add('hidden');
            openEditModal(post);
        };
    }

    return postEl;
}

// Render Feeds
function renderPosts() {
  postsStream.innerHTML = '';
  if (feedsPostsStream) feedsPostsStream.innerHTML = '';
  appState.posts.forEach(post => {
      postsStream.appendChild(createPostElement(post, false));
      if (feedsPostsStream) feedsPostsStream.appendChild(createPostElement(post, false));
  });
}

function renderTrendingPosts() {
  if(!trendingPostsStream) return;
  trendingPostsStream.innerHTML = '';
  appState.trendingPosts.forEach(post => {
      trendingPostsStream.appendChild(createPostElement(post, true));
  });
}

// Chat system
async function loadUsersForMessages() {
    try {
        const res = await fetch('/api/users', { headers: getAuthHeaders() });
        const data = await res.json();
        if(usersMessageList) usersMessageList.innerHTML = '';
        if (data.users && data.users.length > 0) {
            data.users.forEach(u => {
                const div = document.createElement('div');
                div.className = 'friend-item';
                div.innerHTML = `
                  <div class="user-avatar" style="background:#54C7EC">${u.charAt(0).toUpperCase()}</div>
                  <div class="friend-info"><h4>${u}</h4><p>Tap to chat</p></div>
                `;
                div.addEventListener('click', () => openChat(u));
                if(usersMessageList) usersMessageList.appendChild(div);
            });
        }
    } catch (e) { console.error(e); }
}

async function openChat(username) {
    appState.currentChatUser = username;
    messagesListView.classList.add('hidden');
    messagesChatView.classList.remove('hidden');
    chatOtherUser.textContent = username;
    chatHeaderAvatar.textContent = username.charAt(0).toUpperCase();
    await fetchChatMessages();
}

if(btnBackMessages) btnBackMessages.addEventListener('click', () => {
    appState.currentChatUser = null;
    messagesChatView.classList.add('hidden');
    messagesListView.classList.remove('hidden');
    loadUsersForMessages();
});

if(btnSendChat) btnSendChat.addEventListener('click', sendChatMessage);
if(chatInput) chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendChatMessage(); });

async function sendChatMessage() {
    const text = chatInput.value.trim();
    if (!text || !appState.currentChatUser) return;
    chatInput.value = '';
    appendChatBubble(text, true);
    
    try {
        await fetch(`/api/messages/${appState.currentChatUser}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ content: text })
        });
    } catch(e) {}
}

async function fetchChatMessages() {
    if (!appState.currentChatUser) return;
    try {
        const res = await fetch(`/api/messages/${appState.currentChatUser}`, { headers: getAuthHeaders() });
        const data = await res.json();
        chatMessagesContainer.innerHTML = '';
        if (data.messages && data.messages.length > 0) {
            data.messages.forEach(m => {
                const isMe = m.sender_username === appState.currentUser;
                appendChatBubble(m.content, isMe);
            });
        }
    } catch(err) {}
}

function appendChatBubble(text, isMe) {
    const div = document.createElement('div');
    div.className = isMe ? 'chat-bubble-me' : 'chat-bubble-them';
    div.innerText = text;
    chatMessagesContainer.appendChild(div);
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

// Friends
async function loadFriendSuggestions() {
    try {
        const [usersRes, friendsRes] = await Promise.all([
            fetch('/api/users', { headers: getAuthHeaders() }),
            fetch('/api/friends', { headers: getAuthHeaders() })
        ]);
        const usersData = await usersRes.json();
        const friendsData = await friendsRes.json();
        
        if (friendsListContainer) friendsListContainer.innerHTML = '';
        const friendSet = new Set(friendsData.friends);
        const suggestions = usersData.users.filter(u => !friendSet.has(u));
        
        if (suggestions.length > 0) {
            suggestions.forEach(u => {
                const div = document.createElement('div');
                div.className = 'friend-item';
                div.innerHTML = `
                    <div class="user-avatar" style="background:#1877F2">${u.charAt(0).toUpperCase()}</div>
                    <div class="friend-info"><h4>${u}</h4><p>Suggested Friend</p></div>
                    <button class="btn btn-primary btn-add-friend" data-user="${u}" style="padding: 8px 12px; font-size: 14px">Add Friend</button>
                `;
                div.querySelector('.btn-add-friend').onclick = (e) => addFriend(u, e.target);
                if(friendsListContainer) friendsListContainer.appendChild(div);
            });
        }
    } catch (e) {}
}

async function addFriend(username, button) {
    try {
        const res = await fetch(`/api/friends/${username}`, { method: 'POST', headers: getAuthHeaders() });
        if (res.ok) {
            button.innerText = 'Friends';
            button.classList.remove('btn-primary');
            button.style.background = 'var(--hover-overlay)';
            button.style.color = 'var(--text-primary)';
            button.disabled = true;
        }
    } catch (e) {}
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.innerText = str;
  return div.innerHTML;
}

init();
