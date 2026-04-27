        function libTab(tab, el) {
            setActive('lib-sb', el);
            var m = document.getElementById('lib-main');
            var fns = { dash: libDash, books: libBooks, issue: libIssue, return: libReturn, members: libMembers, fines: libFines, ireport: libIReport, recommend: libRecommend, requests: libRequests };
            m.innerHTML = (fns[tab] || libDash)();
        }
        function libDash() {
            var issued = DB.txns.filter(t => t.status !== 'returned').length;
            var overdue = DB.txns.filter(t => t.status === 'overdue');
            return `<div class="pg-h">Librarian Dashboard</div><div class="pg-s">Daily operations overview</div>
  ${overdue.length > 0 ? `<div class="alert-banner alert-danger"><div class="alert-icon">🔔</div><strong>${overdue.length} overdue book${overdue.length > 1 ? 's' : ''}</strong> — Fine collection pending: ₹${overdue.reduce((s, t) => s + calcFine(t.dueDate), 0)}</div>` : ''}
  <div class="stat-row">
    <div class="sc navy"><div class="sc-val">${DB.books.reduce((s, b) => s + b.available, 0)}</div><div class="sc-lbl">Books Available</div></div>
    <div class="sc gold"><div class="sc-val">${issued}</div><div class="sc-lbl">Currently Issued</div></div>
    <div class="sc red"><div class="sc-val">${overdue.length}</div><div class="sc-lbl">Overdue</div></div>
    <div class="sc green"><div class="sc-val">${DB.users.filter(u => u.role === 'student').length}</div><div class="sc-lbl">Students</div></div>
  </div>
  <div class="dash-grid-2">
    <div class="card"><div class="card-hd"><div class="card-t">Active Transactions</div></div>
    <div class="tbl-wrap"><table><thead><tr><th>Book</th><th>Member</th><th>Issued</th><th>Due</th><th>Days Left</th><th>Status</th></tr></thead><tbody>
    ${DB.txns.filter(t => t.status !== 'returned').slice().reverse().map(t => { var dl = daysLeft(t.dueDate); return `<tr><td>${t.bookTitle}</td><td>${t.memberName}</td><td>${t.issueDate}</td><td>${t.dueDate}</td><td style="font-weight:800;color:${dl < 0 ? 'var(--red)' : dl <= 3 ? 'var(--orange)' : 'var(--green)'}">${dl < 0 ? 'OVERDUE' : dl + ' days'}</td><td>${badge(t.status)}</td></tr>` }).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--text3)">No active transactions</td></tr>'}
    </tbody></table></div></div>
    <div class="card">
      <div class="card-hd"><div class="card-t">Quick Actions</div></div>
      <div style="display:flex;flex-direction:column;gap:12px;padding:10px 0">
        <button class="btn btn-n" style="width:100%;padding:12px" onclick="libTab('issue', document.querySelectorAll('#lib-sb .sb-item')[2])">➕ Issue New Book</button>
        <button class="btn btn-g" style="width:100%;padding:12px" onclick="libTab('requests', document.querySelectorAll('#lib-sb .sb-item')[4])">📬 Process Book Requests (${DB.requests.filter(r => r.status === 'pending').length})</button>
        <button class="btn btn-b" style="width:100%;padding:12px" onclick="libTab('books', document.querySelectorAll('#lib-sb .sb-item')[1])">📚 Manage Catalogue</button>
      </div>
    </div>
  </div>`;
        }
        function libBooks() {
            return `<div class="pg-h">Book Management</div><div class="pg-s">Add, edit, update, or remove books</div>
  <div class="card">
    <div class="card-hd"><div class="card-t">Library Catalogue</div><button class="btn btn-g" onclick="openAddBook()">+ Add Book</button></div>
    <div class="sbar"><input class="sbar-i" id="lb-q" placeholder="Search by title, author, ISBN, subject…" oninput="filterLibBooks()"><select class="sbar-s" id="lb-cat" onchange="filterLibBooks()"><option value="">All Categories</option><option>ECE</option><option>EEE</option><option>ME</option><option>CE</option><option>AI</option><option>CSE</option><option>H&S</option><option>Pharmacy</option><option>MBA</option><option>MCA</option><option>Diploma</option></select></div>
    <div class="tbl-wrap" id="lb-tbl">${renderBooksTable()}</div>
  </div>`;
        }
        function filterLibBooks() { document.getElementById('lb-tbl').innerHTML = renderBooksTable(document.getElementById('lb-q').value, document.getElementById('lb-cat').value) }
        function libIssue() {
            var students = DB.users.filter(u => (u.role === 'student' || u.role === 'faculty') && u.active !== false);
            var avBks = DB.books.filter(b => b.available > 0);
            var reqs = DB.requests.filter(r => r.status === 'pending');
            
            // Highlight members with requests
            var memIdsWithReqs = new Set(reqs.map(r => r.memberId));
            students.sort((a, b) => {
                var aHas = memIdsWithReqs.has(a.id) ? 1 : 0;
                var bHas = memIdsWithReqs.has(b.id) ? 1 : 0;
                if (aHas !== bHas) return bHas - aHas;
                return a.name.localeCompare(b.name);
            });

            return `<div class="pg-h">Issue Book</div><div class="pg-s">Issue books to students and faculty members</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start">
    <div class="card">
      <div class="card-hd"><div class="card-t">Manual Issue</div></div>
      <div id="is-e" class="msg-e"></div><div id="is-s" class="msg-s"></div>
      <div class="dfg"><label class="dfl">Select Member</label><select class="dfs" id="is-mem" onchange="handleMemberSelect()"><option value="">— Choose Member —</option>${students.map(s => {
          var isReq = memIdsWithReqs.has(s.id);
          return `<option value="${s.id}" ${isReq ? 'style="font-weight:bold; color:var(--blue)"' : ''}>${s.name} (${s.role} · ${s.id})${isReq ? ' [BOOK REQUESTED]' : ''}</option>`;
      }).join('')}</select></div>
      <div class="dfg"><label class="dfl">Select Book</label><select class="dfs" id="is-bk"><option value="">— Choose Book —</option>${avBks.map(b => `<option value="${b.id}">${b.title} by ${b.author} (${b.available} available)</option>`).join('')}</select></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="dfg"><label class="dfl">Issue Date</label><input class="dfi" type="date" id="is-dt" value="${today()}"></div>
        <div class="dfg"><label class="dfl">Due Date</label><input class="dfi" type="date" id="is-due" value="${dueDate(14)}"></div>
      </div>
      <div class="alert-banner alert-info" style="margin-bottom:16px;font-size:12px">ℹ️ Faculty: 60 days. Students: 14 days.</div>
      <button class="btn btn-g" style="width:100%;padding:13px" onclick="doIssue()">Issue Book →</button>
    </div>
    
    <div class="card">
      <div class="card-hd"><div class="card-t">Pending Requests</div></div>
      <p class="pg-s" style="margin-bottom:12px">Click "Accept & Issue" to quickly fulfill a student's request.</p>
      <div class="tbl-wrap">
        ${reqs.length ? `<table><thead><tr><th>Student</th><th>Book</th><th>Action</th></tr></thead><tbody>
        ${reqs.map(r => `<tr><td><strong>${r.memberName}</strong><div style="font-size:11px;color:var(--text3)">${r.memberId}</div></td><td>${r.bookTitle}</td><td><button class="btn btn-n" style="padding:6px 10px;font-size:11px" onclick="libApproveReq('${r.id}')">Issue</button></td></tr>`).join('')}
        </tbody></table>` : `<div class="empty"><div class="empty-ic" style="font-size:24px">📬</div><div class="empty-t">No pending requests.</div></div>`}
      </div>
    </div>
  </div>`;
        }
        function handleMemberSelect() {
            var mId = document.getElementById('is-mem').value;
            var bkSelect = document.getElementById('is-bk');
            if (!mId) { bkSelect.value = ''; return; }
            var req = DB.requests.find(r => r.memberId === mId && r.status === 'pending');
            if (req) {
                bkSelect.value = req.bookId;
                showS('is-s', `Auto-selected requested book: ${req.bookTitle}`);
            } else {
                bkSelect.value = '';
                var s = document.getElementById('is-s');
                if(s) { s.textContent = ''; s.style.display = 'none'; }
            }
        }
        async function doIssue() {
            var mId = document.getElementById('is-mem').value; var bId = document.getElementById('is-bk').value;
            var iDt = document.getElementById('is-dt').value; var dDt = document.getElementById('is-due').value;
            if (!mId || !bId) { showE('is-e', 'Please select member and book.'); return }
            var mem = DB.users.find(u => u.id === mId); var bk = DB.books.find(b => b.id === bId);
            if (!bk || bk.available < 1) { showE('is-e', 'Book not available.'); return }
            var txId = 'T' + (100 + DB.txns.length + 1);
            DB.txns.push({ id: txId, bookId: bId, bookTitle: bk.title, memberId: mId, memberName: mem.name, memberRole: mem.role, issueDate: iDt, dueDate: dDt, returnDate: null, fine: 0, status: 'issued' });
            bk.available--;
            var req = DB.requests.find(r => r.memberId === mId && r.bookId === bId && r.status === 'pending');
            if (req) req.status = 'approved';
            await saveDB();
            showS('is-s', `Book issued! TX ID: ${txId}`);
            setTimeout(() => libTab('issue', document.querySelectorAll('#lib-sb .sb-item')[2]), 1500);
        }
        function libReturn() {
            var active = DB.txns.filter(t => t.status !== 'returned');
            return `<div class="pg-h">Return Book</div><div class="pg-s">Accept returned books and calculate fines</div>
  <div class="card">
    <div id="ret-s" class="msg-s"></div>
    ${active.length ? `<div class="tbl-wrap"><table><thead><tr><th>TX</th><th>Book</th><th>Member</th><th>Due Date</th><th>Days</th><th>Fine (Est.)</th><th>Action</th></tr></thead><tbody>
    ${active.map(t => { var dl = daysLeft(t.dueDate); var fine = calcFine(t.dueDate); return `<tr><td>${t.id}</td><td>${t.bookTitle}</td><td>${t.memberName}</td><td>${t.dueDate}</td><td style="font-weight:800;color:${dl < 0 ? 'var(--red)' : dl <= 3 ? 'var(--orange)' : 'var(--green)'}">${dl < 0 ? `${-dl} late` : `${dl} left`}</td><td style="font-weight:800;color:${fine > 0 ? 'var(--red)' : 'var(--green)'}">₹${fine}</td><td><button class="btn btn-g" onclick="doReturn('${t.id}')">Accept Return</button></td></tr>` }).join('')}
    </tbody></table></div>`: `<div class="empty"><div class="empty-ic">✅</div><div class="empty-t">No active borrowed books.</div></div>`}
  </div>`;
        }
        async function doReturn(txId) {
            var tx = DB.txns.find(t => t.id === txId); if (!tx) return;
            var fine = calcFine(tx.dueDate);
            tx.returnDate = today(); tx.fine = fine; tx.status = 'returned';
            var bk = DB.books.find(b => b.id === tx.bookId); if (bk) bk.available++;
            await saveDB();
            var s = document.getElementById('ret-s');
            s.textContent = `Book returned successfully! Fine collected: ₹${fine}`; s.style.display = 'block';
            setTimeout(() => libTab('return', document.querySelectorAll('#lib-sb .sb-item')[3]), 1500);
        }
        function libMembers() {
            return `<div class="pg-h">Members</div><div class="pg-s">Directory of all library members, staff, and administrators</div>
  <div class="card">
    <div class="card-hd"><div class="card-t">Library Directory</div></div>
    <div class="sbar"><input class="sbar-i" id="mem-q" placeholder="Search by name, ID, or email..." oninput="filterLibMemUI()"><select class="sbar-s" id="mem-role" onchange="filterLibMemUI()"><option value="all">All Roles</option><option value="student">Students</option><option value="faculty">Faculty</option><option value="librarian">Librarians</option><option value="admin">Admins</option></select></div>
    <div class="tbl-wrap" id="lib-mem-tbl">${renderLibMem('all')}</div>
  </div>`;
        }
        function filterLibMemUI() {
            var q = document.getElementById('mem-q').value;
            var role = document.getElementById('mem-role').value;
            document.getElementById('lib-mem-tbl').innerHTML = renderLibMem(role, q);
        }
        function renderLibMem(role, q = '') {
            var list = DB.users.filter(u => {
                var roleMatch = (role === 'all' ? true : u.role === role);
                var searchMatch = true;
                if (q) {
                    var s = q.toLowerCase();
                    searchMatch = (u.name || '').toLowerCase().includes(s) || 
                                  (u.email || '').toLowerCase().includes(s) || 
                                  (u.id || '').toLowerCase().includes(s) || 
                                  (u.roll || '').toLowerCase().includes(s) ||
                                  (u.empId || '').toLowerCase().includes(s);
                }
                return roleMatch && searchMatch;
            });
            if (!list.length) return `<div class="empty"><div class="empty-ic">👥</div><div class="empty-t">No members found.</div></div>`;
            return `<table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Dept/Details</th></tr></thead><tbody>
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
      return `<tr><td>${u.id}</td><td><strong>${u.name}</strong></td><td>${u.email}</td><td>${badge(u.role)}</td><td>${u.phone || '—'}</td><td>${details}</td></tr>`;
  }).join('')}
  </tbody></table>`;
        }
        function libFines() {
            var overdue = DB.txns.filter(t => t.status === 'overdue');
            var collected = DB.txns.filter(t => t.fine > 0 && t.status === 'returned');
            
            var pendingPayments = DB.payments.filter(p => p.status === 'pending');
            var completedPayments = DB.payments.filter(p => p.status === 'completed');

            var verifyHTML = pendingPayments.length > 0 ? `<div class="card" style="border:2px solid var(--blue);background:#f0f9ff"><div class="card-t" style="margin-bottom:16px;color:var(--navy)">🔔 Pending Online Payments</div>
  <div class="tbl-wrap"><table><thead><tr><th>Student</th><th>Amount Paid</th><th>Transaction UTR</th><th>Date Submitted</th><th>Action</th></tr></thead><tbody>
  ${pendingPayments.map(p => `<tr><td><strong>${p.memberName}</strong><div style="font-size:11px;color:var(--text3)">${p.memberId}</div></td><td style="font-weight:800;color:var(--green)">₹${p.amount}</td><td><span class="bdg b-gray" style="font-family:monospace">${p.utr}</span></td><td>${p.date}</td><td><button class="btn btn-n" style="padding:6px 12px;font-size:12px" onclick="verifyLibPayment('${p.id}')">Verify & Clear Fines</button></td></tr>`).join('')}
  </tbody></table></div></div>` : '';

            var successHtml = completedPayments.length > 0 ? `<div class="card"><div class="card-t" style="margin-bottom:16px">Verified Online Payments</div>
  <div class="tbl-wrap"><table><thead><tr><th>Student</th><th>Amount Paid</th><th>Transaction UTR</th><th>Date</th><th>Status</th></tr></thead><tbody>
  ${completedPayments.map(p => `<tr><td>${p.memberName}</td><td style="font-weight:800;color:var(--green)">₹${p.amount}</td><td><span class="bdg b-gray" style="font-family:monospace">${p.utr}</span></td><td>${p.date}</td><td><span class="bdg b-green">Completed</span></td></tr>`).join('')}
  </tbody></table></div></div>` : '';

            return `<div class="pg-h">Fine Management</div><div class="pg-s">Overdue fines — ₹5 per day</div>
  ${verifyHTML}
  <div class="stat-row">
    <div class="sc red"><div class="sc-val">${overdue.length}</div><div class="sc-lbl">Pending Fines</div></div>
    <div class="sc gold"><div class="sc-val">₹${overdue.reduce((s, t) => s + calcFine(t.dueDate), 0)}</div><div class="sc-lbl">Amount Due</div></div>
    <div class="sc green"><div class="sc-val">₹${collected.reduce((s, t) => s + t.fine, 0)}</div><div class="sc-lbl">Collected at Desk</div></div>
    <div class="sc blue"><div class="sc-val">₹${completedPayments.reduce((s, p) => s + p.amount, 0)}</div><div class="sc-lbl">Collected Online</div></div>
  </div>
  ${successHtml}
  ${overdue.length > 0 ? `<div class="card"><div class="card-t" style="margin-bottom:16px">Students with Overdue Fines</div>
  <div class="tbl-wrap"><table><thead><tr><th>Member</th><th>Book</th><th>Due Date</th><th>Days Late</th><th>Fine</th></tr></thead><tbody>
  ${overdue.map(t => { var dl = -daysLeft(t.dueDate); var fine = calcFine(t.dueDate); return `<tr><td>${t.memberName}</td><td>${t.bookTitle}</td><td>${t.dueDate}</td><td style="font-weight:800;color:var(--red)">${dl} days</td><td style="font-weight:800;color:var(--red)">₹${fine}</td></tr>` }).join('')}
  </tbody></table></div></div>`: ''}
  ${collected.length > 0 ? `<div class="card"><div class="card-t" style="margin-bottom:16px">Manual Collected Fines (Desk)</div>
  <div class="tbl-wrap"><table><thead><tr><th>Member</th><th>Book</th><th>Fine Paid</th><th>Date</th></tr></thead><tbody>
  ${collected.map(t => `<tr><td>${t.memberName}</td><td>${t.bookTitle}</td><td style="font-weight:800;color:var(--green)">₹${t.fine}</td><td>${t.returnDate}</td></tr>`).join('')}
  </tbody></table></div></div>` : ''}`;
        }
        async function verifyLibPayment(pid) {
            var pay = DB.payments.find(p => p.id === pid);
            if(!pay) return;
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
            libTab('fines', document.querySelectorAll('#lib-sb .sb-item')[6]);
        }
        function libIReport() {
            var issued = DB.txns.filter(t => t.status === 'issued');
            var returned = DB.txns.filter(t => t.status === 'returned');
            return `<div class="pg-h">Issue & Return Reports</div><div class="pg-s">Detailed transaction reports</div>
  <div class="card"><div class="card-hd"><div class="card-t">Currently Issued Books</div><button class="btn btn-g" onclick="alert('Report exported!')">Export</button></div>
  ${issued.length ? `<div class="tbl-wrap"><table><thead><tr><th>Book</th><th>Member</th><th>Role</th><th>Issue Date</th><th>Due Date</th><th>Status</th></tr></thead><tbody>
  ${issued.map(t => `<tr><td>${t.bookTitle}</td><td>${t.memberName}</td><td>${badge(t.memberRole)}</td><td>${t.issueDate}</td><td>${t.dueDate}</td><td>${badge(t.status)}</td></tr>`).join('')}
  </tbody></table></div>`: `<div class="empty"><div class="empty-ic">📋</div><div class="empty-t">No books currently issued.</div></div>`}
  </div>
  <div class="card"><div class="card-hd"><div class="card-t">Recent Returns</div></div>
  ${returned.length ? `<div class="tbl-wrap"><table><thead><tr><th>Book</th><th>Member</th><th>Returned</th><th>Fine</th></tr></thead><tbody>
  ${returned.map(t => `<tr><td>${t.bookTitle}</td><td>${t.memberName}</td><td>${t.returnDate}</td><td style="font-weight:800;color:${t.fine > 0 ? 'var(--red)' : 'var(--green)'}">₹${t.fine}</td></tr>`).join('')}
  </tbody></table></div>`: `<div class="empty"><div class="empty-ic">📋</div><div class="empty-t">No returns yet.</div></div>`}
  </div>`;
        }
        function libRecommend() {
            return `<div class="pg-h">Book Recommendations</div><div class="pg-s">Faculty recommendations for new book acquisitions</div>
  <div class="card">${DB.recommendations.length ? `<div class="tbl-wrap"><table><thead><tr><th>Title</th><th>Author</th><th>ISBN</th><th>Subject</th><th>Recommended By</th><th>Date</th><th>Status</th><th>Action</th></tr></thead><tbody>
  ${DB.recommendations.map(r => `<tr><td><strong>${r.bookTitle}</strong></td><td>${r.author}</td><td>${r.isbn || '—'}</td><td>${r.subject || '—'}</td><td>${r.recommendedBy}</td><td>${r.date}</td><td>${badge(r.status)}</td><td style="display:flex;gap:5px">
    ${r.status === 'pending' ? `<button class="btn btn-g" style="padding:5px 10px;font-size:11px" onclick="approveRec('${r.id}')">Approve</button><button class="btn btn-r" style="padding:5px 10px;font-size:11px" onclick="rejectRec('${r.id}')">Reject</button>` : badge(r.status)}
  </td></tr>`).join('')}
  </tbody></table></div>`: `<div class="empty"><div class="empty-ic">💡</div><div class="empty-t">No recommendations yet.</div></div>`}</div>`;
        }
        async function approveRec(id) { var r = DB.recommendations.find(x => x.id === id); if (r) r.status = 'approved'; await saveDB(); libTab('recommend', document.querySelectorAll('#lib-sb .sb-item')[7]); }
        async function rejectRec(id) { var r = DB.recommendations.find(x => x.id === id); if (r) r.status = 'rejected'; await saveDB(); libTab('recommend', document.querySelectorAll('#lib-sb .sb-item')[7]); }

        function libRequests() {
            var reqs = DB.requests.filter(r => r.status === 'pending');
            return `<div class="pg-h">Book Requests</div><div class="pg-s">Approve or reject book borrow requests</div>
  <div class="card" id="lib-reqs-card">
    ${reqs.length ? `<div class="tbl-wrap"><table><thead><tr><th>Request ID</th><th>Book Title</th><th>Member Name</th><th>Date</th><th>Action</th></tr></thead><tbody>
    ${reqs.map(r => `<tr><td>${r.id}</td><td><strong>${r.bookTitle}</strong><br><span style="font-size:11px;color:var(--text3)">${r.author}</span></td><td>${r.memberName}</td><td>${r.requestDate}</td><td style="display:flex;gap:5px">
      <button class="btn btn-g" style="padding:5px 10px;font-size:11px" onclick="libApproveReq('${r.id}')">Accept & Issue</button>
      <button class="btn btn-r" style="padding:5px 10px;font-size:11px" onclick="libRejectReq('${r.id}')">Reject</button>
    </td></tr>`).join('')}
    </tbody></table></div>`: `<div class="empty"><div class="empty-ic">📬</div><div class="empty-t">No pending requests right now.</div></div>`}
  </div>`;
        }

        async function libApproveReq(id) {
            var r = DB.requests.find(x => x.id === id); if (!r) return;
            var bk = DB.books.find(b => b.id === r.bookId);
            if (!bk || bk.available < 1) { alert('This book is currently out of stock.'); return; }
            
            r.status = 'approved';
            var mem = DB.users.find(u => u.id === r.memberId || u._id === r.memberId);
            var mRole = mem ? mem.role : 'student';
            var txId = 'T' + (100 + DB.txns.length + 1);
            
            DB.txns.push({ 
                id: txId, bookId: r.bookId, bookTitle: r.bookTitle, 
                memberId: r.memberId, memberName: r.memberName, memberRole: mRole, 
                issueDate: today(), dueDate: dueDate(mRole === 'faculty' ? 60 : 14), 
                returnDate: null, fine: 0, status: 'issued' 
            });
            bk.available--;
            await saveDB();
            
            // Send email notification (asynchronously)
            if (mem && mem.email) {
                console.log('Sending notification to:', mem.email);
                fetch('/api/library/notify-acceptance', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: mem.email,
                        name: mem.name,
                        bookTitle: r.bookTitle
                    })
                })
                .then(res => res.json())
                .then(data => console.log('Notification result:', data))
                .catch(err => console.error('Notification failed:', err));
            } else {
                console.warn('Could not send notification: member or email not found', mem);
            }

            alert(`Request accepted and book issued successfully! TX ID: ${txId}`);
            libTab('requests', document.querySelector('.sb-item.on'));
        }

        async function libRejectReq(id) {
            var r = DB.requests.find(x => x.id === id); if (r) r.status = 'rejected';
            await saveDB();
            libTab('requests', document.querySelector('.sb-item.on'));
        }
