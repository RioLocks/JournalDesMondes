import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPen, faCheck, faTrash } from "@fortawesome/free-solid-svg-icons";
import "./css/EntryFullView.css";

const EntryFullView = ({ entry, onClose, availableMoods }) => {
  const [editingField, setEditingField] = useState(null);
  const [editingGoalIndex, setEditingGoalIndex] = useState(null);
  const [fieldValues, setFieldValues] = useState({});
  const [goals, setGoals] = useState([]);
  const [showEveningForm, setShowEveningForm] = useState(false);
  const [eveningCompleted, setEveningCompleted] = useState(entry.is_evening_completed);
  const [quote, setQuote] = useState(null);


  useEffect(() => {
    setFieldValues({ ...entry });
    setGoals(entry.daily_goals || []);
    setEveningCompleted(entry.is_evening_completed);
  
    if (entry.quote_id) {
      invoke("get_quote_by_id", { quoteId: entry.quote_id })
        .then((result) => setQuote(result))
        .catch((err) => console.error("Erreur chargement citation :", err));
    }
  }, [entry]);
  

  const handleUpdateField = async (field) => {
    try {
      await invoke("update_entry_field", {
        entryId: entry.id,
        field,
        value: fieldValues[field],
      });
      setEditingField(null);
    } catch (error) {
      console.error("Erreur mise à jour champ", error);
    }
  };

  const handleGoalUpdate = async (updatedGoals) => {
    try {
      await invoke("update_entry_goals", {
        entryId: entry.id,
        dailyGoals: updatedGoals,
      });
      setGoals(updatedGoals);
      setEditingGoalIndex(null);
    } catch (error) {
      console.error("Erreur mise à jour objectifs", error);
    }
  };

  const handleCompleteEvening = () => {
    setShowEveningForm(true);
  };

  const handleFinalizeEvening = async () => {
    try {
      await invoke("complete_evening_entry", {
        entryId: entry.id,
        eveningMood: fieldValues.evening_mood,
        eveningMoodLevel: parseInt(fieldValues.evening_mood_level),
        dailyReview: fieldValues.daily_review,
        learnings: fieldValues.learnings,
        gratitudeNotes: fieldValues.gratitude_notes,
        isEveningCompleted: true,
      });
      setShowEveningForm(false);
      setEveningCompleted(true);
      setEditingField(null);
    } catch (error) {
      console.error("Erreur lors de la complétion du soir", error);
    }
  };

  const getEmojiForMood = (label) => {
    const mood = availableMoods.find((m) => m.label === label);
    return mood ? mood.emoji : "❓";
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="entry-full-container">
      <button className="back-btn" onClick={onClose}>
        <FontAwesomeIcon icon={faArrowLeft} /> Retour
      </button>

      <h2 className="entry-full-title">
        📰 Journal du {formatDate(entry.date)}
      </h2>

        <div className="entry-section">
            <div className="entry-section-header">
              <h3>🌅 Ton humeur du matin</h3>
            </div>
            <p>
              Tu te sentais <strong>{entry.morning_mood}</strong> {getEmojiForMood(entry.morning_mood)} 
              à {entry.morning_mood_level} sur 10
            </p>
        </div>

      {/* Intentions */}
      <div className="entry-section entry-section-editable">
        <div className="entry-section-header">
          <h3>💭 Pensées et intentions</h3>
          {editingField !== "intentions" && (
            <button onClick={() => setEditingField("intentions")} className="edit-btn">
              <FontAwesomeIcon icon={faPen} />
            </button>
          )}
        </div>
        {editingField === "intentions" ? (
          <>
            <textarea
              value={fieldValues.intentions || ""}
              onChange={(e) => setFieldValues({ ...fieldValues, intentions: e.target.value })}
            />
            <button className="action-btn" onClick={() => handleUpdateField("intentions")}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </>
        ) : (
          <p>{fieldValues.intentions}</p>
        )}
      </div>

      {/* Objectifs */}
      <div className="entry-section">
        <h3>🎯 Objectifs</h3>
        <ul>
          {goals.map((goal, i) => (
            <li key={i}>
              <input
                type="checkbox"
                checked={goal.done}
                onChange={() => {
                  const updated = [...goals];
                  updated[i].done = !updated[i].done;
                  handleGoalUpdate(updated);
                }}
              />
              {editingGoalIndex === i ? (
                <>
                  <input
                    type="text"
                    value={goal.text}
                    onChange={(e) => {
                      const updated = [...goals];
                      updated[i].text = e.target.value;
                      setGoals(updated);
                    }}
                  />
                  <button onClick={() => handleGoalUpdate(goals)}>
                    <FontAwesomeIcon icon={faCheck} />
                  </button>
                </>
              ) : (
                <span className={goal.done ? "goal-done" : ""}>{goal.text}</span>
              )}
              {editingGoalIndex !== i && (
                <button onClick={() => setEditingGoalIndex(i)}>
                  <FontAwesomeIcon icon={faPen} />
                </button>
              )}
              <button onClick={() => handleGoalUpdate(goals.filter((_, j) => j !== i))}>
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Citation */}
      {quote && (
        <div className="entry-section">
          <h3>💡 Citation</h3>
          <blockquote className="quote-block">« {quote.text} »{quote.author && ` — ${quote.author}`}</blockquote>
        </div>
      )}

      {/* Soir */}
      {eveningCompleted ? (
        <>
          <div className="entry-section">
            <div className="entry-section-header">
              <h3>🌙 Ton humeur du soir</h3>
            </div>
            <p>
              Tu te sentais <strong>{entry.evening_mood}</strong> {getEmojiForMood(entry.evening_mood)} 
              à {entry.evening_mood_level} sur 10
            </p>
          </div>

          {["daily_review", "learnings", "gratitude_notes"].map((field) => (
            <div key={field} className="entry-section entry-section-editable">
              <div className="entry-section-header">
                <h3>{
                  field === "daily_review"
                    ? "📌 Qu'est-ce que tu retiens de cette journée ? Quel est le bilan ?"
                    : field === "learnings"
                    ? "📚 Une leçon ou une prise de conscience ? Qu'as-tu appris ?"
                    : "🙏 À quoi veux-tu dire merci aujourd’hui ?"
                }</h3>
                {editingField !== field && (
                  <button onClick={() => setEditingField(field)} className="edit-btn">
                    <FontAwesomeIcon icon={faPen} />
                  </button>
                )}
              </div>
              {editingField === field ? (
                <>
                  <textarea
                    value={fieldValues[field] || ""}
                    onChange={(e) => setFieldValues({ ...fieldValues, [field]: e.target.value })}
                  />
                  <button className="action-btn" onClick={() => handleUpdateField(field)}>
                    <FontAwesomeIcon icon={faCheck} />
                  </button>
                </>
              ) : (
                <p>{fieldValues[field]}</p>
              )}
            </div>
          ))}
        </>
      ) : showEveningForm ? (
        <>
          <div className="entry-section">
            <h3>🌙 Ton humeur du soir</h3>
            <div className="evening-mood-line">
              Ce soir tu te sens
              <select
                value={fieldValues.evening_mood || ""}
                onChange={(e) => setFieldValues({ ...fieldValues, evening_mood: e.target.value })}
              >
                <option value="">Choisis une humeur</option>
                {availableMoods.map((option) => (
                  <option key={option.label} value={option.label}>
                    {option.label} {option.emoji}
                  </option>
                ))}
              </select>
              à 
              <input
                type="number"
                min="1"
                max="10"
                value={fieldValues.evening_mood_level || 5}
                onChange={(e) =>
                  setFieldValues({ ...fieldValues, evening_mood_level: parseInt(e.target.value) })
                }
              />
              sur 10
            </div>


          </div>

          {["daily_review", "learnings", "gratitude_notes"].map((field) => (
            <div key={field} className="entry-section entry-section-editable">
              <textarea
                placeholder={
                  field === "daily_review"
                    ? "Quel bilan retires-tu de cette journée ?"
                    : field === "learnings"
                    ? "Qu'as-tu appris aujourd’hui ?"
                    : "De quoi es-tu reconnaissant aujourd’hui ?"
                }
                value={fieldValues[field] || ""}
                onChange={(e) => setFieldValues({ ...fieldValues, [field]: e.target.value })}
              />
            </div>
          ))}

          <div className="complete-evening-actions">
            <button className="complete-evening-btn validation" onClick={handleFinalizeEvening}>Valider la soirée 🌙</button>
            <button className="complete-evening-btn cancel" onClick={() => setShowEveningForm(false)}>Annuler ❌</button>
          </div>

          
        </>
      ) : (
        <div className="complete-evening-actions">
          <button className="complete-evening-btn" onClick={handleCompleteEvening}>Compléter la soirée 🌙</button>
        </div>
        
      )}
    </div>
  );
};

export default EntryFullView;