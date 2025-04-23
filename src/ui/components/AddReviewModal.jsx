import React, {useState} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faPlus,
  faTrash,
  faStar as solidStar,
} from "@fortawesome/free-solid-svg-icons";
import QuotePickerPanel from "./QuotePickerPanel";
import "./css/AddReviewModal.css";

const AddReviewModal = ({
  onClose,
  title, setTitle,
  startDate, setStartDate,
  endDate, setEndDate,
  learnings, setLearnings,
  highlights, setHighlights,
  alignmentReflection, setAlignmentReflection,
  selectedQuote, setSelectedQuote,
  gratitudePoints, setGratitudePoints,
  tags, setTags,
  selectedTag, setSelectedTag,
  dominantEmotion, setDominantEmotion,
  isRelevant, setIsRelevant,
  availableTags,
  availableEmotions,
  addReview
}) => {
  const [showQuotePanel, setShowQuotePanel] = useState(false);
  const quoteTextToDisplay = selectedQuote
  ? `"${selectedQuote.text}"${selectedQuote.author ? ` — ${selectedQuote.author}` : ""}`
  : "";

  return (
    <div onClick={onClose} className="add-modal-overlay">
      <div className="add-modal-wrapper">
        <div onClick={(e) => e.stopPropagation()} className="add-modal-content">
          <button className="close-add-modal-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>

          <div className="add-modal-item">
            <h2 className="add-modal-title">Ajouter un bilan</h2>
          </div>

          <div className="add-modal-item">
            <label>Titre poétique</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="add-modal-item">
            <label>Période couverte</label>
            <div style={{ display: "flex", gap: "1rem" }}>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
          </div>

          <div className="add-modal-item">
            <label>Qu’ai-je appris durant cette période ?</label>
            <textarea value={learnings} onChange={(e) => setLearnings(e.target.value)} required />
          </div>

          <div className="add-modal-item">
            <label>Moments forts ou défis rencontrés</label>
            <textarea value={highlights} onChange={(e) => setHighlights(e.target.value)} required />
          </div>

          <div className="add-modal-item">
            <label>En accord avec mes valeurs et objectifs ?</label>
            <textarea value={alignmentReflection} onChange={(e) => setAlignmentReflection(e.target.value)} required />
          </div>

          <div className="add-modal-item">
            <label>Citation du inspirante</label>
            {selectedQuote ? (
              <div className="selected-quote-display">
                <input type="text" value={quoteTextToDisplay} readOnly />
                {/* <p>{quoteTextToDisplay}</p> */}
                <button title="Supprimer" className="remove-quote" onClick={() => setSelectedQuote(null)}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            ) : (
              <span className="quote-invite-wrapper" onClick={() => setShowQuotePanel(true)}>
                <p className="quote-invite">Choisis une citation inspirante</p>📖
              </span>
              
            )}
          </div>

          {showQuotePanel && (
            <QuotePickerPanel
              tags={tags}
              onSelect={(quote) => {
                setSelectedQuote(quote);
                setShowQuotePanel(false);
              }}
              onClose={() => setShowQuotePanel(false)}
            />
          )}


          <div className="add-modal-item">
            <label>Points de gratitude</label>
            <textarea value={gratitudePoints} onChange={(e) => setGratitudePoints(e.target.value)} />
          </div>

          <div className="add-modal-item">
            <label>Tags associés</label>
            <div className="add-tag-selector">
              <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)}>
                <option value="">-- Choisir un tag --</option>
                {availableTags.map((tag) => (
                  <option key={tag.id} value={tag.label}>{tag.label}</option>
                ))}
              </select>
              <button
                type="button"
                className="add-item"
                onClick={() => {
                  if (selectedTag && !tags.includes(selectedTag)) {
                    setTags([...tags, selectedTag]);
                    setSelectedTag("");
                  }
                }}
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
            <ul className="selected-tags-list">
              {tags.map((tag, index) => (
                <li key={index}>
                  #{tag}
                  <button
                    className="delete-item"
                    type="button"
                    onClick={() => {
                      const updated = tags.filter((_, i) => i !== index);
                      setTags(updated);
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="add-modal-item">
            <label>Émotion dominante</label>
            <select value={dominantEmotion} onChange={(e) => setDominantEmotion(e.target.value)}>
              <option value="">-- Choisir une émotion --</option>
              {availableEmotions.map((emo) => (
                <option key={emo.label} value={emo.label}>
                  {emo.emoji} {emo.label}
                </option>
              ))}
            </select>
          </div>

          <div className="add-modal-item">
            <label>
              <input
                type="checkbox"
                checked={isRelevant}
                onChange={() => setIsRelevant(!isRelevant)}
              />
              &nbsp;Marquer comme significatif
              <FontAwesomeIcon icon={solidStar} style={{ marginLeft: "6px" }} />
            </label>
          </div>

          <button className="add-entry-btn" onClick={addReview}>
            <FontAwesomeIcon icon={faPlus} style={{ marginRight: "6px" }} />
            Ajouter le bilan
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddReviewModal;
