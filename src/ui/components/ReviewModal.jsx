import React from "react";
import { getEmojiFromLabel } from "../utils/moods";
import { formatLongDate } from "../utils/date";

const ReviewDetailModal = ({ review, onClose }) => {
  if (!review) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>🛞 Bilan introspectif</h2>
        <p><strong>Titre :</strong> {review.title}</p>
        <p><strong>Période :</strong> du {formatLongDate(review.start_date)} au {formatLongDate(review.end_date)}</p>
        {review.quote && <blockquote className="modal-quote">{review.quote}</blockquote>}
        
        <div className="modal-section">
          <strong>📚 Leçons retenues :</strong>
          <p>{review.learnings}</p>
        </div>
        
        <div className="modal-section">
          <strong>⭐ Moments forts :</strong>
          <p> {review.highlights}</p>
        </div>
        
        <div className="modal-section">
          <strong>🧭 Réflexion sur l'alignement :</strong>
          <p> {review.alignment_reflection}</p>
        </div>

        <div className="modal-section">
          <strong>🙏 Points de gratitude :</strong>
          <p>{review.gratitude_points}</p>
        </div>

        <div className="modal-section">
          <strong>🎭 Émotion dominante :</strong>
          <p>{getEmojiFromLabel(review.dominant_emotion)} {review.dominant_emotion}</p>
        </div>
        
        <div className="entry-tags-container">
          {review.tags.map((tag, index) => (
              <span key={index} className="entry-tag">#{tag}</span>
          ))}
        </div>

      </div>
    </div>
  );
};

export default ReviewDetailModal;
