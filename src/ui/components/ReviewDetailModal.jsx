import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faEdit, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import "./css/ReviewDetailModal.css";

const ReviewDetailModal = ({ review, onClose, onSave, availableMoods}) => {
  const [editMode, setEditMode] = useState(false);
  const [editedReview, setEditedReview] = useState({ ...review });

  const handleChange = (field, value) => {
    setEditedReview((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(editedReview);
    setEditMode(false);
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
    });
  };

  const getEmojiFromLabel = (label) => {
    const mood = availableMoods.find((m) => m.label === label);
    return mood ? mood.emoji : "🌱";
  };


  if (!review) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
            <h2>
                {review.is_relevant && (
                    <FontAwesomeIcon icon={faStar} className="highlight-icon" title="Bilan marquant" />
                )}
                {review.title}
            </h2>
            <div className="modal-actions">
            {editMode ? (
                <>
                <button title="Valider" onClick={handleSave}>
                    <FontAwesomeIcon icon={faCheck} />
                </button>
                <button title="Annuler l’édition" onClick={() => setEditMode(false)}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                </>
            ) : (
                <>
                <button title="Éditer" onClick={() => setEditMode(true)}>
                    <FontAwesomeIcon icon={faEdit} />
                </button>
                <button title="Fermer" onClick={onClose}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                </>
            )}
            </div>
        </div>

        <div className="modal-body">
            <p><strong>Période :</strong> du {formatDate(review.start_date)} au {formatDate(review.end_date)}</p>

            <p><strong>Émotion dominante :</strong> {getEmojiFromLabel(review.dominant_emotion)} {review.dominant_emotion}</p>


            {review.quote && <blockquote className="modal-quote">{review.quote}</blockquote>}

            <div className="modal-section">
                <strong>Apprentissages :</strong>
                {editMode ? (
                <textarea
                    value={editedReview.learnings}
                    onChange={(e) => handleChange("learnings", e.target.value)}
                />
                ) : (
                <p>{review.learnings}</p>
                )}
            </div>

            <div className="modal-section">
                <strong>Moments forts :</strong>
                {editMode ? (
                <textarea
                    value={editedReview.highlights}
                    onChange={(e) => handleChange("highlights", e.target.value)}
                />
                ) : (
                <p>{review.highlights}</p>
                )}
            </div>

            <div className="modal-section">
                <strong>Alignement avec mes valeurs :</strong>
                {editMode ? (
                <textarea
                    value={editedReview.alignment_reflection}
                    onChange={(e) => handleChange("alignment_reflection", e.target.value)}
                />
                ) : (
                <p>{review.alignment_reflection}</p>
                )}
            </div>

            {review.gratitude_points && (
                <div className="modal-section">
                <strong>Gratitude :</strong>
                {editMode ? (
                    <textarea
                        value={editedReview.gratitude_points}
                        onChange={(e) => handleChange("gratitude_points", e.target.value)}
                    />
                    ) : (
                    <p>{review.gratitude_points}</p>
                    )}
                </div>
            )}

            {review.tags && (
            <div className="modal-section">
                <strong>Tags :</strong>
                <div className="tag-list">
                {typeof review.tags === "string"
                    ? review.tags.split(",").map((tag, index) => (
                        <span key={index} className="tag">
                            {tag.trim()}
                        </span>
                        ))
                    : review.tags.map((tag, index) => (
                        <span key={index} className="tag">
                            #{tag}
                        </span>
                        ))}
                </div>
            </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ReviewDetailModal;