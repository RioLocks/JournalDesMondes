import React from "react";
import { getEmojiFromLabel } from "../utils/moods";
import { formatLongDate } from "../utils/date";

const EntryDetailModal = ({ entry, onClose }) => {
  if (!entry) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>📅 Journal du {formatLongDate(entry.date)}</h2>
        {entry.quote && <blockquote className="modal-quote">{entry.quote}</blockquote>}
        <div className="modal-section">
          <strong>🌤️ Humeur du matin :</strong>
          <p>{getEmojiFromLabel(entry.morning_mood)} {entry.morning_mood} à {entry.morning_mood_level} sur 10</p>
        </div>

        <div className="modal-section">
          <strong>💭 Pensées et intentions :</strong>
          <p>{entry.intentions}</p>
        </div>
       
        
        {Array.isArray(entry.daily_goals) ? (
          <div className="modal-section">
            <strong>📌 Objectifs :</strong>
            <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
              {entry.daily_goals.map((goal, index) => (
                <li key={index}>
                  {goal.done ? "✅" : "⬜"} {goal.text}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p><strong>📌 Objectifs :</strong> {entry.daily_goals}</p>
        )}


        {entry.is_evening_completed && (
          <>
            <div className="modal-section">
              <strong>🌙 Humeur du soir :</strong>
              <p>{getEmojiFromLabel(entry.evening_mood)} {entry.evening_mood} à {entry.evening_mood_level} sur 10</p>
            </div>

            <div className="modal-section">
              <strong>🧠 Bilan du jour :</strong>
              <p>{entry.daily_review}</p>
            </div>

            <div className="modal-section">
              <strong>📚 Leçons retenues :</strong>
              <p>{entry.learnings}</p>
            </div>

            <div className="modal-section">
              <strong>🙏 Gratitude :</strong>
              <p>{entry.gratitude_notes}</p>
            </div>
            
          </>
        )}

        <div className="entry-tags-container">
          {entry.tags.map((tag, index) => (
            <span key={index} className="entry-tag">#{tag}</span>
          ))}
        </div>

      </div>
    </div>
  );
};

export default EntryDetailModal;