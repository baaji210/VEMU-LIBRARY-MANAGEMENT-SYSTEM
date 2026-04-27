        function facTab(tab, el) {
            setActive('fac-sb', el);
            var m = document.getElementById('fac-main');
            var fns = { browse: facBrowse, borrowed: facBorrowed, history: facHistory, recommend: facRecommend, profile: facProfile };
            m.innerHTML = (fns[tab] || facBrowse)();
        }
        function facBrowse() {
            var cats = ['All', 'ECE', 'EEE', 'ME', 'CE', 'AI', 'CSE', 'H&S', 'Pharmacy', 'MBA', 'MCA', 'Diploma'];
            return `<div class="pg-h">Browse & Reserve Books</div><div class="pg-s">Search the catalogue and reserve books. Faculty borrowing period: up to 60 days.</div>
  <div class="alert-banner alert-info"><span>ℹ️</span>Faculty members may borrow books for up to <strong>60 days</strong>. Books can be renewed once at the library counter.</div>
  <div class="sbar"><input class="sbar-i" id="fc-q" placeholder="🔍 Search by title, author, subject, ISBN…" oninput="facFilter()"><select class="sbar-s" id="fc-cat" onchange="facFilter()">${cats.map(c => `<option>${c}</option>`).join('')}</select></div>
  <div class="bk-grid" id="fc-grid">${renderFacCards(DB.books, '', 'All')}</div>
  <div id="fc-confirm"></div>`;
        }
        function renderFacCards(books, q, cat) {
            var list = books.filter(b => { var sq = (q || '').toLowerCase(); var sc = cat === 'All' || b.category === cat; return sc && (!sq || (b.title.toLowerCase().includes(sq) || b.author.toLowerCase().includes(sq) || b.isbn.includes(sq) || (b.subject || '').toLowerCase().includes(sq))); });
            if (!list.length) return `<div class="empty" style="grid-column:1/-1"><div class="empty-ic">📚</div><div class="empty-t">No books found.</div></div>`;
            return list.map(b => {
                var isSel = selBk && selBk.id === b.id;
                var avCls = b.available === 0 ? 'bkav-n' : b.available <= 2 ? 'bkav-f' : 'bkav-y';
                var avTxt = b.available === 0 ? '✗ Unavailable' : b.available <= 2 ? `⚡ Only ${b.available} left` : `✓ Available (${b.available})`;
                return `<div class="bk-card${isSel ? ' sel' : ''}" onclick="facSelect('${b.id}')"><div class="bk-cov">${b.emoji}</div><div class="bk-t">${b.title}</div><div class="bk-a">${b.author} · ${b.edition || ''}</div><div class="bk-av ${avCls}">${avTxt}</div><div style="font-size:11px;color:var(--text3);margin-top:4px">${b.category}</div>${isSel ? '<div style="margin-top:8px;font-size:12px;font-weight:800;color:var(--gold)">★ Selected</div>' : ''}</div>`;
            }).join('');
        }
        function facFilter() { document.getElementById('fc-grid').innerHTML = renderFacCards(DB.books, document.getElementById('fc-q').value, document.getElementById('fc-cat').value) }
        function facSelect(id) {
            var bk = DB.books.find(b => b.id === id); if (!bk) return;
            if (bk.available < 1) { alert('This book is unavailable. You may reserve it — we will notify you when available.'); return }
            selBk = bk; facFilter();
            document.getElementById('fc-confirm').innerHTML = `
  <div class="confirm-panel">
    <div style="font-size:16px;font-weight:800;color:var(--navy);margin-bottom:16px">📖 Faculty Borrow Request</div>
    <div class="irow"><span class="irow-l">Book</span><span class="irow-v">${bk.title}</span></div>
    <div class="irow"><span class="irow-l">Author</span><span class="irow-v">${bk.author}</span></div>
    <div class="irow"><span class="irow-l">Duration</span><span class="irow-v">Up to 60 days</span></div>
    <div class="irow"><span class="irow-l">Fine Rate</span><span class="irow-v">₹5/day after due date</span></div>
    <div style="display:flex;gap:12px;margin-top:20px">
      <button class="btn btn-g" style="flex:1;padding:13px;font-size:14px" onclick="facConfirm()">Submit Request →</button>
      <button class="btn-cancel" style="flex:1;padding:13px" onclick="facCancel()">Cancel</button>
    </div>
  </div>`;
        }
        async function facConfirm() {
            if (!curUser || !selBk) return;
            DB.requests.push({ id: 'R' + (100 + DB.requests.length + 1), bookId: selBk.id, bookTitle: selBk.title, author: selBk.author, memberId: curUser.id, memberName: curUser.name, requestDate: today(), status: 'pending', memberRole: 'faculty' });
            await saveDB();
            selBk = null;
            facTab('borrowed', document.querySelectorAll('#fac-sb .sb-item')[1]);
        }
        function facCancel() { selBk = null; facTab('browse', document.querySelector('#fac-sb .sb-item')) }
        function facBorrowed() {
            var myTxns = DB.txns.filter(t => t.memberId === curUser.id && t.status !== 'returned');
            var myReqs = DB.requests.filter(r => r.memberId === curUser.id);
            return `<div class="pg-h">Borrowed Books</div><div class="pg-s">Currently borrowed books and requests</div>
  ${myTxns.length ? myTxns.map(t => { var dl = daysLeft(t.dueDate); return `<div class="card" style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-size:15px;font-weight:800;color:var(--navy)">${t.bookTitle}</div><div style="font-size:13px;color:var(--text3);margin-top:2px">Issued: ${t.issueDate} · Due: ${t.dueDate}</div></div><span class="${dl < 0 ? 'bdg b-red' : dl <= 7 ? 'bdg b-amber' : 'bdg b-green'}">${dl < 0 ? `${-dl} days overdue` : dl === 0 ? 'Due today' : `${dl} days left`}</span></div></div>` }).join('') : `<div class="card"><div class="empty"><div class="empty-ic">📖</div><div class="empty-t">No books currently borrowed.</div></div></div>`}
  ${myReqs.length ? `<div class="card"><div class="card-t" style="margin-bottom:14px">Pending Requests</div><div class="tbl-wrap"><table><thead><tr><th>Book</th><th>Requested</th><th>Status</th></tr></thead><tbody>${myReqs.map(r => `<tr><td>${r.bookTitle}</td><td>${r.requestDate}</td><td>${badge(r.status)}</td></tr>`).join('')}</tbody></table></div></div>` : ''}`;
        }
        function facHistory() {
            var myTxns = DB.txns.filter(t => t.memberId === curUser.id);
            return `<div class="pg-h">Borrowing History</div><div class="pg-s">Complete history of all books borrowed</div>
  <div class="card">${myTxns.length ? `<div class="tbl-wrap"><table><thead><tr><th>Book</th><th>Issued</th><th>Due Date</th><th>Returned</th><th>Fine</th><th>Status</th></tr></thead><tbody>
  ${myTxns.slice().reverse().map(t => `<tr><td><strong>${t.bookTitle}</strong></td><td>${t.issueDate}</td><td>${t.dueDate}</td><td>${t.returnDate || '—'}</td><td style="font-weight:800;color:${t.fine > 0 ? 'var(--red)' : 'var(--green)'}">₹${t.fine}</td><td>${badge(t.status)}</td></tr>`).join('')}
  </tbody></table></div>`: `<div class="empty"><div class="empty-ic">📋</div><div class="empty-t">No borrowing history yet.</div></div>`}</div>`;
        }
        function facRecommend() {
            var myRecs = DB.recommendations.filter(r => r.recommendedBy === curUser.name);
            return `<div class="pg-h">Recommend Books</div><div class="pg-s">Suggest new books for the library to acquire</div>
  <div class="card" style="max-width:600px;margin-bottom:20px">
    <div class="card-t" style="margin-bottom:18px">📬 Submit a Recommendation</div>
    <div class="dfg"><label class="dfl">Book Title</label><input class="dfi" id="rc-t" placeholder="Full book title"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div class="dfg"><label class="dfl">Author</label><input class="dfi" id="rc-a" placeholder="Author name"></div>
      <div class="dfg"><label class="dfl">ISBN (Optional)</label><input class="dfi" id="rc-i" placeholder="ISBN"></div>
    </div>
    <div class="dfg"><label class="dfl">Subject / Reason</label><input class="dfi" id="rc-s" placeholder="Why should the library acquire this book?"></div>
    <button class="btn btn-g" onclick="submitRec()">Submit Recommendation →</button>
    <div id="rc-ok" class="msg-s"></div>
  </div>
  ${myRecs.length ? `<div class="card"><div class="card-t" style="margin-bottom:14px">My Recommendations</div><div class="tbl-wrap"><table><thead><tr><th>Book</th><th>Author</th><th>Date</th><th>Status</th></tr></thead><tbody>
  ${myRecs.map(r => `<tr><td>${r.bookTitle}</td><td>${r.author}</td><td>${r.date}</td><td>${badge(r.status)}</td></tr>`).join('')}
  </tbody></table></div></div>`: ''}`;
        }
        async function submitRec() {
            var t = document.getElementById('rc-t').value.trim(); var a = document.getElementById('rc-a').value.trim();
            if (!t || !a) { alert('Title and Author are required.'); return }
            DB.recommendations.push({ id: 'R' + (100 + DB.recommendations.length + 1), bookTitle: t, author: a, isbn: document.getElementById('rc-i').value.trim(), subject: document.getElementById('rc-s').value.trim(), recommendedBy: curUser.name, date: today(), status: 'pending' });
            await saveDB();
            document.getElementById('rc-t').value = ''; document.getElementById('rc-a').value = ''; document.getElementById('rc-i').value = ''; document.getElementById('rc-s').value = '';
            showS('rc-ok', 'Recommendation submitted! The librarian will review it.');
        }
        function facProfile() {
            var myTxns = DB.txns.filter(t => t.memberId === curUser.id);
            var active = myTxns.filter(t => t.status !== 'returned').length;
            return `<div class="pg-h">My Profile</div><div class="pg-s">Your faculty library account</div>
  <div class="card" style="max-width:520px">
    <div style="display:flex;align-items:center;gap:18px;margin-bottom:24px;padding-bottom:22px;border-bottom:1px solid var(--border)">
      <div style="width:66px;height:66px;border-radius:17px;background:linear-gradient(135deg,#ea580c,#fb923c);display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:#fff">${ini(curUser.name)}</div>
      <div><div style="font-size:21px;font-weight:800;color:var(--navy);font-family:'Playfair Display',serif">${curUser.name}</div><div style="font-size:13px;color:var(--text3);margin-top:3px">Faculty Member · ${curUser.id}</div></div>
    </div>
    <div class="irow"><span class="irow-l">Email</span><span class="irow-v">${curUser.email}</span></div>
    <div class="irow"><span class="irow-l">Phone</span><span class="irow-v">${curUser.phone || '—'}</span></div>
    <div class="irow"><span class="irow-l">Department</span><span class="irow-v">${curUser.dept || '—'}</span></div>
    <div class="irow"><span class="irow-l">Member Since</span><span class="irow-v">${curUser.joinDate || '—'}</span></div>
    <div class="irow"><span class="irow-l">Total Borrowed</span><span class="irow-v">${myTxns.length} books</span></div>
    <div class="irow"><span class="irow-l">Currently Issued</span><span class="irow-v">${active} books</span></div>
    <div class="irow"><span class="irow-l">Recommendations</span><span class="irow-v">${DB.recommendations.filter(r => r.recommendedBy === curUser.name).length} submitted</span></div>
  </div>`;
        }

