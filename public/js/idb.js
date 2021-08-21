window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB,
    IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction,
    dbVersion = 1;

let db;
const request = indexedDB.open('Budget Tracker', dbVersion);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createdObjectStore('new_pizza', { autoIncrement: true });
};

request.onsuccess = function (event) {
    console.log('Success creating/accessing IndexedDB database');
    db = event.target.result;

    db.onerror = function (event) {
        console.log('Error creating/accessing IndexedDB database');
        if (navigator.onLine) {
            checkDB();
        }
    };
};

request.onerror = function (event) {
    // log error here
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const dbTransaction = db.transaction(['Budget_Tracker'], 'readwrite');
    const budgetObjectStore = dbTransaction.objectStore('Budget_Tracker');
    //add record to store
    budgetObjectStore.add(record);
};

function checkDB() {
    const dbTransaction = db.transaction(['Budget_Tracker', 'readwrite']);
    const budgetObjectStore = dbTransaction.objectStore('Budget_Tracker');
    const getAllDB = budgetObjectStore.getAll();

    getAllDB.onsuccess = function () {
        if (getAllDB.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAllDB.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => { return response.json })
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    const transaction = db.transaction(['Budget_Tracker'], 'readwrite');
                    const budgetObjectStore = transaction.objectStore('Budget_Tracker');
                    //clear items in store
                    budgetObjectStore.clear();
                })
                .catch(err => {
                    console.log(err);
                })
        }
    };
};

window.addEventListener('online', checkDB);
