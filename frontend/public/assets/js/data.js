var role = 'student', curUser = null, selBk = null;
var EMOJS = ['💻', '📐', '⚡', '🌊', '⚗️', '📡', '🔥', '⚛️', '🗄️', '📊', '🧮', '🌍', '📝', '🔬', '🏗️'];

var DB = {
    users: [],
    books: [],
    txns: [],
    recommendations: [],
    requests: [],
    payments: []
};

async function loadDB() {
    try {
        const res = await fetch('/api/db');
        if (!res.ok) throw new Error('Failed to load DB state: ' + res.status);
        const data = await res.json();
        if (data) {
            DB.users = (data.users || []).map(u => ({ ...u, id: u.id || u._id || '' }));
            DB.books = data.books || [];
            DB.txns = data.txns || [];
            DB.recommendations = data.recommendations || [];
            DB.requests = data.requests || [];
            DB.payments = data.payments || [];
        }
    } catch (e) {
        console.error('Failed to load database state:', e);
    }
}

async function saveDB() {
    try {
        const payload = {
            books: DB.books,
            txns: DB.txns,
            recommendations: DB.recommendations,
            requests: DB.requests,
            payments: DB.payments
        };
        const res = await fetch('/api/db', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to save DB state: ' + res.status);
    } catch (e) {
        console.error('Failed to save database state:', e);
    }
}
