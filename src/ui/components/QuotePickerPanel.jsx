import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./css/QuotePickerPanel.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const QuotePickerPanel = ({ tags = [], onSelect, onClose }) => {
  const [quotes, setQuotes] = useState([]);
  const [search, setSearch] = useState("");
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const result = await invoke("get_quotes");
        setQuotes(result);
      } catch (error) {
        console.error("Erreur chargement citations :", error);
      }
    };

    fetchQuotes();
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // durée de l’animation
  };

  const matchesSearch = (quote) => {
    const query = search.toLowerCase();
    return (
      quote.text.toLowerCase().includes(query) ||
      quote.author?.toLowerCase().includes(query) ||
      quote.tags?.some((t) => t.toLowerCase().includes(query))
    );
  };

  const getFavorites = () =>
    quotes.filter((q) => q.is_favorite && matchesSearch(q));

  const getSuggested = () =>
    quotes.filter(
      (q) =>
        q.tags?.some((t) => tags.includes(t)) &&
        !q.is_favorite &&
        matchesSearch(q)
    );

  const getOthers = () => {
    const seenIds = [...getFavorites(), ...getSuggested()].map((q) => q.id);
    return quotes.filter((q) => !seenIds.includes(q.id) && matchesSearch(q));
  };

  const renderQuote = (quote) => (
    <div
      className="quote-picker-item"
      key={quote.id}
      onClick={() => onSelect(quote)}
    >
      <blockquote>{quote.text}</blockquote>
      <div className="quote-picker-meta">
        <span className="quote-author">{quote.author && `— ${quote.author}`}</span>
        <div className="quote-tags">
          {quote.tags.map((tag, index) => (
            <span key={index} className="quote-tag">#{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`quote-picker-panel ${isClosing ? "closing" : ""}`}>
      <div className="quote-picker-header">
        <h2>📖 Choisir une citation</h2>
        <button onClick={handleClose} className="quote-picker-close">
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>

      <div className="quote-search-bar">
        <input
          type="text"
          placeholder="Rechercher une citation, un auteur ou un tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {getFavorites().length > 0 && (
        <div className="quote-section">
          <h3>⭐ Favoris</h3>
          {getFavorites().map(renderQuote)}
        </div>
      )}

      {getSuggested().length > 0 && (
        <div className="quote-section">
          <h3>✨ Suggérées</h3>
          {getSuggested().map(renderQuote)}
        </div>
      )}

      {getOthers().length > 0 && (
        <div className="quote-section">
          <h3>📚 Toutes les citations</h3>
          {getOthers().map(renderQuote)}
        </div>
      )}
    </div>
  );
};

export default QuotePickerPanel;
