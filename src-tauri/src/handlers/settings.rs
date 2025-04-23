use rusqlite::params;
use tauri::State;
use crate::db::AppState;
use serde::Serialize;

// 🔹 Structure de données et fonctions pour les tags globaux
#[derive(Serialize)]
pub struct Tag {
    pub id: i32,
    pub label: String,
}

// Ajouter un tag
#[tauri::command]
pub fn add_tag(state: State<AppState>, label: String) -> Result<(), String> {
    let db = state.db.lock().map_err(|_| "Erreur d'accès DB".to_string())?;

    db.execute(
        "INSERT INTO global_tags (label) VALUES (?1)",
        [label],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn get_tags(state: State<AppState>) -> Result<Vec<Tag>, String> {
    let db = state.db.lock().map_err(|_| "Erreur DB".to_string())?;
    let mut stmt = db.prepare("SELECT id, label FROM global_tags").map_err(|e| e.to_string())?;

    let tags = stmt
        .query_map([], |row| {
            Ok(Tag {
                id: row.get(0)?,
                label: row.get(1)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(tags)
}
// Supprimer un tag
#[tauri::command]
pub fn delete_tag(state: State<AppState>, tag_id: i32) -> Result<(), String> {
    let db = state.db.lock().map_err(|_| "Erreur d'accès DB".to_string())?;

    db.execute("DELETE FROM global_tags WHERE id = ?1", [tag_id])
        .map_err(|e| e.to_string())?;

    Ok(())
}


// 🔹 Structure de données et fonctions pour les citations

#[derive(Serialize)]
pub struct Quote {
    pub id: i32,
    pub text: String,
    pub author: Option<String>,
    pub tags: Vec<String>,
    pub is_favorite: bool,
    pub created_at: String,
}

// Ajouter une citation
#[tauri::command]
pub fn add_quote(state: State<AppState>, text: String, author: Option<String>, tags: Vec<String>, is_favorite:bool) -> Result<(), String> {
    let db = state.db.lock().map_err(|_| "Erreur d'accès DB".to_string())?;
    let tags_json = serde_json::to_string(&tags).map_err(|e| e.to_string())?;
    db.execute(
        "INSERT INTO quotes (text, author, tags, is_favorite, created_at) VALUES (?1, ?2, ?3, ?4, CURRENT_TIMESTAMP)",
        params![text, author, tags_json, is_favorite],).map_err(|e| e.to_string())?;
    Ok(())
}

// Obtenir toutes les citations
#[tauri::command]
pub fn get_quotes(state: State<AppState>) -> Result<Vec<Quote>, String> {
    let db = state.db.lock().map_err(|_| "Erreur d'accès DB".to_string())?;

    let mut stmt = db
        .prepare("SELECT id, text, author, tags, is_favorite, created_at FROM quotes")
        .map_err(|e| e.to_string())?;

    let quotes_iter = stmt.query_map([], |row| {
        Ok(Quote {
            id: row.get(0)?,
            text: row.get(1)?,
            author: row.get(2)?,
            tags: serde_json::from_str(&row.get::<_, String>(3)?).unwrap_or_default(),
            is_favorite: row.get(4)?,
            created_at: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut quotes = Vec::new();
    for quote in quotes_iter {
        quotes.push(quote.map_err(|e| e.to_string())?);
    }

    Ok(quotes)
}

// Supprimer une citation
#[tauri::command]
pub fn delete_quote(state: State<AppState>, quote_id: i32) -> Result<(), String> {
    let db = state.db.lock().map_err(|_| "Erreur d'accès DB".to_string())?;

    db.execute("DELETE FROM quotes WHERE id = ?1", params![quote_id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

// Mettre une citation en favori
#[tauri::command]
pub fn toggle_favorite_quote(state: State<AppState>, quote_id: i32, is_favorite: bool) -> Result<(), String> {
    let db = state.db.lock().map_err(|_| "Erreur d'accès DB".to_string())?;

    db.execute(
        "UPDATE quotes SET is_favorite = ?1 WHERE id = ?2",
        params![is_favorite, quote_id],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn get_quote_by_id(state: State<AppState>, quote_id: i32) -> Result<Quote, String> {
    let db = state.db.lock().map_err(|_| "Erreur accès DB")?;
    let mut stmt = db.prepare("SELECT * FROM quotes WHERE id = ?1").map_err(|e| e.to_string())?;
    let quote = stmt.query_row([quote_id], |row| {
        Ok(Quote {
            id: row.get(0)?,
            text: row.get(1)?,
            author: row.get(2)?,
            tags: serde_json::from_str(&row.get::<_, String>(3)?).unwrap_or_default(),
            is_favorite: row.get(4)?,
            created_at: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?;
    Ok(quote)
}
