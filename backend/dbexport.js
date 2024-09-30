const sqlite3 = require('sqlite3').verbose();

// Ścieżka do bazy danych SQLite
const dbPath = '../data/mydatabse.db';

// Połączenie z bazą danych
let db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error("Nie można otworzyć bazy danych:", err.message);
    } else {
        console.log("Połączono z bazą danych SQLite.");
    }
});

// Funkcja do pobrania struktury bazy danych
const getDatabaseStructure = (db) => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT name FROM sqlite_master WHERE type='table'`, [], (err, tables) => {
            if (err) {
                return reject(err);
            }
            
            const tablePromises = tables.map(table => {
                return new Promise((resolve, reject) => {
                    db.all(`PRAGMA table_info(${table.name})`, [], (err, columns) => {
                        if (err) {
                            return reject(err);
                        }

                        const tableInfo = {
                            tableName: table.name,
                            columns: columns.map(column => ({
                                name: column.name,
                                type: column.type,
                                notnull: column.notnull,
                                dflt_value: column.dflt_value,
                                pk: column.pk
                            }))
                        };
                        
                        resolve(tableInfo);
                    });
                });
            });

            Promise.all(tablePromises)
                .then(results => resolve(results))
                .catch(err => reject(err));
        });
    });
};

// Wywołanie funkcji i przedstawienie wyniku jako JSON
getDatabaseStructure(db)
    .then(structure => {
        console.log(JSON.stringify(structure, null, 2));
        db.close((err) => {
            if (err) {
                console.error("Błąd podczas zamykania bazy danych:", err.message);
            }
        });
    })
    .catch(err => {
        console.error("Błąd:", err.message);
        db.close();
    });
