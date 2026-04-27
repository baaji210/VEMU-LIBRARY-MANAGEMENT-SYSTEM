function admTab(tab, el) {
  setActive('adm-sb', el);
  var m = document.getElementById('adm-main');
  var fns = { dash: admDash, users: admUsers, books: admBooks, txns: admTxns, reports: admReports, backup: admBackup };
  m.innerHTML = (fns[tab] || admDash)();
}

function admDash() {
  var issued = DB.txns.filter(t => t.status !== 'returned').length;
  var overdue = DB.txns.filter(t => t.status === 'overdue').length;
  var totalFine = DB.txns.reduce((s, t) => s + t.fine, 0);
  return `<div class="pg-h">Admin Dashboard</div><div class="pg-s">Welcome back, ${curUser.name} · System Overview</div>
  ${overdue > 0 ? `<div class="alert-banner alert-danger"><div class="alert-icon">⚠️</div><div><strong>${overdue} books are overdue</strong> — immediate action required to collect fines.</div></div>` : ''}
  <div class="stat-row">
    <div class="sc navy"><div class="sc-val">${DB.books.length}</div><div class="sc-lbl">Total Books</div><div class="sc-trend up">▲ 2 this week</div></div>
    <div class="sc gold"><div class="sc-val">${DB.users.length}</div><div class="sc-lbl">Registered Users</div><div class="sc-trend up">▲ 1 new</div></div>
    <div class="sc green"><div class="sc-val">${issued}</div><div class="sc-lbl">Books Issued</div></div>
    <div class="sc red"><div class="sc-val">${overdue}</div><div class="sc-lbl">Overdue</div></div>
    <div class="sc teal"><div class="sc-val">₹${totalFine}</div><div class="sc-lbl">Fines Collected</div></div>
    <div class="sc purple"><div class="sc-val">${DB.recommendations.length}</div><div class="sc-lbl">Recommendations</div></div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
    <div class="card"><div class="card-hd"><div><div class="card-t">Recent Transactions</div><div class="card-sub">Latest library activity</div></div></div>
    <div class="tbl-wrap"><table><thead><tr><th>TX</th><th>Book</th><th>Member</th><th>Status</th></tr></thead><tbody>
    ${DB.txns.slice(-4).reverse().map(t => `<tr><td>${t.id}</td><td>${t.bookTitle.slice(0, 22)}…</td><td>${t.memberName}</td><td>${badge(t.status)}</td></tr>`).join('')}
    </tbody></table></div></div>
    <div class="card"><div class="card-hd"><div><div class="card-t">User Distribution</div></div></div>
    ${['student', 'faculty', 'librarian', 'admin'].map(r => { var cnt = DB.users.filter(u => u.role === r).length; return `<div class="due-warn" style="background:#f0f2f8;border-color:var(--border);color:var(--navy)"><span style="font-size:20px">${{ student: '🎓', faculty: '👨‍🏫', librarian: '📚', admin: '⚙️' }[r]}</span><span style="flex:1;font-weight:700;text-transform:capitalize">${r}s</span><span style="font-family:'Playfair Display',serif;font-size:22px;font-weight:700">${cnt}</span></div>` }).join('')}
    </div>
  </div>`;
}

function admUsers() {
  return `<div class="pg-h">User Accounts</div><div class="pg-s">Create, update and manage all user accounts</div>
  <div class="card">
    <div class="card-hd"><div class="card-t">All Users</div><button class="btn btn-g" onclick="openAddUser()">+ Add User</button></div>
    <div class="tabs" style="margin-bottom:12px"><button class="tab-btn on" onclick="filterUsers(this,'all')">All</button><button class="tab-btn" onclick="filterUsers(this,'student')">Students</button><button class="tab-btn" onclick="filterUsers(this,'faculty')">Faculty</button><button class="tab-btn" onclick="filterUsers(this,'librarian')">Librarians</button></div>
    <div id="stu-filters" style="display:none; gap:12px; margin-bottom:16px; padding:0 8px;">
      <select class="dfs" id="flt-yr" onchange="applyStuFilters()" style="width:160px;padding:8px;font-size:13px"><option value="">All Years</option><option value="1">1st Year</option><option value="2">2nd Year</option><option value="3">3rd Year</option><option value="4">4th Year</option></select>
      <select class="dfs" id="flt-dept" onchange="applyStuFilters()" style="width:200px;padding:8px;font-size:13px"><option value="">All Departments</option><option>ECE</option><option>EEE</option><option>ME</option><option>CE</option><option>AI</option><option>CSE</option><option>H&S</option><option>Pharmacy</option><option>MBA</option><option>MCA</option><option>Diploma</option></select>
    </div>
    <div class="tbl-wrap" id="usr-tbl" data-role="all">${renderUsers('all')}</div>
  </div>`;
}
function filterUsers(el, role) {
  document.querySelectorAll('#adm-main .tab-btn').forEach(b => b.classList.remove('on')); el.classList.add('on');
  document.getElementById('usr-tbl').setAttribute('data-role', role);
  var sf = document.getElementById('stu-filters');
  if (role === 'student') sf.style.display = 'flex'; else sf.style.display = 'none';
  applyStuFilters();
}
function applyStuFilters() {
  var role = document.getElementById('usr-tbl').getAttribute('data-role') || 'all';
  var yr = document.getElementById('flt-yr') ? document.getElementById('flt-yr').value : '';
  var dept = document.getElementById('flt-dept') ? document.getElementById('flt-dept').value : '';
  document.getElementById('usr-tbl').innerHTML = renderUsers(role, yr, dept);
}
function renderUsers(role, yr, dept) {
  var list = DB.users.filter(u => {
    if (role !== 'all' && u.role !== role) return false;
    if (role === 'student') {
      if (yr && u.year && u.year !== yr) return false;
      if (dept && u.dept && u.dept !== dept) return false;
    }
    return true;
  });
  if (!list.length) return `<div class="empty"><div class="empty-ic">👥</div><div class="empty-t">No users found.</div></div>`;
  return `<table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Dept/Details</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead><tbody>
  ${list.map(u => {
    var details = u.dept || '—';
    if (u.role === 'student' && (u.year || u.sec || u.roll || u.deg)) {
      var dStr = u.deg ? `${u.deg}` : '';
      var yStr = u.year ? `Yr ${u.year}` : '';
      var sStr = u.sec ? `Sec ${u.sec}` : '';
      var rStr = u.roll ? `${u.roll}` : '';
      var j = [dStr, rStr, yStr, sStr].filter(Boolean).join(' | ');
      details += j ? `<br><span style="font-size:11px;color:var(--text3);font-weight:500;">${j}</span>` : '';
    } else if (u.role !== 'student' && u.empId) {
      details += `<br><span style="font-size:11px;color:var(--text3);font-weight:500;">ID: ${u.empId}</span>`;
    }
    return `<tr><td>${u.id}</td><td><strong>${u.name}</strong></td><td>${u.email}</td><td>${badge(u.role)}</td><td>${details}</td><td>${u.joinDate || '—'}</td><td><span class="bdg ${u.active !== false ? 'b-green' : 'b-red'}">${u.active !== false ? 'Active' : 'Disabled'}</span></td><td style="display:flex;gap:6px">
    <button class="btn-sm" onclick="toggleUser('${u.id}')">${u.active !== false ? 'Disable' : 'Enable'}</button>
    <button class="btn-sm" onclick="openEditUser('${u.id}')">Edit</button>
    <button class="btn btn-r" style="padding:6px 10px;font-size:11px" onclick="delUser('${u.id}')">Del</button>
  </td></tr>`}).join('')}
  </tbody></table>`;
}
function openAddUser() {
  openModal(`<div class="modal-t">Add New User</div>
  <div class="dfg"><label class="dfl">Full Name</label><input class="dfi" id="au-n" placeholder="Name"></div>
  <div class="dfg"><label class="dfl">Email</label><input class="dfi" id="au-e" type="email" placeholder="email@example.com"></div>
  <div class="dfg"><label class="dfl">Role</label><select class="dfs" id="au-r"><option value="student">Student</option><option value="faculty">Faculty</option><option value="librarian">Librarian</option><option value="admin">Admin</option></select></div>
  <div class="dfg"><label class="dfl">Password</label><input class="dfi" id="au-p" type="password" placeholder="Password"></div>
  <div class="modal-ft"><button class="btn-cancel" onclick="closeModal()">Cancel</button><button class="btn btn-n" onclick="saveNewUser()">Create User</button></div>`);
}
async function saveNewUser() {
  var n = document.getElementById('au-n').value.trim();
  var e = document.getElementById('au-e').value.trim();
  var r = document.getElementById('au-r').value;
  var p = document.getElementById('au-p').value;
  if (!n || !e || !p) { alert('All fields required.'); return }
  if (DB.users.find(u => u.email === e)) { alert('Email already exists.'); return }
  DB.users.push({ id: 'M' + (100 + DB.users.length + 1), name: n, email: e, role: r, pass: p, joinDate: today(), active: true });
  await saveDB();
  closeModal(); admTab('users');
}
function openEditUser(id) {
  var u = DB.users.find(x => x.id === id); if (!u) return;
  openModal(`<div class="modal-t">Edit User</div>
  <div class="dfg"><label class="dfl">Full Name</label><input class="dfi" id="eu-n" value="${u.name}"></div>
  <div class="dfg"><label class="dfl">Role</label><select class="dfs" id="eu-r"><option ${u.role === 'student' ? 'selected' : ''}>student</option><option ${u.role === 'faculty' ? 'selected' : ''}>faculty</option><option ${u.role === 'librarian' ? 'selected' : ''}>librarian</option><option ${u.role === 'admin' ? 'selected' : ''}>admin</option></select></div>
  <div class="modal-ft"><button class="btn-cancel" onclick="closeModal()">Cancel</button><button class="btn btn-n" onclick="saveEditUser('${id}')">Save</button></div>`);
}
async function saveEditUser(id) {
  var u = DB.users.find(x => x.id === id); if (!u) return;
  u.name = document.getElementById('eu-n').value.trim() || u.name;
  u.role = document.getElementById('eu-r').value;
  await saveDB();
  closeModal(); admTab('users');
}
async function toggleUser(id) { var u = DB.users.find(x => x.id === id); if (u) { u.active = u.active === false ? true : false; await saveDB(); } admTab('users'); }
async function delUser(id) { if (confirm('Delete this user?')) { DB.users = DB.users.filter(u => u.id !== id); await saveDB(); admTab('users') } }

function admBooks() {
  return `<div class="pg-h">Book Management</div><div class="pg-s">Add, update, or delete books from the library collection</div>
  <div class="card">
    <div class="card-hd"><div class="card-t">All Books</div><button class="btn btn-g" onclick="openAddBook()">+ Add Book</button></div>
    <div class="sbar"><input class="sbar-i" id="ab-q" placeholder="Search title, author, ISBN…" oninput="filterBooksAdm()"><select class="sbar-s" id="ab-cat" onchange="filterBooksAdm()"><option value="">All Categories</option><option>ECE</option><option>EEE</option><option>ME</option><option>CE</option><option>AI</option><option>CSE</option><option>H&S</option><option>Pharmacy</option><option>MBA</option><option>MCA</option><option>Diploma</option></select></div>
    <div class="tbl-wrap" id="adm-bk-tbl">${renderBooksTable()}</div>
  </div>`;
}
function filterBooksAdm() { document.getElementById('adm-bk-tbl').innerHTML = renderBooksTable(document.getElementById('ab-q').value, document.getElementById('ab-cat').value) }
function renderBooksTable(q, cat) {
  var list = DB.books.filter(b => { var sq = (q || '').toLowerCase(); var c = cat || ''; return (!sq || (b.title.toLowerCase().includes(sq) || b.author.toLowerCase().includes(sq) || b.isbn.includes(sq))) && (!c || b.category === c) });
  if (!list.length) return `<div class="empty"><div class="empty-ic">📚</div><div class="empty-t">No books found.</div></div>`;
  return `<table><thead><tr><th>ID</th><th>Title</th><th>Author</th><th>Edition</th><th>Category</th><th>Qty</th><th>Available</th><th>Actions</th></tr></thead><tbody>
  ${list.map(b => `<tr><td>${b.id}</td><td><strong>${b.title}</strong></td><td>${b.author}</td><td>${b.edition || '—'}</td><td>${b.category}</td><td>${b.qty}</td><td>${avBadge(b.available, b.qty)}</td><td style="display:flex;gap:5px"><button class="btn-sm" onclick="openEditBook('${b.id}')">Edit</button><button class="btn btn-r" style="padding:6px 10px;font-size:11px" onclick="delBook('${b.id}')">Del</button></td></tr>`).join('')}
  </tbody></table>`;
}
function openAddBook() {
  openModal(`<div class="modal-t">Add New Book</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
    <div class="dfg"><label class="dfl">Title</label><input class="dfi" id="bk-t" placeholder="Book title"></div>
    <div class="dfg"><label class="dfl">Author</label><input class="dfi" id="bk-a" placeholder="Author name"></div>
    <div class="dfg"><label class="dfl">ISBN</label><input class="dfi" id="bk-i" placeholder="ISBN"></div>
    <div class="dfg"><label class="dfl">Edition</label><input class="dfi" id="bk-ed" placeholder="e.g. 4th"></div>
    <div class="dfg"><label class="dfl">Subject</label><input class="dfi" id="bk-sub" placeholder="Subject area"></div>
    <div class="dfg"><label class="dfl">Category</label><select class="dfs" id="bk-cat"><option>ECE</option><option>EEE</option><option>ME</option><option>CE</option><option>AI</option><option>CSE</option><option>H&S</option><option>Pharmacy</option><option>MBA</option><option>MCA</option><option>Diploma</option></select></div>
    <div class="dfg"><label class="dfl">Quantity</label><input class="dfi" type="number" id="bk-q" value="1" min="1"></div>
  </div>
  <div class="modal-ft"><button class="btn-cancel" onclick="closeModal()">Cancel</button><button class="btn btn-n" onclick="saveBook()">Add Book</button></div>`);
}
async function saveBook() {
  var t = document.getElementById('bk-t').value.trim(); var a = document.getElementById('bk-a').value.trim();
  if (!t || !a) { alert('Title and Author required.'); return }
  var q = parseInt(document.getElementById('bk-q').value) || 1;
  var idx = EMOJS[DB.books.length % EMOJS.length];
  DB.books.push({ id: 'B' + (100 + DB.books.length + 1), title: t, author: a, isbn: document.getElementById('bk-i').value.trim(), edition: document.getElementById('bk-ed').value.trim(), subject: document.getElementById('bk-sub').value.trim(), category: document.getElementById('bk-cat').value, qty: q, available: q, emoji: idx, addedDate: today() });
  await saveDB();
  closeModal(); 
  if (document.getElementById('lib-sb')) libTab('books', document.querySelectorAll('#lib-sb .sb-item')[1]);
  else admTab('books', document.querySelectorAll('#adm-sb .sb-item')[2]);
}
function openEditBook(id) {
  var b = DB.books.find(x => x.id === id); if (!b) return;
  openModal(`<div class="modal-t">Edit Book</div>
  <div class="dfg"><label class="dfl">Title</label><input class="dfi" id="eb-t" value="${b.title}"></div>
  <div class="dfg"><label class="dfl">Author</label><input class="dfi" id="eb-a" value="${b.author}"></div>
  <div class="dfg"><label class="dfl">Edition</label><input class="dfi" id="eb-ed" value="${b.edition || ''}"></div>
  <div class="dfg"><label class="dfl">Subject</label><input class="dfi" id="eb-sub" value="${b.subject || ''}"></div>
  <div class="dfg"><label class="dfl">Total Quantity</label><input class="dfi" type="number" id="eb-q" value="${b.qty}" min="1"></div>
  <div class="modal-ft"><button class="btn-cancel" onclick="closeModal()">Cancel</button><button class="btn btn-n" onclick="saveEditBook('${id}')">Save Changes</button></div>`);
}
async function saveEditBook(id) {
  var b = DB.books.find(x => x.id === id); if (!b) return;
  b.title = document.getElementById('eb-t').value.trim() || b.title;
  b.author = document.getElementById('eb-a').value.trim() || b.author;
  b.edition = document.getElementById('eb-ed').value.trim();
  b.subject = document.getElementById('eb-sub').value.trim();
  var nq = parseInt(document.getElementById('eb-q').value) || b.qty;
  b.available += nq - b.qty; b.qty = nq;
  await saveDB();
  closeModal();
  if (document.getElementById('lib-sb')) libTab('books', document.querySelectorAll('#lib-sb .sb-item')[1]);
  else admTab('books', document.querySelectorAll('#adm-sb .sb-item')[2]);
}
async function delBook(id) { 
  if (confirm('Delete this book from the library?')) { 
    DB.books = DB.books.filter(b => b.id !== id); 
    await saveDB(); 
    if (typeof curUser !== 'undefined' && curUser && curUser.role === 'librarian') {
      libTab('books', document.querySelectorAll('#lib-sb .sb-item')[1]);
    } else {
      admTab('books', document.querySelectorAll('#adm-sb .sb-item')[2]);
    }
  } 
}

function admTxns() {
  return `<div class="pg-h">All Transactions</div><div class="pg-s">Complete history of all book issues and returns</div>
  <div class="card"><div class="tbl-wrap"><table><thead><tr><th>TX ID</th><th>Book</th><th>Member</th><th>Role</th><th>Issued</th><th>Due</th><th>Returned</th><th>Fine</th><th>Status</th></tr></thead><tbody>
  ${DB.txns.map(t => `<tr><td>${t.id}</td><td>${t.bookTitle}</td><td>${t.memberName}</td><td>${badge(t.memberRole)}</td><td>${t.issueDate}</td><td>${t.dueDate}</td><td>${t.returnDate || '—'}</td><td style="font-weight:800;color:${t.fine > 0 ? 'var(--red)' : 'var(--green)'}">₹${t.fine}</td><td>${badge(t.status)}</td></tr>`).join('')}
  </tbody></table></div></div>`;
}

function admReports() {
  var issued = DB.txns.filter(t => t.status !== 'returned').length;
  var overdue = DB.txns.filter(t => t.status === 'overdue');
  var totalFine = DB.txns.reduce((s, t) => s + t.fine, 0);
  var byRole = DB.users.reduce((a, u) => { a[u.role] = (a[u.role] || 0) + 1; return a }, {});

  var pendingPayments = DB.payments.filter(p => p.status === 'pending');
  var completedPayments = DB.payments.filter(p => p.status === 'completed');

  var verifyHTML = pendingPayments.length > 0 ? `<div class="card" style="border:2px solid var(--blue);background:#f0f9ff"><div class="card-t" style="margin-bottom:16px;color:var(--navy)">🔔 Pending Online Payments Verification</div>
  <div class="tbl-wrap"><table><thead><tr><th>Student</th><th>Amount Paid</th><th>Transaction UTR</th><th>Date Submitted</th><th>Action</th></tr></thead><tbody>
  ${pendingPayments.map(p => `<tr><td><strong>${p.memberName}</strong><div style="font-size:11px;color:var(--text3)">${p.memberId}</div></td><td style="font-weight:800;color:var(--green)">₹${p.amount}</td><td><span class="bdg b-gray" style="font-family:monospace">${p.utr}</span></td><td>${p.date}</td><td><button class="btn btn-n" style="padding:6px 12px;font-size:12px" onclick="verifyAdmPayment('${p.id}')">Verify & Clear Fines</button></td></tr>`).join('')}
  </tbody></table></div></div>` : '';

  var successHtml = completedPayments.length > 0 ? `<div class="card"><div class="card-t" style="margin-bottom:16px">Verified Online Payments</div>
  <div class="tbl-wrap"><table><thead><tr><th>Student</th><th>Amount Paid</th><th>Transaction UTR</th><th>Date</th><th>Status</th></tr></thead><tbody>
  ${completedPayments.map(p => `<tr><td>${p.memberName}</td><td style="font-weight:800;color:var(--green)">₹${p.amount}</td><td><span class="bdg b-gray" style="font-family:monospace">${p.utr}</span></td><td>${p.date}</td><td><span class="bdg b-green">Completed</span></td></tr>`).join('')}
  </tbody></table></div></div>` : '';

  return `<div class="pg-h">Reports & Analytics</div><div class="pg-s">Comprehensive system-wide reports</div>
  <div class="stat-row">
    <div class="sc navy"><div class="sc-val">${DB.txns.length}</div><div class="sc-lbl">Total Transactions</div></div>
    <div class="sc green"><div class="sc-val">${issued}</div><div class="sc-lbl">Currently Issued</div></div>
    <div class="sc red"><div class="sc-val">${overdue.length}</div><div class="sc-lbl">Overdue</div></div>
    <div class="sc gold"><div class="sc-val">₹${totalFine}</div><div class="sc-lbl">Total Desk Fines</div></div>
  </div>
  ${verifyHTML}
  ${successHtml}
  <div class="card"><div class="card-hd"><div class="card-t">Overdue Books Report</div><button class="btn btn-g" onclick="alert('Report exported as PDF!')">Export PDF</button></div>
  ${overdue.length ? `<div class="tbl-wrap"><table><thead><tr><th>Book</th><th>Member</th><th>Due Date</th><th>Days Late</th><th>Fine</th></tr></thead><tbody>
  ${overdue.map(t => { var days = -daysLeft(t.dueDate); var fine = calcFine(t.dueDate); return `<tr><td>${t.bookTitle}</td><td>${t.memberName}</td><td>${t.dueDate}</td><td style="color:var(--red);font-weight:800">${days} days</td><td style="font-weight:800;color:var(--red)">₹${fine}</td></tr>` }).join('')}
  </tbody></table></div>`: `<div class="empty"><div class="empty-ic">✅</div><div class="empty-t">No overdue books currently!</div></div>`}
  </div>
  <div class="card"><div class="card-hd"><div class="card-t">User Summary by Role</div></div>
  <div class="tbl-wrap"><table><thead><tr><th>Role</th><th>Count</th><th>Active</th></tr></thead><tbody>
  ${['student', 'faculty', 'librarian', 'admin'].map(r => `<tr><td>${badge(r)}</td><td><strong>${byRole[r] || 0}</strong></td><td>${DB.users.filter(u => u.role === r && u.active !== false).length}</td></tr>`).join('')}
  </tbody></table></div></div>`;
}

async function verifyAdmPayment(pid) {
  var pay = DB.payments.find(p => p.id === pid);
  if (!pay) return;
  pay.status = 'completed';
  var myOverdue = DB.txns.filter(t => t.memberId === pay.memberId && t.status === 'overdue');
  myOverdue.forEach(t => {
    t.fine = calcFine(t.dueDate);
    t.status = 'returned';
    t.returnDate = today();
    var bk = DB.books.find(b => b.id === t.bookId);
    if (bk) bk.available++;
  });
  await saveDB();
  admTab('reports', document.querySelectorAll('#adm-sb .sb-item')[4]); // 4 or 5? It's reports
}

function admBackup() {
  return `<div class="pg-h">Backup & Restore</div><div class="pg-s">Database backup and restore management</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
    <div class="card">
      <div class="card-hd"><div><div class="card-t">💾 Backup Database</div><div class="card-sub">Export full system data</div></div></div>
      <p style="font-size:13.5px;color:var(--text2);margin-bottom:18px;line-height:1.7">Create a complete backup of all library records including books, users, transactions, and fines. Last backup: <strong>Today 09:30 AM</strong></p>
      <button class="btn btn-n" onclick="alert('Backup created: vemu_library_backup_'+new Date().toISOString().split('T')[0]+'.json')">Create Backup Now</button>
    </div>
    <div class="card">
      <div class="card-hd"><div><div class="card-t">🔄 Restore Database</div><div class="card-sub">Restore from backup file</div></div></div>
      <p style="font-size:13.5px;color:var(--text2);margin-bottom:18px;line-height:1.7">Restore the database from a previous backup file. Warning: This will overwrite all current data.</p>
      <button class="btn btn-g" onclick="alert('Select a backup file to restore.')">Select Backup File</button>
    </div>
  </div>
  <div class="card"><div class="card-hd"><div class="card-t">Backup History</div></div>
  <div class="tbl-wrap"><table><thead><tr><th>Backup Date</th><th>Size</th><th>Created By</th><th>Status</th></tr></thead><tbody>
    <tr><td>2025-04-01 09:30 AM</td><td>2.4 MB</td><td>Admin</td><td><span class="bdg b-green">Success</span></td></tr>
    <tr><td>2025-03-31 09:30 AM</td><td>2.3 MB</td><td>Admin</td><td><span class="bdg b-green">Success</span></td></tr>
    <tr><td>2025-03-30 09:30 AM</td><td>2.3 MB</td><td>System</td><td><span class="bdg b-green">Success</span></td></tr>
  </tbody></table></div></div>`;
}

