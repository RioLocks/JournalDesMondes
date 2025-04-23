import React, { useState } from "react";
import { getEmojiFromLabel } from "../utils/moods";
import { formatLongDate } from "../utils/date";
import EntryDetailModal from "./EntryDetailModal";
import ReviewModal from "./ReviewModal";
import './css/IntrospectiveDraw.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

const IntrospectiveDraw = ({ entries, reviews }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleDraw = () => {
    const allItems = [
      ...entries.map((entry) => ({ ...entry, type: "entry" })),
      ...reviews.map((review) => ({ ...review, type: "review" }))
    ];

    if (allItems.length === 0) return;

    const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
    setSelectedItem(randomItem);
    setModalOpen(false);
  };

  const renderCard = () => {
    if (!selectedItem) return null;

    if (selectedItem.type === "entry") {
      return (
        <div className="draw-card" onClick={() => setModalOpen(true)}>
          <div className="entry-card-header">
            <h3>📅 Journal du {formatLongDate(selectedItem.date)}</h3>
            <span className="entry-completion-badge" title={selectedItem.is_evening_completed === true ? "Entrée complétée (matin & soir)" : "Entrée du matin uniquement"}>
              {selectedItem.is_evening_completed === true ? "🌙" : "🔆"}
            </span>
          </div>
            
          {selectedItem.quote && <blockquote className="modal-quote">{selectedItem.quote}</blockquote>}


          <div className="modal-section">
            <strong>🌤️ Humeur du matin :</strong>
            <p>{getEmojiFromLabel(selectedItem.morning_mood)} {selectedItem.morning_mood} à {selectedItem.morning_mood_level} sur 10</p>
          </div>

          <div className="modal-section">
            <strong>🎯 Intentions :</strong>
            <p>{selectedItem.intentions}</p>
          </div>

          <div className="entry-tags-container">
            {selectedItem.tags.map((tag, index) => (
                <span key={index} className="entry-tag">#{tag}</span>
            ))}
          </div>
          
        </div>
      );
    } else {
      return (
        <div className="draw-card" style={{cursor:"pointer"}} onClick={() => setModalOpen(true)}>
          <div className="entry-card-header">
            <h3>🛞 Bilan introspectif : <span style={{color: "#7e57c2"}}>{selectedItem.title}</span></h3>
            {selectedItem.is_relevant && (
              <div title="Marquant" style={{color: "gold"}}>
                <FontAwesomeIcon icon={faStar} />
              </div>
            )}
          </div>

          <p><strong>📆 Période :</strong> du {formatLongDate(selectedItem.start_date)} au {formatLongDate(selectedItem.end_date)}</p>
          {selectedItem.quote && <blockquote className="modal-quote">{selectedItem.quote}</blockquote>}
          <div className="modal-section">
            <strong>📚 Leçons retenues :</strong>
            <p>{selectedItem.learnings}</p>
          </div>

          <div className="modal-section">
            <strong>⭐ Moments forts :</strong>
            <p>{selectedItem.highlights}</p>
          </div>
          
          <div className="entry-tags-container">
            {selectedItem.tags.map((tag, index) => (
                <span key={index} className="entry-tag">#{tag}</span>
            ))}
          </div>

        </div>
      );
    }
  };

  return (
    <div className="introspective-draw">
        <div className="introspective-draw-header">
            <h2>🎲 Tirage introspectif</h2>
            <button className="draw-btn" onClick={handleDraw}>Tirer une carte</button>
        </div>

        {renderCard()}

        {modalOpen && selectedItem?.type === "entry" && (
            <EntryDetailModal entry={selectedItem} onClose={() => setModalOpen(false)} />
        )}

        {modalOpen && selectedItem?.type === "review" && (
            <ReviewModal review={selectedItem} onClose={() => setModalOpen(false)} />
        )}
    </div>
  );
};

export default IntrospectiveDraw;
