import React, { useState, useEffect } from 'react';
import { IdCardIcon, Plus } from 'lucide-react'; 
import { invoke } from '@tauri-apps/api/core';
import AddEntryModal from '../components/AddEntryModal';
import JournalEntryCard from '../components/JournalEntryCard';
import EntryFullView from '../components/EntryFullView';
import './css/Journal.css';
import { availableMoods, getEmojiFromLabel } from '../utils/moods';

const Journal = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState(null);


  // États pour les champs du formulaire
  const [date, setDate] = useState("");
  const [morningMood, setMorningMood] = useState("");
  const [morningMoodLevel, setMorningMoodLevel] = useState(5);
  const [intentions, setIntentions] = useState("");
  const [selectedQuote, setSelectedQuote] = useState(null); // 🔄 remplace quote
  const [dailyGoals, setDailyGoals] = useState([]);
  const [newGoal, setNewGoal] = useState("");
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState("");

  // Données générales
  const [availableTags, setAvailableTags] = useState([]);
  const [entries, setEntries] = useState([]);
  const selectedEntry = entries.find((e) => e.id === selectedEntryId);


  // Constantes pour les filtres
  const [filterTag, setFilterTag] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterMood, setFilterMood] = useState("");
  const [filterCompleted, setFilterCompleted] = useState("");


  useEffect(() => {

    fetchEntries();
    fetchTags();
  }, []);


  // ------------------------------- Chargement des données -------------------------------
  // Entrées
  const fetchEntries = async () => {
    try {
      const entries = await invoke("get_entries");
      setEntries(entries);
    } catch (error) {
      console.error("Error loading entries:", error);
    }
  };
  
  // Tags
  const fetchTags = async () => {
    try {
      const tags = await invoke("get_tags");
      setAvailableTags(tags);
      console.log("tags chargés :", tags); 
    } catch (error) {
      console.error("Erreur lors du chargement des tags :", error);
    }
  };

  //  ------------------------------- Fonctions pour les entrées -------------------------------

  // Ajout d'une entrée
  const addEntry = async () => {
    try {
      await invoke("add_entry", {
        date,
        morningMood,
        morningMoodLevel,
        intentions,
        quoteId: selectedQuote?.id || null,
        dailyGoals,
        tags,
        linkedAt: [],
        attachments: [],
      });

      setIsAddModalOpen(false);
      // reset des champs après soumission
      setDate("");
      setMorningMood("");
      setMorningMoodLevel(5);
      setIntentions("");
      setSelectedQuote(null);
      setTags([]);
      setDailyGoals([]);
      setSelectedTag("");
      setNewGoal("");
    } catch (error) {
      console.error("Erreur lors de l'ajout :", error);
    }
  };

  // Suppression d'une entrée
  const handleDeleteEntry = async (id) => {
    if (confirm("Supprimer cette entrée ?")) {
      await invoke("delete_entry", { entryId: id });
      fetchEntries(); // Recharge
    }
  };
  
  // Édition d'une entrée
  const handleEditEntry = (entry) => {
    // À venir
    console.log("Édition pas encore implémentée :", entry);
  };
  
  // ------------------------------- Fonctions utilitaires -------------------------------

  const getRandomPlaceholder = (type) => {
    const suggestions = {
      intentions: [
        "Quelle est ton intention profonde aujourd’hui ?",
        "Comment veux-tu vivre cette journée ?",
        "Pose une énergie que tu veux cultiver aujourd’hui."
      ]
    };
    const list = suggestions[type] || [];
    return list[Math.floor(Math.random() * list.length)] || "";
  };

  const addGoal = () => {
    if (!newGoal.trim()) return;
    setDailyGoals([...dailyGoals, { text: newGoal, done: false }]);
    setNewGoal("");
  };

  const removeGoalFromList = (index) => {
    setDailyGoals(dailyGoals.filter((_, i) => i !== index));
  };

  const getFilteredEntries = () => {
    return [...entries]
      .filter((entry) => {
        if (filterTag && !entry.tags.includes(filterTag)) return false;
        if (filterMonth && !entry.date.startsWith(filterMonth)) return false;
        if (filterMood && entry.morning_mood !== filterMood) return false;
        if (filterCompleted && String(entry.is_evening_completed) !== filterCompleted) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // plus récent d'abord
  };
  

  return (
    <div className="journal-container">

      <div className="header-container">
        <h1>📰 Journal quotidien</h1>
        <button title='Ajouter une entrée' className="add-entry-btn" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} />
        </button>
        {/* Modal */}
        {isAddModalOpen && (
          <AddEntryModal
            onClose={() => setIsAddModalOpen(false)}
            date={date} setDate={setDate}
            morningMood={morningMood} setMorningMood={setMorningMood}
            morningMoodLevel={morningMoodLevel} setMorningMoodLevel={setMorningMoodLevel}
            intentions={intentions} setIntentions={setIntentions}
            selectedQuote={selectedQuote}
            setSelectedQuote={setSelectedQuote}
            dailyGoals={dailyGoals} setDailyGoals={setDailyGoals}
            newGoal={newGoal} setNewGoal={setNewGoal}
            tags={tags} setTags={setTags}
            selectedTag={selectedTag} setSelectedTag={setSelectedTag}
            availableMoods={availableMoods}
            availableTags={availableTags}
            getRandomPlaceholder={getRandomPlaceholder}
            addGoal={addGoal}
            removeGoalFromList={removeGoalFromList}
            addEntry={addEntry}
          />
        )}
      </div>
      
      <div className="filter-container">
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          title="Filtrer par mois"
        />

        <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)} title="Filtrer par tag">
          <option value="">Tous les tags</option>
          {availableTags.map((tag) => (
            <option key={tag.id} value={tag.label}>
              {tag.label}
            </option>
          ))}
        </select>

        <select value={filterMood} onChange={(e) => setFilterMood(e.target.value)} title="Filtrer par humeur">
          <option value="">Toutes les humeurs</option>
          {availableMoods.map((mood) => (
            <option key={mood.label} value={mood.label}>
              {mood.emoji} {mood.label}
            </option>
          ))}
        </select>

        <select
          value={filterCompleted}
          onChange={(e) => setFilterCompleted(e.target.value)}
          title="Filtrer par complétion du soir"
        >
          <option value="">Tous les statuts</option>
          <option value="true">Soirée complétée</option>
          <option value="false">Non complétée</option>
        </select>
      </div>

      {selectedEntry ? (
        <EntryFullView
          entry={selectedEntry}
          onClose={() => setSelectedEntryId(null)}
          availableMoods={availableMoods}
        />
      ) : (
        <div className="entries-container">
          {getFilteredEntries().map((entry) => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              onDelete={handleDeleteEntry}
              onEdit={handleEditEntry}
              onSelect={(id) => setSelectedEntryId(id)}
              availableMoods={availableMoods}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Journal;