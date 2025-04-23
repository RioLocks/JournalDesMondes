import React, { useState } from "react";
import "./css/AddEntryModal.css";
import QuotePickerPanel from "./QuotePickerPanel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";

const AddEntryModal = ({
  onClose,
  date, setDate,
  morningMood, setMorningMood,
  morningMoodLevel, setMorningMoodLevel,
  intentions, setIntentions,
  dailyGoals, setDailyGoals,
  newGoal, setNewGoal,
  selectedQuote, setSelectedQuote,
  tags, setTags,
  selectedTag, setSelectedTag,
  availableMoods,
  availableTags,
  getRandomPlaceholder,
  addGoal,
  removeGoalFromList,
  addEntry
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
            <h2 className="add-modal-title">Ajouter une entrée</h2>
          </div>

          <div className="add-modal-item">
            <label>Journal du : </label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div className="mood-inline-line">
            <label className="mood-inline-label">
              <strong>Aujourd’hui tu te sens&nbsp;</strong>
              <select
                className="mood-select"
                value={morningMood}
                onChange={(e) => setMorningMood(e.target.value)}
              >
                <option value="">🤍</option>
                {availableMoods.map((mood) => (
                  <option key={mood.label} value={mood.label}>
                    {mood.emoji}
                  </option>
                ))}
              </select>
              &nbsp;
              <strong className="mood-text">{morningMood || "sélectionne une humeur"}</strong>
              &nbsp;à
              <input
                className="mood-inline-level"
                type="number"
                min="1"
                max="10"
                value={morningMoodLevel}
                onChange={(e) => setMorningMoodLevel(Number(e.target.value))}
              />
              &nbsp;sur 10
            </label>
          </div>

          <div className="add-modal-item">
            <label>Ecris tes intentions : </label>
            <textarea
              className="writing-field"
              placeholder={getRandomPlaceholder("intentions")}
              value={intentions}
              onChange={(e) => setIntentions(e.target.value)}
              required
            />
          </div>

          <div className="add-modal-item">
            <label>Que concerne cette entrée ?</label>
            <div className="add-tag-selector">
              <select
                className="add-tag-select"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
              >
                <option value="">-- Choisis un tag --</option>
                {availableTags.map((tag) => (
                  <option key={tag.id} value={tag.label}>
                    {tag.label}
                  </option>
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
            <label>Objectifs du jour</label>
            <div className="add-modal-targets-container">
              <input
                type="text"
                placeholder="Nouvel objectif"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
              />
              <button className="add-item" onClick={addGoal}>
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>

            <ul>
              {dailyGoals.map((goal, index) => (
                <li key={index}>
                  <span>{goal.text}</span>
                  <button onClick={() => removeGoalFromList(index)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="add-modal-item">
            <label>Citation du jour</label>
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
              onClose={() => setShowQuotePanel(false)}
              onSelect={(quote) => {
                setSelectedQuote(quote); // on garde l’objet complet
                setShowQuotePanel(false);
              }}
            />

          )}

          <button
            className="add-entry-btn"
            onClick={addEntry}
          >
            Ajouter entrée
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEntryModal;
