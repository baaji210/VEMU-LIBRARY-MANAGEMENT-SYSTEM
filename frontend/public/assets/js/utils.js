
        function ini(name) { return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() }
        function today() { return new Date().toISOString().split('T')[0] }
        function dueDate(days) { var d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().split('T')[0] }
        function calcFine(dd) {
            var t = new Date(); t.setHours(0, 0, 0, 0);
            var d = new Date(dd); d.setHours(0, 0, 0, 0);
            var days = Math.floor((t - d) / 864e5);
            return days > 0 ? days * 5 : 0;
        }
        function daysLeft(dd) {
            var t = new Date(); t.setHours(0, 0, 0, 0);
            var d = new Date(dd); d.setHours(0, 0, 0, 0);
            return Math.floor((d - t) / 864e5);
        }
        function badge(s) {
            var m = { issued: 'b-blue', overdue: 'b-red', returned: 'b-green', pending: 'b-amber', approved: 'b-green', rejected: 'b-red', reserved: 'b-purple' };
            return `<span class="bdg ${m[s] || 'b-gray'}">${s}</span>`;
        }
        function avBadge(av, qty) {
            if (av === 0) return `<span class="bdg b-red">Unavailable</span>`;
            if (av <= 2) return `<span class="bdg b-amber">Low (${av})</span>`;
            return `<span class="bdg b-green">Available (${av})</span>`;
        }
        function showE(id, m) { var e = document.getElementById(id); e.textContent = m; e.style.display = 'block'; setTimeout(() => e.style.display = 'none', 5000) }
        function showS(id, m) { var e = document.getElementById(id); e.textContent = m; e.style.display = 'block'; setTimeout(() => e.style.display = 'none', 5000) }
        function openModal(html) { document.getElementById('modal-box').innerHTML = html; document.getElementById('modal-bg').classList.add('open') }
        function closeModal() { document.getElementById('modal-bg').classList.remove('open') }
        function closeModalOut(e) { if (e.target === document.getElementById('modal-bg')) closeModal() }
        function toggleNotif(id) {
            document.querySelectorAll('.notif-panel').forEach(p => { if (p.id !== id) p.classList.remove('open') });
            document.getElementById(id).classList.toggle('open');
        }
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.notif-btn') && !e.target.closest('.notif-panel'))
                document.querySelectorAll('.notif-panel').forEach(p => p.classList.remove('open'));
        });

        function renderPubCat() {
            var q = (document.getElementById('pub-q').value || '').toLowerCase();
            var cat = document.getElementById('pub-cat').value;
            var list = DB.books.filter(b => (!q || (b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.isbn.includes(q))) && (!cat || b.category === cat));
            var g = document.getElementById('pub-grid');
            if (!list.length) { g.innerHTML = '<div class="empty" style="grid-column:1/-1"><div class="empty-ic">📚</div><div class="empty-t">No books found.</div></div>'; return }
            g.innerHTML = list.map(b => {
                var av = b.available;
                var tag = av === 0 ? 'av-no' : av <= 2 ? 'av-few' : 'av-yes';
                var tlbl = av === 0 ? '✗ Unavailable' : av <= 2 ? `⚡ Only ${av} left` : `✓ Available (${av})`;
                return `<div class="pub-bk"><div class="pub-bk-cov">${b.emoji}</div><div class="pub-bk-t">${b.title}</div><div class="pub-bk-a">${b.author}</div><span class="av-tag ${tag}">${tlbl}</span></div>`;
            }).join('');
        }

