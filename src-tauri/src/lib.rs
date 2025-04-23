mod db;
use db::AppState;
use std::sync::Mutex;

mod handlers;
use handlers::journal::{add_entry, get_entries, update_entry_goals, delete_entry, complete_evening_entry,
    update_mood, update_entry_field};
use handlers::review::{add_review, get_reviews, delete_review, update_review};
use handlers::settings::{add_tag, get_tags, delete_tag, add_quote, get_quotes, delete_quote, toggle_favorite_quote,
get_quote_by_id};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let db_conn = db::init_db().expect("Échec de l'initialisation de la base de données");
    tauri::Builder::default()
        .manage(AppState {
            db: Mutex::new(db_conn),
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            // Journal
            add_entry,
            get_entries,
            update_entry_field,
            update_entry_goals,
            delete_entry,
            complete_evening_entry,
            update_mood,

            // Review
            add_review,
            get_reviews,
            delete_review,
            update_review,

            // Settings
            add_tag,
            get_tags,
            delete_tag,
            add_quote,
            get_quotes,
            delete_quote,
            toggle_favorite_quote,
            get_quote_by_id
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
