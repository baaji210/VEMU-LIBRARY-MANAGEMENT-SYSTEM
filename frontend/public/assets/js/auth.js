        var role = 'student';
        function updateYearOptions() {
            var el = document.getElementById('rg-deg');
            if(!el) return;
            var deg = el.value;
            var maxYear = 4;
            if (['BBA', 'BCA', 'Diploma'].includes(deg)) maxYear = 3;
            else if (['MBA', 'MCA'].includes(deg)) maxYear = 2;
            var ys = document.getElementById('rg-year');
            if(ys) {
                var cv = ys.value;
                ys.innerHTML = '';
                for (var i = 1; i <= maxYear; i++) {
                    var th = i===1?'st':i===2?'nd':i===3?'rd':'th';
                    ys.innerHTML += `<option value="${i}">${i}${th} Year</option>`;
                }
                if (cv && cv <= maxYear) ys.value = cv;
            }
            
            var deptsMap = {
                'B.Tech': ['Computer Science (CSE)', 'Electronics & Comm (ECE)', 'Electrical (EEE)', 'Mechanical (ME)', 'Civil (CE)', 'Information Tech (IT)', 'Data Science (AIDS)', 'Artificial Intelligence (AI)', 'AI & Machine Learning (AIML)'],
                'BBA': ['Business Administration', 'Marketing', 'Finance', 'Human Resources', 'International Business'],
                'BCA': ['Computer Applications', 'Data Science', 'Cloud Computing', 'Cyber Security'],
                'Diploma': ['Computer Engineering (DCME)', 'Mechanical Engineering (DME)', 'Electrical Engineering (DEEE)', 'Civil Engineering (DCE)', 'Electronics (DECE)'],
                'MBA': ['Master of Business Administration', 'Finance Management', 'Marketing Management', 'Business Analytics', 'HR Management'],
                'MCA': ['Master of Computer Applications', 'Software Engineering', 'AI & Machine Learning'],
            };
            var deptSelect = document.getElementById('rg-dept');
            if(deptSelect) {
                var currentDept = deptSelect.value;
                var dList = deg ? (deptsMap[deg] || []) : ['ECE', 'EEE', 'ME', 'CE', 'AI', 'CSE', 'H&S', 'Pharmacy', 'MBA', 'MCA', 'Diploma'];
                deptSelect.innerHTML = '<option value="">— Select Department/Course —</option>';
                dList.forEach(d => deptSelect.innerHTML += `<option value="${d}">${d}</option>`);
                if (currentDept && dList.includes(currentDept)) deptSelect.value = currentDept;
            }
        }

        function setRole(r) {
            role = r;
            ['s', 'f', 'l', 'a'].forEach(x => { var el = document.getElementById('rt-' + x); if (el) el.classList.remove('on') });
            var map = { student: 's', faculty: 'f', librarian: 'l', admin: 'a' };
            if (document.getElementById('rt-' + map[r])) document.getElementById('rt-' + map[r]).classList.add('on');
            document.getElementById('rg-roll-wrap').style.display = r === 'student' ? 'block' : 'none';
            if (document.getElementById('rg-empid-wrap')) document.getElementById('rg-empid-wrap').style.display = r !== 'student' ? 'block' : 'none';
            if(document.getElementById('rg-deg-wrap')) document.getElementById('rg-deg-wrap').style.display = r === 'student' ? 'block' : 'none';
            document.getElementById('rg-year-wrap').style.display = r === 'student' ? 'block' : 'none';
            document.getElementById('rg-sec-wrap').style.display = r === 'student' ? 'block' : 'none';
            document.getElementById('rg-dept-wrap').style.display = (r === 'student' || r === 'faculty' || r === 'librarian') ? 'block' : 'none';
            
            if (r !== 'student') {
                var el = document.getElementById('rg-deg');
                if(el) { el.value = ''; updateYearOptions(); }
            }
        }

        async function doRegister() {
            var name = document.getElementById('rg-name').value.trim();
            var email = document.getElementById('rg-email').value.trim();
            var phone = document.getElementById('rg-phone').value.trim();
            var roll = document.getElementById('rg-roll').value.trim();
            var empId = document.getElementById('rg-empid') ? document.getElementById('rg-empid').value.trim() : '';
            var dept = document.getElementById('rg-dept').value;
            var deg = document.getElementById('rg-deg') ? document.getElementById('rg-deg').value : '';
            var year = document.getElementById('rg-year') ? document.getElementById('rg-year').value : '';
            var sec = document.getElementById('rg-sec') ? document.getElementById('rg-sec').value.trim().toUpperCase() : '';
            var pass = document.getElementById('rg-pass').value;
            var cpass = document.getElementById('rg-cpass').value;
            
            // Defensive role check
            if (typeof role === 'undefined' || !role) role = 'student';
            if (!name || !email || !pass) return showE('rg-err', 'Please fill all required fields.');
            if (pass !== cpass) return showE('rg-err', 'Passwords do not match.');
            if (pass.length < 6) return showE('rg-err', 'Password must be at least 6 characters.');
            
            try {
                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, phone, roll, empId, dept, deg, year, sec, pass, role })
                });
                let data = {};
                try { data = await res.json(); } catch(jsonErr) { console.error('JSON parse error', jsonErr); }
                
                if (!res.ok) return showE('rg-err', data.message || 'Registration failed.');
                
                showS('rg-ok', 'Account created successfully! Please sign in.');
                setTimeout(() => gotoPage('pg-login'), 1500);
            } catch (e) {
                console.error('Register error:', e);
                showE('rg-err', 'Connection to server lost. Please try again.');
            }
        }

        async function doLogin() {
            var email = document.getElementById('lg-email').value.trim();
            var pass = document.getElementById('lg-pass').value;
            if (!email || !pass) return showE('lg-err', 'Please enter email and password.');
            
            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, pass })
                });
                
                let user = {};
                try { user = await res.json(); } catch(jsonErr) { console.error('JSON parse error', jsonErr); }

                if (!res.ok) return showE('lg-err', user.message || 'Invalid email or password.');
                
                curUser = user;
                await loadDB();
                var ini2 = ini(user.name);
                if (user.role === 'admin') {
                    if(document.getElementById('adm-av')) document.getElementById('adm-av').textContent = ini2;
                    if(document.getElementById('adm-name')) document.getElementById('adm-name').textContent = user.name;
                    if(typeof admTab === 'function') admTab('dash', document.querySelector('#adm-sb .sb-item'));
                    gotoPage('pg-admin');
                } else if (user.role === 'librarian') {
                    if(document.getElementById('lib-av')) document.getElementById('lib-av').textContent = ini2;
                    if(document.getElementById('lib-name')) document.getElementById('lib-name').textContent = user.name;
                    if(typeof libTab === 'function') libTab('dash', document.querySelector('#lib-sb .sb-item'));
                    gotoPage('pg-librarian');
                } else if (user.role === 'faculty') {
                    if(document.getElementById('fac-av')) document.getElementById('fac-av').textContent = ini2;
                    if(document.getElementById('fac-name')) document.getElementById('fac-name').textContent = user.name;
                    if(document.getElementById('fac-dept')) document.getElementById('fac-dept').textContent = user.dept || 'Department';
                    if(typeof facTab === 'function') facTab('dash', document.querySelector('#fac-sb .sb-item'));
                    gotoPage('pg-faculty');
                } else {
                    if(document.getElementById('stu-av')) document.getElementById('stu-av').textContent = ini2;
                    if(document.getElementById('stu-name')) document.getElementById('stu-name').textContent = user.name;
                    if(document.getElementById('stu-course')) document.getElementById('stu-course').textContent = (user.deg ? user.deg + ' ' : '') + (user.year ? user.year + 'Yr ' : '') + (user.dept || 'Gen');
                    if(typeof stuTab === 'function') stuTab('dash', document.querySelector('#stu-sb .sb-item'));
                    gotoPage('pg-student');
                }
                document.getElementById('lg-email').value = '';
                document.getElementById('lg-pass').value = '';
            } catch (e) {
                console.error('Login error detail:', e);
                showE('lg-err', e.message || 'Connection to server lost. Please check internet.');
            }
        }

        function doLogout() { curUser = null; selBk = null; gotoPage('pg-home') }

        function setActive(sbId, el) {
            document.querySelectorAll('#' + sbId + ' .sb-item').forEach(i => i.classList.remove('on'));
            if (el) el.classList.add('on');
        }

