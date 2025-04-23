import React, {useState, useEffect} from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Plus } from 'lucide-react'; 
import "./css/Settings.css";
import QuoteModal from '../components/QuoteModal';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faStar as solidStar,
  faPlus
} from "@fortawesome/free-solid-svg-icons";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";


const Settings = () => {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');

  // Constantes pour les citations
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quotes, setQuotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  useEffect(() => {
    fetchQuotes();
    fetchTags();
  }, []);


  // ------------------------------- Fonctions pour les Tags ---------------------------------
  const fetchTags = async () => {
    try {
      const tags = await invoke('get_tags');
      setTags(tags);
    } catch (error) {
      console.error('Erreur lors de la récupération des tags :', error);
    }
  };

  const handleAddTag = async () => {
    try {
      await invoke('add_tag', { label: newTag });
      setNewTag('');
      fetchTags();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du tag :', error);
    }
  };

  const deleteTag = async (tagId, label) => {
    const confirmDelete = window.confirm(`Supprimer le tag "${label}" ?`);
    if (!confirmDelete) return;
  
    try {
      await invoke("delete_tag", { tagId });
      fetchTags(); // recharge la liste des tags
    } catch (error) {
      console.error("Erreur suppression tag :", error);
      alert("Impossible de supprimer le tag.");
    }
  };
  


  // ---------------------------- Fonctions pour les Citations -------------------------------

  const fetchQuotes = async () => {
    try {
      const result = await invoke('get_quotes');
      setQuotes(result);
      console.log("Quotes chargées :", result);
    } catch (error) {
      console.error('Erreur chargement citations :', error);
    }
  };


  const toggleFavorite = async (id, currentState) => {
    try {
      await invoke('toggle_favorite_quote', { quoteId : id, isFavorite: !currentState });
      fetchQuotes();
    } catch (error) {
      console.error("Erreur mise à jour favori :", error);
    }
  };

  const deleteQuote = async (id) => {
    const confirm = window.confirm("Supprimer cette citation ?");
    if (!confirm) return;

    try {
      await invoke('delete_quote', { quoteId : id });
      fetchQuotes();
    } catch (error) {
      console.error("Erreur suppression citation :", error);
    }
  };

  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.author && q.author.toLowerCase().includes(searchTerm.toLowerCase()));
  
    const matchesTag = tagFilter ? q.tags.includes(tagFilter) : true;
    const matchesFav = onlyFavorites ? q.is_favorite : true;
  
    return matchesSearch && matchesTag && matchesFav;
  });

  return (
    <div className='settings-container'>
      <div className="settings-header">
        <h1>⚙️ Paramètres</h1>
      </div>

      <div className="settings-content">
        <div className="settings-item">

          <div className="settings-item-header">
            <h2>🏷️ Tags</h2>
          </div>

          <div className="settings-item-content">
            {tags.length === 0 ? (
              <p className="no-tags-message">Veuillez ajouter un tag</p>
            ) : (
              <ul className="tag-list">
                {tags.map((tag) => (
                  <li className="tag-item" key={tag.id || tag.label}>
                    #{tag.label}
                    <button
                      className="tag-delete-button"
                      onClick={() => deleteTag(tag.id, tag.label)}
                      title="Supprimer ce tag"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </li>
                ))}
              </ul>

            )}
          </div>

          <div className="settings-item-footer">
            <input
              type="text"
              placeholder="Ajouter un tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
            />
            <button onClick={handleAddTag}>
              <Plus size={18} />
            </button>
          </div>

        </div>

        <div className="settings-item quote-container">

          <div className="settings-item-header quote-header">
            <h2>💬 Citations</h2>
            <button class="add-quote-btn" onClick={() => setShowQuoteModal(true)}>
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>

          <div className="settings-item-content quote-content">
            {filteredQuotes.length === 0 ? (
              <p className="no-quotes-message">Aucune citation enregistrée.</p>
            ) : (
              <ul className="quote-list">
                {filteredQuotes.map((quote) => (

                  <li key={quote.id} className="quote-item">

                    <div className="quote-item-top">
                      <p className='quote-text'>"{quote.text}" - {quote.author}</p>
                      <div className="quote-actions">
                        <button
                          className='quote-favorite-button'
                          onClick={() => toggleFavorite(quote.id, quote.is_favorite)}
                          title={quote.is_favorite ? "Favori": "Ajouter aux favoris"}
                        >
                          <FontAwesomeIcon icon={quote.is_favorite ? solidStar : regularStar} />
                        </button>
                        <button
                          className='quote-delete-button'
                          onClick={() => deleteQuote(quote.id)}
                          title="Supprimer"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="quote-item-bottom">
                      <div className="quote-tags">
                        {quote.tags.map((t, i) => (
                          <span className="quote-tag" key={i}>#{t}</span>
                        ))}
                      </div>
                    </div>


                  </li>

                ))}
              </ul>
            )}
          </div>

          <div className="settings-item-footer quote-footer">
            <input
              type="text"
              placeholder="🔍 Rechercher par mot-clé ou auteur"
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select onChange={(e) => setTagFilter(e.target.value)}>
              <option value="">📌 Tous les tags</option>
              {tags.map(tag => (
                <option key={tag.id} value={tag.label}>
                  {tag.label}
                </option>
              ))}
            </select>

            <div className="favorite-toggle" onClick={() => setOnlyFavorites(!onlyFavorites)}>
              <FontAwesomeIcon
                icon={onlyFavorites ? solidStar : regularStar}
                className="favorite-icon"
                title="Afficher uniquement les favoris"
              />
            </div>

          </div>

        </div>
      </div>
      {showQuoteModal && (
        <QuoteModal
          tags={tags}
          onClose={() => setShowQuoteModal(false)}
          onSave={async (newQuote) => {
            try {
              await invoke("add_quote", newQuote);
              fetchQuotes();
            } catch (error) {
              console.error("Erreur lors de l'ajout :", error);
            }
          }}
        />
      )}
    </div>
  );
};

export default Settings;