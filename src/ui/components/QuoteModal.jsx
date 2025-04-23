import React, { useState } from 'react';
import './css/QuoteModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';

const QuoteModal = ({ tags, onClose, onSave }) => {
    const [text, setText] = useState('');
    const [author, setAuthor] = useState('');
    const [selectedTag, setSelectedTag] = useState([]);
    const [isFavorite, setIsFavorite] = useState(false);
    const [tagsToSend, setTagsToSend] = useState([]);


  const handleSubmit = () => {
    if (!text.trim()) return;
    onSave({
      text,
      author,
      tags: tagsToSend,
      isFavorite
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content quote-modal-content" onClick={e => e.stopPropagation()}>
        <h3>➕ Nouvelle citation</h3>

        <div className="quote-modal-item">
          <textarea
            placeholder="Texte de la citation"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="quote-modal-item">
          <input
            type="text"
            placeholder="Auteur (optionnel)"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>

        <div className="add-modal-item">
          <div className="add-tag-selector">
            <select
              className="add-tag-select"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
            >
              <option value="">-- Choisis un tag --</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.label}>
                  {tag.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="add-item"
              onClick={() => {
                if (selectedTag && !tagsToSend.includes(selectedTag)) {
                  setTagsToSend([...tagsToSend, selectedTag]);
                  setSelectedTag("");
                }
              }}
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>

          {tagsToSend.length > 0 && (
            <div className="selected-tags-list">
              {tagsToSend.map((tag, i) => (
                <li key={i}>
                  #{tag}
                  <button
                    className="delete-item"
                    type="button"
                    onClick={() => setTagsToSend(tagsToSend.filter(t => t !== tag))}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>

                </li>

              ))}
            </div>
          )}
        </div>

        <label className="favorite-checkbox">
          <input
            type="checkbox"
            checked={isFavorite}
            onChange={(e) => setIsFavorite(e.target.checked)}
          />
          Marquer comme favorite
        </label>

        <div className="quote-modal-actions">
          <button onClick={handleSubmit}>Enregistrer</button>
          <button onClick={onClose}>Annuler</button>
        </div>
      </div>
    </div>
  );
};

export default QuoteModal;
