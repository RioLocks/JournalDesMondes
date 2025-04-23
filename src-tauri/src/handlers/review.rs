use tauri::State;
use crate::db::AppState;
use rusqlite::params;
use serde::{Serialize, Deserialize};
use serde_json;

// 🔹 Définition de la structure `Review`
#[derive(Serialize, Deserialize)]
pub struct Review {
    pub id: i32,
    pub title: String,
    pub start_date: String,
    pub end_date: String,
    pub learnings: String,
    pub highlights: String,
    pub alignment_reflection: String,
    pub quote_id: i32,
    pub gratitude_points: String,
    pub tags: Vec<String>,
    pub dominant_emotion: String,
    pub is_relevant: bool,
    pub created_at: String,
    pub updated_at: String,
}

// Ajout d'un bilan
#[tauri::command]
pub fn add_review(
    state: State<AppState>,
    title: String,
    start_date: String,
    end_date: String,
    learnings: String,
    highlights: String,
    alignment_reflection: String,
    quote_id: i32,
    gratitude_points: String,
    tags: Vec<String>,
    dominant_emotion: String,
    is_relevant: bool,
) -> Result<(), String> {
    let db = state
        .db
        .lock()
        .map_err(|_| "Erreur lors de l'accès à la base de données".to_string())?;

    let tags_json = serde_json::to_string(&tags).map_err(|e| e.to_string())?;

    db.execute(
        "INSERT INTO reviews (title, start_date, end_date, learnings, highlights, alignment_reflection, quote_id, gratitude_points, tags, dominant_emotion, is_relevant, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
        params![
            title,
            start_date,
            end_date,
            learnings,
            highlights,
            alignment_reflection,
            quote_id,
            gratitude_points,
            tags_json,
            dominant_emotion,
            is_relevant,
        ],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

// Obtenir les bilans
#[tauri::command]
pub fn get_reviews(state: State<AppState>) -> Result<Vec<Review>, String> {
    let db = state
        .db
        .lock()
        .map_err(|_| "Erreur lors de l'accès à la base de données".to_string())?;

    let mut stmt = db.prepare("SELECT * FROM reviews ORDER BY created_at DESC").map_err(|e| e.to_string())?;

    let reviews_iter = stmt.query_map([], |row| {
        Ok(Review{
            id: row.get(0)?,
            title: row.get(1)?,
            start_date: row.get(2)?,
            end_date: row.get(3)?,
            learnings: row.get(4)?,
            highlights: row.get(5)?,
            alignment_reflection: row.get(6)?,
            quote_id: row.get(7)?,
            gratitude_points: row.get(8)?,
            tags: serde_json::from_str(&row.get::<_, String>(9)?).unwrap_or_default(),
            dominant_emotion: row.get(10)?,
            is_relevant: row.get(11)?,
            created_at: row.get(12)?,
            updated_at: row.get(13)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut reviews = Vec::new();
    for review in reviews_iter {
        reviews.push(review.map_err(|e| e.to_string())?);
    }

    Ok(reviews)

}

// Supprimer un bilan
#[tauri::command]
pub fn delete_review(state: State<AppState>, id: i32) -> Result<(), String> {
    let db = state
        .db
        .lock()
        .map_err(|_| "Erreur lors de l'accès à la base de données".to_string())?;

    db.execute("DELETE FROM reviews WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

// Mettre à jour un bilan
#[tauri::command]
pub fn update_review(
    state: State<AppState>,
    id: i32,
    title: String,
    start_date: String,
    end_date: String,
    learnings: String,
    highlights: String,
    alignment_reflection: String,
    quote_id: i32,
    gratitude_points: String,
    tags: Vec<String>,
    dominant_emotion: String,
    is_relevant: bool,
) -> Result<(), String> {
    let db = state
        .db
        .lock()
        .map_err(|_| "Erreur lors de l'accès à la base de données".to_string())?;

    let tags_json = serde_json::to_string(&tags).map_err(|e| e.to_string())?;

    db.execute(
        "UPDATE reviews
        SET title = ?1,
            start_date = ?2,
            end_date = ?3,
            learnings = ?4,
            highlights = ?5,
            alignment_reflection = ?6,
            quote_id = ?7,
            gratitude_points = ?8,
            tags = ?9,
            dominant_emotion = ?10,
            is_relevant = ?11,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?12",
        params![
            title,
            start_date,
            end_date,
            learnings,
            highlights,
            alignment_reflection,
            quote_id,
            gratitude_points,
            tags_json,
            dominant_emotion,
            is_relevant,
            id,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}
