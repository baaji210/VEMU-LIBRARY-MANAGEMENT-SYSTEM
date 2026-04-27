        function stuTab(tab, el) {
            setActive('stu-sb', el);
            var m = document.getElementById('stu-main');
            var fns = { browse: stuBrowse, request: stuRequests, history: stuHistory, fines: stuFines, profile: stuProfile };
            m.innerHTML = (fns[tab] || stuBrowse)();
        }
        function stuBrowse() {
            var cats = ['All', 'ECE', 'EEE', 'ME', 'CE', 'AI', 'CSE', 'H&S', 'Pharmacy', 'MBA', 'MCA', 'Diploma'];
            return `<div class="pg-h">Browse Books</div><div class="pg-s">Search and request books from the library</div>
  <div class="sbar"><input class="sbar-i" id="st-q" placeholder="🔍 Search by title, author, subject, ISBN…" oninput="stuFilter()"><select class="sbar-s" id="st-cat" onchange="stuFilter()">${cats.map(c => `<option>${c}</option>`).join('')}</select></div>
  <div class="bk-grid" id="st-grid">${renderStuCards(DB.books, '', 'All')}</div>
  <div id="st-confirm"></div>`;
        }
        function renderStuCards(books, q, cat) {
            var list = books.filter(b => { var sq = (q || '').toLowerCase(); var sc = cat === 'All' || b.category === cat; return sc && (!sq || (b.title.toLowerCase().includes(sq) || b.author.toLowerCase().includes(sq) || b.isbn.includes(sq) || b.subject.toLowerCase().includes(sq))); });
            if (!list.length) return `<div class="empty" style="grid-column:1/-1"><div class="empty-ic">📚</div><div class="empty-t">No books found matching your search.</div></div>`;
            return list.map(b => {
                var isSel = selBk && selBk.id === b.id;
                var avCls = b.available === 0 ? 'bkav-n' : b.available <= 2 ? 'bkav-f' : 'bkav-y';
                var avTxt = b.available === 0 ? '✗ Unavailable' : b.available <= 2 ? `⚡ Only ${b.available} left` : `✓ Available (${b.available})`;
                return `<div class="bk-card${isSel ? ' sel' : ''}" onclick="stuSelect('${b.id}')"><div class="bk-cov">${b.emoji}</div><div class="bk-t">${b.title}</div><div class="bk-a">${b.author} · ${b.edition || ''} Ed.</div><div class="bk-av ${avCls}">${avTxt}</div><div style="font-size:11px;color:var(--text3);margin-top:4px">${b.category} · ${b.subject || ''}</div>${isSel ? '<div style="margin-top:8px;font-size:12px;font-weight:800;color:var(--gold)">★ Selected</div>' : ''}</div>`;
            }).join('');
        }
        function stuFilter() {
            document.getElementById('st-grid').innerHTML = renderStuCards(DB.books, document.getElementById('st-q').value, document.getElementById('st-cat').value);
        }
        function stuSelect(id) {
            var bk = DB.books.find(b => b.id === id); if (!bk) return;
            if (bk.available < 1) { alert('Sorry, this book is currently unavailable. You can check back later.'); return }
            selBk = bk;
            stuFilter();
            document.getElementById('st-confirm').innerHTML = `
  <div class="confirm-panel">
    <div style="font-size:16px;font-weight:800;color:var(--navy);margin-bottom:16px">📖 Borrow Request</div>
    <div class="irow"><span class="irow-l">Book Title</span><span class="irow-v">${bk.title}</span></div>
    <div class="irow"><span class="irow-l">Author</span><span class="irow-v">${bk.author}</span></div>
    <div class="irow"><span class="irow-l">Edition</span><span class="irow-v">${bk.edition || '—'}</span></div>
    <div class="irow"><span class="irow-l">Category</span><span class="irow-v">${bk.category}</span></div>
    <div class="irow"><span class="irow-l">Proposed Due Date</span><span class="irow-v">${dueDate(14)}</span></div>
    <div class="irow"><span class="irow-l">Late Fine</span><span class="irow-v">₹5 per day</span></div>
    <div style="display:flex;gap:12px;margin-top:20px">
      <button class="btn btn-g" style="flex:1;padding:13px;font-size:14px" onclick="stuConfirm()">Submit Request →</button>
      <button class="btn-cancel" style="flex:1;padding:13px" onclick="stuCancel()">Cancel</button>
    </div>
  </div>`;
        }
        async function stuConfirm() {
            if (!curUser || !selBk) return;
            DB.requests.push({ id: 'R' + (100 + DB.requests.length + 1), bookId: selBk.id, bookTitle: selBk.title, author: selBk.author, memberId: curUser.id, memberName: curUser.name, requestDate: today(), status: 'pending' });
            await saveDB();
            selBk = null;
            stuTab('request', document.querySelectorAll('#stu-sb .sb-item')[1]);
        }
        function stuCancel() { selBk = null; stuTab('browse', document.querySelector('#stu-sb .sb-item')) }
        function stuRequests() {
            var myReqs = DB.requests.filter(r => r.memberId === curUser.id);
            var myTxns = DB.txns.filter(t => t.memberId === curUser.id && t.status !== 'returned');
            return `<div class="pg-h">My Requests & Issued Books</div><div class="pg-s">Track your borrow requests and currently issued books</div>
  ${myTxns.length > 0 ? `<div class="card"><div class="card-hd"><div class="card-t">📖 Currently Issued Books</div></div>
  ${myTxns.map(t => { var dl = daysLeft(t.dueDate); return `<div class="${dl < 0 ? 'alert-banner alert-danger' : dl <= 3 ? 'alert-banner alert-warn' : 'due-warn'}" style="margin-bottom:10px"><span>${dl < 0 ? '🔴' : dl <= 3 ? '🟡' : '🟢'}</span><div style="flex:1"><strong>${t.bookTitle}</strong><br><span style="font-size:12px">Due: ${t.dueDate} · ${dl < 0 ? `${-dl} days OVERDUE` : `${dl} days left`}</span></div>${dl < 0 ? `<strong style="color:var(--red)">Fine: ₹${calcFine(t.dueDate)}</strong>` : ''}</div>` }).join('')}
  </div>`: ''}
  <div class="card"><div class="card-hd"><div class="card-t">📬 Book Requests</div></div>
  ${myReqs.length ? `<div class="tbl-wrap"><table><thead><tr><th>Book</th><th>Request Date</th><th>Status</th></tr></thead><tbody>
  ${myReqs.map(r => `<tr><td><strong>${r.bookTitle}</strong><br><span style="font-size:11px;color:var(--text3)">${r.author}</span></td><td>${r.requestDate}</td><td>${badge(r.status)}</td></tr>`).join('')}
  </tbody></table></div>`: `<div class="empty"><div class="empty-ic">📬</div><div class="empty-t">No requests yet. Browse books to submit a request.</div></div>`}
  </div>`;
        }
        function stuHistory() {
            var myTxns = DB.txns.filter(t => t.memberId === curUser.id);
            return `<div class="pg-h">My Borrowing History</div><div class="pg-s">Complete record of all borrowed books</div>
  <div class="card">${myTxns.length ? `<div class="tbl-wrap"><table><thead><tr><th>Book</th><th>Issued</th><th>Due Date</th><th>Returned</th><th>Fine</th><th>Status</th></tr></thead><tbody>
  ${myTxns.slice().reverse().map(t => `<tr><td><strong>${t.bookTitle}</strong></td><td>${t.issueDate}</td><td>${t.dueDate}</td><td>${t.returnDate || '—'}</td><td style="font-weight:800;color:${t.fine > 0 ? 'var(--red)' : 'var(--green)'}">₹${t.fine}</td><td>${badge(t.status)}</td></tr>`).join('')}
  </tbody></table></div>`: `<div class="empty"><div class="empty-ic">📋</div><div class="empty-t">No borrowing history yet. <a style="color:var(--navy2);font-weight:700;cursor:pointer" onclick="stuTab('browse',document.querySelector('#stu-sb .sb-item'))">Browse books →</a></div></div>`}</div>`;
        }
        function stuFines() {
            var myFines = DB.txns.filter(t => t.memberId === curUser.id && (t.fine > 0 || t.status === 'overdue'));
            var pending = DB.txns.filter(t => t.memberId === curUser.id && t.status === 'overdue').reduce((s, t) => s + calcFine(t.dueDate), 0);
            var paid = DB.txns.filter(t => t.memberId === curUser.id && t.fine > 0 && t.status === 'returned').reduce((s, t) => s + t.fine, 0);
            
            var myPayments = DB.payments.filter(p => p.memberId === curUser.id);
            var hasPending = myPayments.some(p => p.status === 'pending');
            var banner = hasPending ? `<div class="alert-banner alert-info" style="border: 1px solid var(--blue)"><div class="alert-icon">⏳</div><strong>Payment Verification Pending</strong><br>You have submitted a payment of ₹${myPayments.find(p=>p.status==='pending').amount}. The library administration is reviewing it.</div>` : (pending > 0 ? `<div class="alert-banner alert-danger"><div class="alert-icon">💰</div><strong>You have ₹${pending} in pending fines.</strong></div>` : '');
            
            var payUI = (!hasPending && pending > 0) ? `<div class="card bg-pay" style="border: 2px solid var(--gold); background: #fdfaf3; margin-bottom: 20px;">
    <div class="card-t" style="color: var(--navy)">💳 Pay Overdue Fines Online</div>
    <div style="font-size: 14px; margin-bottom: 16px; color: var(--text2)">You have <strong>₹${pending}</strong> in pending fines. Scan the QR code or use the UPI ID to pay. Once paid, submit your Transaction Reference Number (UTR) below for verification.</div>
    <div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap">
      <div style="padding:10px;background:#fff;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.06);display:inline-block">
        <img src="assets/img/qr.png" style="width:140px;height:140px;display:block">
      </div>
      <div style="flex:1;min-width:200px">
        <div style="font-size:12px;font-weight:700;color:var(--text3);text-transform:uppercase;margin-bottom:4px">Official Library UPI ID</div>
        <div style="font-size:16px;font-weight:800;color:var(--navy);font-family:monospace;letter-spacing:1px;margin-bottom:16px;background:#fff;padding:6px 10px;border:1px solid #e2e8f0;border-radius:6px;display:inline-block">library-vemu@upi</div>
        <div class="fg" style="margin-bottom:12px"><label class="fl">Transaction UTR / Ref Number <span style="color:var(--red)">*</span></label><input class="fi" id="stu-pay-utr" placeholder="12-digit UPI Number"></div>
        <button class="btn btn-n" onclick="submitStuPayment()">Submit Payment →</button>
        <div id="stu-pay-ok" class="msg-s"></div>
        <div id="stu-pay-err" class="msg-e"></div>
      </div>
    </div>
  </div>` : '';

            return `<div class="pg-h">My Fines & Payments</div><div class="pg-s">Library fines and online payment verification</div>
  ${banner}
  ${payUI}
  <div class="stat-row" style="max-width:360px">
    <div class="sc red"><div class="sc-val">₹${pending}</div><div class="sc-lbl">Pending</div></div>
    <div class="sc green"><div class="sc-val">₹${paid}</div><div class="sc-lbl">Paid</div></div>
  </div>
  <div class="card">${myFines.length ? `<div class="tbl-wrap"><table><thead><tr><th>Book</th><th>Due Date</th><th>Fine</th><th>Status</th></tr></thead><tbody>
  ${myFines.map(t => { var fine = t.status === 'overdue' ? calcFine(t.dueDate) : t.fine; return `<tr><td>${t.bookTitle}</td><td>${t.dueDate}</td><td style="font-weight:800;color:var(--red)">₹${fine}</td><td><span class="bdg ${t.status === 'returned' ? 'b-green' : 'b-red'}">${t.status === 'returned' ? 'Paid' : 'Due'}</span></td></tr>` }).join('')}
  </tbody></table></div>`: `<div class="empty"><div class="empty-ic">✅</div><div class="empty-t">No fines! Keep returning books on time.</div></div>`}</div>`;
        }
        async function submitStuPayment() {
            var utr = document.getElementById('stu-pay-utr').value.trim();
            if(!utr || utr.length < 8) return showE('stu-pay-err', 'Please enter a valid 12-digit UPI transaction number.');
            var pendingAmount = DB.txns.filter(t => t.memberId === curUser.id && t.status === 'overdue').reduce((s, t) => s + calcFine(t.dueDate), 0);
            DB.payments.push({ id: 'P' + (1000 + DB.payments.length + 1), memberId: curUser.id, memberName: curUser.name, amount: pendingAmount, utr: utr, date: today(), status: 'pending' });
            await saveDB();
            showS('stu-pay-ok', 'Payment details submitted for verification.');
            setTimeout(() => stuTab('fines', document.querySelectorAll('#stu-sb .sb-item')[3]), 1500);
        }
        function stuProfile() {
            var myTxns = DB.txns.filter(t => t.memberId === curUser.id);
            var active = myTxns.filter(t => t.status !== 'returned').length;
            return `<div class="pg-h">My Profile</div><div class="pg-s">Your library account information</div>
  <div class="card" style="max-width:520px">
    <div style="display:flex;align-items:center;gap:18px;margin-bottom:24px;padding-bottom:22px;border-bottom:1px solid var(--border)">
      <div style="width:66px;height:66px;border-radius:17px;background:linear-gradient(135deg,#2563eb,#60a5fa);display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:#fff">${ini(curUser.name)}</div>
      <div><div style="font-size:21px;font-weight:800;color:var(--navy);font-family:'Playfair Display',serif">${curUser.name}</div><div style="font-size:13px;color:var(--text3);margin-top:3px">Student Member · ${curUser.id}</div></div>
    </div>
    <div class="irow"><span class="irow-l">Email</span><span class="irow-v">${curUser.email}</span></div>
    <div class="irow"><span class="irow-l">Phone</span><span class="irow-v">${curUser.phone || '—'}</span></div>
    <div class="irow"><span class="irow-l">Roll Number</span><span class="irow-v">${curUser.roll || '—'}</span></div>
    <div class="irow"><span class="irow-l">Member Since</span><span class="irow-v">${curUser.joinDate || '—'}</span></div>
    <div class="irow"><span class="irow-l">Total Borrowed</span><span class="irow-v">${myTxns.length} books</span></div>
    <div class="irow"><span class="irow-l">Currently Issued</span><span class="irow-v">${active} books</span></div>
  </div>`;
        }

