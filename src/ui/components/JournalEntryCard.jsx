import React, {useState, useEffect, use} from 'react';
import './css/JournalEntryCard.css';
import { Trash2, Edit2, CheckCircle } from "lucide-react";
import { invoke } from '@tauri-apps/api/core';

const JournalEntryCard = ({ entry, onDelete, onEdit, onSelect, availableMoods }) => {
  const moodEmoji = entry.morning_mood || "❓";
  const [quote, setQuote] = useState(null); // ou useState({})


  useEffect(() => {
    if (entry.quote_id) {
      fetchQuoteById(entry.quote_id);
    }
  }, [entry.quote_id]);


  const fetchQuoteById = async (id) => {
    try {
      const result = await invoke("get_quote_by_id", { quoteId: id  });
      setQuote(result);
    } catch (error) {
      console.error("Erreur lors de la récupération de la citation :", error);
    }
  };
  

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getMoodEmoji = (label) => {
    const mood = availableMoods.find((m) => m.label === label);
    return mood ? mood.emoji : "❓";
  };

  return (
    <div className="entry-card" onClick={() => onSelect(entry.id)}>
      <div className="entry-card-header">
        <h3 className="entry-title">
            🎭 Journal du {formatDate(entry.date)} - <span className="entry-mood-title">{getMoodEmoji(entry.morning_mood)} {moodEmoji} à {entry.morning_mood_level} sur 10</span>
        </h3>
        <span className="entry-completion-badge" title={entry.is_evening_completed === true ? "Entrée complétée (matin & soir)" : "Entrée du matin uniquement"}>
            {entry.is_evening_completed === true ? "🌙" : "🔆"}
        </span>
      </div>

      {quote && (
        <p className="entry-quote">
          « {quote.text} »{quote.author && <span className="quote-author"> — {quote.author}</span>}
        </p>
      )}

      
      <div className="entry-tags-container">
        {entry.tags.map((tag, index) => (
          <span key={index} className="entry-tag">#{tag}</span>
        ))}
      </div>

      <div className="entry-actions">
        <button title="Editer" className="entry-btn" onClick={(e) => { e.stopPropagation(); onEdit(entry); }}>
          <Edit2 size={16} />
        </button>
        <button title="Supprimer" className="entry-btn delete" onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}>
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default JournalEntryCard;
