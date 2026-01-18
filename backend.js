// Backend DB - SQL Implementation using Alasql
const DB_NAME = 'zero_waste_sql_db';
const TABLE_NAME = 'inventory';

class BackendDB {
    constructor() {
        this._initSQL();
    }

    _initSQL() {
        // 1. Initialize Database
        alasql(`CREATE localStorage DATABASE IF NOT EXISTS ${DB_NAME}`);
        alasql(`ATTACH localStorage DATABASE ${DB_NAME}`);
        alasql(`USE ${DB_NAME}`);

        // --- MIGRATION LOGIC ---
        // We suspect the table schema is out of sync (missing quantity column).
        // Best approach: Read all, Drop, Re-Create, Migrate Data.

        let existingData = [];
        try {
            // Check if table exists
            const search = alasql(`SHOW TABLES FROM ${DB_NAME} LIKE '${TABLE_NAME}'`);
            if (search.length > 0) {
                // Read everything
                existingData = alasql(`SELECT * FROM ${TABLE_NAME}`);
                // Drop old table to force schema update
                alasql(`DROP TABLE ${TABLE_NAME}`);
            }
        } catch (e) {
            console.warn("Migration read error (ignore if first run):", e);
        }

        // 2. Create Table (Correct 5-column Schema)
        alasql(`CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
            id STRING, 
            name STRING, 
            quantity STRING,
            isPriority BOOLEAN, 
            addedAt STRING
        )`);

        // 3. Restore Data (with quantity defaults)
        if (existingData.length > 0) {
            console.log(`Migrating ${existingData.length} items to new schema...`);
            existingData.forEach(item => {
                // Map old columns if needed? 
                // Mostly likely current objects are fine or just missing quantity property.
                // If positional insert was used before, data might be messy, but names likely survived.
                // We re-use addItem logic logic or raw insert?
                // Raw insert is safer to match schema exactly.

                const safeName = (item.name || "Unknown").replace(/'/g, "''");
                const safeQty = (item.quantity || "1").replace(/'/g, "''"); // Default to 1 if missing
                const prio = !!item.isPriority;
                const date = item.addedAt || new Date().toISOString();
                const id = item.id || Date.now().toString(36) + Math.random().toString(36).substr(2);

                alasql(`INSERT INTO ${TABLE_NAME} VALUES ('${id}', '${safeName}', '${safeQty}', ${prio}, '${date}')`);
            });
        }

        console.log("SQL Database Initialized & Schema Verified");
    }

    // --- Public API (SQL Mapped) ---

    getAllItems() {
        try {
            return alasql(`SELECT * FROM ${TABLE_NAME} ORDER BY addedAt DESC`);
        } catch (e) {
            console.error("SQL Select Error:", e);
            return [];
        }
    }

    addItem(name, quantity = "1", isPriority = false) {
        // Check for duplicate (SQL Query)
        const safeName = name.replace(/'/g, "''"); // Escape quotes
        const safeQty = (quantity || "1").replace(/'/g, "''");

        const exists = alasql(`SELECT * FROM ${TABLE_NAME} WHERE LOWER(name) = LOWER('${safeName}')`);

        if (exists.length > 0) {
            // Update
            alasql(`UPDATE ${TABLE_NAME} SET quantity = '${safeQty}', isPriority = ${isPriority}, addedAt = '${new Date().toISOString()}' WHERE LOWER(name) = LOWER('${safeName}')`);
            return exists[0];
        } else {
            // Insert
            const newItem = {
                id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                name: name.charAt(0).toUpperCase() + name.slice(1),
                quantity: safeQty,
                isPriority: isPriority,
                addedAt: new Date().toISOString()
            };

            alasql(`INSERT INTO ${TABLE_NAME} VALUES ('${newItem.id}', '${newItem.name.replace(/'/g, "''")}', '${newItem.quantity}', ${isPriority}, '${newItem.addedAt}')`);
            return newItem;
        }
    }

    removeItem(name) {
        const safeName = name.replace(/'/g, "''");
        alasql(`DELETE FROM ${TABLE_NAME} WHERE name = '${safeName}'`);
    }

    togglePriority(name) {
        const safeName = name.replace(/'/g, "''");
        const item = alasql(`SELECT * FROM ${TABLE_NAME} WHERE name = '${safeName}'`)[0];
        if (item) {
            const newStatus = !item.isPriority;
            alasql(`UPDATE ${TABLE_NAME} SET isPriority = ${newStatus} WHERE name = '${safeName}'`);
        }
    }

    clearAll() {
        alasql(`DELETE FROM ${TABLE_NAME}`);
        console.log("Database cleared.");
    }
}

// Singleton Instance
const InventoryDB = new BackendDB();
console.log("SQL Backend Loaded. Current Items:", InventoryDB.getAllItems().length);
