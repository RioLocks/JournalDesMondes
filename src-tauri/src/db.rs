use rusqlite::{Connection, Result};
use std::sync::Mutex;

// 🔹 Définition de l’état global contenant la connexion SQLite
pub struct AppState {
    pub db: Mutex<Connection>,
}

// 🔹 Fonction d'initialisation de la base de données
pub fn init_db() -> Result<Connection> {
    let conn = Connection::open("journaldesmondes.db")?;
    println!("🔹 Initialisation de la base de données...");

    // 🗓️ Journal quotidien
    conn.execute(
        "CREATE TABLE IF NOT EXISTS entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT UNIQUE NOT NULL,

            morning_mood TEXT NOT NULL,
            morning_mood_level INTEGER NOT NULL,
            intentions TEXT NOT NULL,
            daily_goals TEXT NOT NULL,
            quote_id INTEGER,

            evening_mood TEXT,
            evening_mood_level INTEGER,
            daily_review TEXT,
            learnings TEXT,
            gratitude_notes TEXT,

            tags TEXT NOT NULL,

            is_evening_completed BOOLEAN,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // 🏷️ Tags globaux
    conn.execute(
        "CREATE TABLE IF NOT EXISTS global_tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            label TEXT NOT NULL UNIQUE
        )",
        [],
    )?;

    // 📘 Bilans introspectifs
    conn.execute(
        "CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,

            learnings TEXT NOT NULL,
            highlights TEXT NOT NULL,
            alignment_reflection TEXT NOT NULL,
            quote_id INTEGER,
            gratitude_points TEXT NOT NULL,

            tags TEXT NOT NULL,
            dominant_emotion TEXT NOT NULL,

            is_relevant BOOLEAN DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // 📚 Bibliothèque de citations inspirantes
    conn.execute(
        "CREATE TABLE IF NOT EXISTS quotes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            author TEXT,
            tags TEXT,
            is_favorite BOOLEAN DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    println!("✅ Base de données initialisée avec succès !");
    Ok(conn)
}

