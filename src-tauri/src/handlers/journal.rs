use tauri::State;
use crate::db::AppState;
use rusqlite::params;
use serde::{Serialize, Deserialize};
use serde_json;

// 🔹 Définition de la structure `Entry`
#[derive(Serialize, Deserialize)]
pub struct Entry {
    pub id: i32,
    pub date: String,

    // Matin
    pub morning_mood: String,
    pub morning_mood_level: i32,
    pub intentions: String,
    pub daily_goals: Vec<Goal>,
    pub quote_id: Option<i32>,

    // Soir
    pub evening_mood: Option<String>,
    pub evening_mood_level: Option<i32>,
    pub daily_review: Option<String>,
    pub learnings: Option<String>,
    pub gratitude_notes: Option<String>,

    // Meta
    pub tags: Vec<String>,
    pub is_evening_completed: Option<bool>,
    pub created_at: String,
    pub updated_at: String,
}


#[derive(Serialize, Deserialize)]
pub struct Goal {
    pub text: String,
    pub done: bool,
}


// 🔹 Ajouter une entrée
#[tauri::command]
pub fn add_entry(
    state: State<AppState>,
    date: String,
    morning_mood: String,
    morning_mood_level: i32,
    intentions: String,
    daily_goals: Vec<Goal>,
    quote_id: Option<i32>,
    tags: Vec<String>,
    is_evening_completed: Option<bool>,
) -> Result<(), String> {
    let db = state.db.lock().map_err(|_| "Erreur lors de l'accès à la base de données".to_string())?;

    let tags_json = serde_json::to_string(&tags).map_err(|e| e.to_string())?;
    let daily_goals_json = serde_json::to_string(&daily_goals).map_err(|e| e.to_string())?;
    let is_completed = is_evening_completed.unwrap_or(false);


    db.execute(
        "INSERT INTO entries (
            date, morning_mood, morning_mood_level, intentions, daily_goals, quote_id,
            tags, is_evening_completed, created_at, updated_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
        params![
            date,
            morning_mood,
            morning_mood_level,
            intentions,
            daily_goals_json,
            quote_id,
            tags_json,
            is_completed,
        ],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

// 🔹 Obtenir toutes les entrées
#[tauri::command]
pub fn get_entries(state: State<AppState>) -> Result<Vec<Entry>, String> {
    let db = state.db.lock().map_err(|_| "Erreur lors de l'accès à la base de données".to_string())?;

    let mut stmt = db.prepare(
        "SELECT 
            id, date, morning_mood, morning_mood_level, intentions, daily_goals, quote_id,
            evening_mood, evening_mood_level, daily_review, learnings, gratitude_notes,
            tags, is_evening_completed, created_at, updated_at 
        FROM entries"
    ).map_err(|e| e.to_string())?;

    let entries_iter = stmt.query_map([], |row| {
        Ok(Entry {
            id: row.get(0)?,
            date: row.get(1)?,
            morning_mood: row.get(2)?,
            morning_mood_level: row.get(3)?,
            intentions: row.get(4)?,
            daily_goals: serde_json::from_str(&row.get::<_, String>(5)?).unwrap_or_default(),
            quote_id: row.get(6)?,
            evening_mood: row.get(7)?,
            evening_mood_level: row.get(8)?,
            daily_review: row.get(9)?,
            learnings: row.get(10)?,
            gratitude_notes: row.get(11)?,
            tags: serde_json::from_str(&row.get::<_, String>(12)?).unwrap_or_default(),
            is_evening_completed: row.get(13)?,
            created_at: row.get(14)?,
            updated_at: row.get(15)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut entries = Vec::new();
    for entry in entries_iter {
        entries.push(entry.map_err(|e| e.to_string())?);
    }

    Ok(entries)
}


// Objectifs journaliers
#[tauri::command]
pub fn update_entry_goals(state: State<AppState>, entry_id: i32, daily_goals: Vec<Goal>) -> Result<(), String> {
    let db = state.db.lock().map_err(|_| "Erreur lors de l'accès à la base de données".to_string())?;

    let daily_goals_json = serde_json::to_string(&daily_goals).map_err(|e| e.to_string())?;

    db.execute(
        "UPDATE entries SET daily_goals = ?1 WHERE id = ?2",
        params![daily_goals_json, entry_id],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

// Supprimer une entrée
#[tauri::command]
pub fn delete_entry(state: State<AppState>, entry_id: i32) -> Result<(), String> {
    let db = state
        .db
        .lock()
        .map_err(|_| "Erreur lors de l'accès à la base de données".to_string())?;

    db.execute("DELETE FROM entries WHERE id = ?1", params![entry_id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

// Compléter une entrée 
#[tauri::command]
pub fn complete_evening_entry(
    state: State<AppState>,
    entry_id: i32,
    evening_mood: String,
    evening_mood_level: i32,
    daily_review: String,
    learnings: String,
    gratitude_notes: String,
    is_evening_completed: Option<bool>,
) -> Result<(), String> {
    let db = state.db.lock().map_err(|_| "Erreur lors de l'accès à la base de données")?;

    db.execute(
        "UPDATE entries SET 
            evening_mood = ?1,
            evening_mood_level = ?2,
            daily_review = ?3,
            learnings = ?4,
            gratitude_notes = ?5,
            is_evening_completed = ?6,
            updated_at = CURRENT_TIMESTAMP
         WHERE id = ?7",
        params![
            evening_mood,
            evening_mood_level,
            daily_review,
            learnings,
            gratitude_notes,
            is_evening_completed,
            entry_id
        ],
    ).map_err(|e| e.to_string())?;

    Ok(())
}



// Fonction Rust pour mettre à jour l'humeur (matin ou soir)
#[tauri::command]
pub fn update_mood(
    state: State<AppState>,
    entry_id: i32,
    time_of_day: String, // "morning" ou "evening"
    mood: String,
    mood_level: i32,
) -> Result<(), String> {
    let db = state
        .db
        .lock()
        .map_err(|_| "Erreur lors de l'accès à la base de données".to_string())?;

    let (column_mood, column_level) = match time_of_day.as_str() {
        "morning" => ("morning_mood", "morning_mood_level"),
        "evening" => ("evening_mood", "evening_mood_level"),
        _ => return Err("Valeur invalide pour 'time_of_day' (attendu: 'morning' ou 'evening')".to_string()),
    };

    let query = format!(
        "UPDATE entries SET {} = ?1, {} = ?2, updated_at = CURRENT_TIMESTAMP WHERE id = ?3",
        column_mood, column_level
    );

    db.execute(&query, params![mood, mood_level, entry_id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

// Mis à jour des champs
#[tauri::command]
pub fn update_entry_field(state: State<AppState>, entry_id: i32, field: String, value: String) -> Result<(), String> {
    let db = state.db.lock().map_err(|_| "Erreur d'accès DB")?;

    let query = format!("UPDATE entries SET {} = ?1, updated_at = CURRENT_TIMESTAMP WHERE id = ?2", field);

    db.execute(&query, params![value, entry_id])
        .map_err(|e| e.to_string())?;

    Ok(())
}
