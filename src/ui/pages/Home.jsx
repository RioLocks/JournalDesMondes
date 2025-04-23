import React, {useState, useEffect} from 'react';
import './css/Home.css';
import { invoke } from '@tauri-apps/api/core';

// Fonctions utilitaires
import { availableMoods, getEmojiFromLabel } from '../utils/moods';
import { formatLongDate, formatShortDate } from '../utils/date';

// Charts
import MoodBubbleChart from '../components/MoodBubbleChart';
import MoodHistogram from '../components/MoodHistogram';
import TagCloudDisplay from '../components/TagCloudDisplay';

// Autres compposants
import IntrospectiveDraw from '../components/IntrospectiveDraw';

const DashboardCard = ({ icon, title, value, subtitle }) => (
  <div className="dashboard-card">
    <div className="dashboard-card-header">
      <div className="dashboard-icon">{icon}</div>
      <div className="dashboard-title">{title}</div>
    </div>
    
    {Array.isArray(value) ? (
      <div className="dashboard-tags">
        {value.map((tag, index) => (
          <span key={index} className="tag">
            #{tag}
          </span>
        ))}
      </div>
    ) : (
      <div className="dashboard-value">{value}</div>
    )}
    
    {subtitle && <div className="dashboard-subtitle">{subtitle}</div>}
  </div>
);

const MiniReview = ({ startDate, endDate, totalWritten, dominantMood, topTags }) => {
  const plural = totalWritten > 1 ? "écrits" : "écrit";

  const start =
    startDate && !isNaN(new Date(startDate))
      ? `le ${formatLongDate(startDate)}`
      : "le début";

  const end =
    endDate && !isNaN(new Date(endDate))
      ? `le ${formatLongDate(endDate)}`
      : "aujourd’hui";

  const moodEmoji = dominantMood ? getEmojiFromLabel(dominantMood) : null;

  const tagSentence =
    topTags.length > 1
      ? `${topTags.slice(0, -1).join(", ")} et ${topTags[topTags.length - 1]}`
      : topTags[0];

  return (
    <div className="mini-review">
      <h2 className="mini-review-title">🪞 Mini-bilan</h2>
      <p className="mini-review-content">
        Entre <strong>{start}</strong> et <strong>{end}</strong>, tu as {" "}
        <strong>{totalWritten}</strong> {plural}.
        {dominantMood && (
          <>{" "}Ton humeur la plus fréquente est {moodEmoji} <strong>{dominantMood}</strong>.</>
        )}
        {topTags.length > 0 && (
          <>{" "}Tu explores surtout les thèmes de <strong>{tagSentence}</strong>.</>
        )}
      </p>
    </div>
  );
};


const Home = () => {
  const [entries, setEntries] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");


  useEffect(() => {
    fetchData();
  }, []);

  // ----------------- Chargement des données depuis le backend ------------------------
  const fetchData = async () => {
    try {
      const entries = await invoke("get_entries");
      const reviews = await invoke("get_reviews");
      setEntries(entries);
      setReviews(reviews);
    } catch (error) {
      console.error("Erreur lors du chargement des données :", error);
    }
  };

  // -------------------------- Fonctions pour les KPI --------------------------------
  // Filtres les données et compte le nombre total d'entrées et de reviews
  const filteredEntries = entries.filter(entry => {
    const date = new Date(entry.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
  
    return (!start || date >= start) && (!end || date <= end);
  });
  
  const filteredReviews = reviews.filter(review => {
    const reviewStart = new Date(review.start_date);
    const reviewEnd = new Date(review.end_date);
    const filterStart = startDate ? new Date(startDate) : null;
    const filterEnd = endDate ? new Date(endDate) : null;
  
    const overlaps =
      (!filterStart || reviewEnd >= filterStart) &&
      (!filterEnd || reviewStart <= filterEnd);
  
    return overlaps;
  });
  
  // Fonction pour trouver l'humeur dominante
  function getDominantMood(filteredEntries, filteredReviews) {
    const moodCount = {};
  
    filteredEntries.forEach(entry => {
      if (entry.morning_mood) {
        moodCount[entry.morning_mood] = (moodCount[entry.morning_mood] || 0) + 1;
      }
      if (entry.evening_mood) {
        moodCount[entry.evening_mood] = (moodCount[entry.evening_mood] || 0) + 1;
      }
    });
  
    filteredReviews.forEach(review => {
      if (review.dominant_emotion) {
        moodCount[review.dominant_emotion] = (moodCount[review.dominant_emotion] || 0) + 1;
      }
    });
  
    let dominantMood = null;
    let maxCount = 0;
  
    for (const mood in moodCount) {
      if (moodCount[mood] > maxCount) {
        dominantMood = mood;
        maxCount = moodCount[mood];
      }
    }
  
    return { dominantMood, count: maxCount };
  }

  // Fonction pour trouver le rythme d'écriture
  function getWritingRhythm(filteredEntries, filteredReviews) {
    const dates = [
      ...filteredEntries.map(e => e.date),
      ...filteredReviews.map(r => r.date)
    ]
      .filter(Boolean)
      .map(date => new Date(date))
      .sort((a, b) => a - b);
  
    if (dates.length < 2) return null;
  
    const gaps = [];
    for (let i = 1; i < dates.length; i++) {
      const diff = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
      gaps.push(diff);
    }
  
    const averageGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    return Math.round(averageGap);
  }

  // Fonction pour trouver les TAGS les plus fréquents
  function getTopTags(filteredEntries, filteredReviews, topN = 3) {
    const tagCount = {};
  
    const allTags = [
      ...filteredEntries.flatMap(entry => entry.tags || []),
      ...filteredReviews.flatMap(review => review.tags || [])
    ];
  
    allTags.forEach(tag => {
      const cleanedTag = tag.trim().toLowerCase();
      tagCount[cleanedTag] = (tagCount[cleanedTag] || 0) + 1;
    });
  
    const sortedTags = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([tag]) => tag);
  
    return sortedTags;
  }

  // ---------------------------- Fonctions pour les graphiques --------------------------------
  // Graphique en bulles des émotions
  function getMoodBubbleData(filteredEntries) {
    const moodBubbles = [];
  
    filteredEntries.forEach(entry => {
      if (entry.morning_mood) {
        moodBubbles.push({
          date: entry.date,
          time: "matin",
          emoji: getEmojiFromLabel(entry.morning_mood),
          mood: entry.morning_mood,
          y: 1, // pour affichage
        });
      }
  
      if (entry.evening_mood) {
        moodBubbles.push({
          date: entry.date,
          time: "soir",
          emoji: getEmojiFromLabel(entry.evening_mood),
          mood: entry.evening_mood,
          y: 2, // pour affichage
        });
      }
    });
  
    return moodBubbles;
  }
  
  // Histogramme d'émotions
  function getMoodHistogramData(filteredEntries, filteredReviews) {
    const moodCount = {};
  
    filteredEntries.forEach(entry => {
      if (entry.morning_mood) {
        moodCount[entry.morning_mood] = (moodCount[entry.morning_mood] || 0) + 1;
      }
      if (entry.evening_mood) {
        moodCount[entry.evening_mood] = (moodCount[entry.evening_mood] || 0) + 1;
      }
    });
  
    filteredReviews.forEach(review => {
      if (review.dominant_emotion) {
        moodCount[review.dominant_emotion] = (moodCount[review.dominant_emotion] || 0) + 1;
      }
    });
  
    return Object.entries(moodCount).map(([mood, count]) => ({
      mood,
      count,
      emoji: getEmojiFromLabel(mood),
    }));
  }

  // Tag cloud
  function getTagCloudData(filteredEntries, filteredReviews) {
    const tagCount = {};
  
    const allTags = [
      ...filteredEntries.flatMap(entry => entry.tags || []),
      ...filteredReviews.flatMap(review => review.tags || [])
    ];
  
    allTags.forEach(tag => {
      const cleaned = tag.trim().toLowerCase();
      tagCount[cleaned] = (tagCount[cleaned] || 0) + 1;
    });
  
    return Object.entries(tagCount).map(([value, count]) => ({ value, count }));
  }
  
  


  // ---------------------- Appel des fonctions pour obtenir les valeurs ----------------------------

  const totalWritten = filteredEntries.length + filteredReviews.length;
  const { dominantMood, count: moodCount } = getDominantMood(filteredEntries, filteredReviews);
  const averageDays = getWritingRhythm(filteredEntries, filteredReviews);
  const topTags = getTopTags(filteredEntries, filteredReviews);
  const moodBubbles = getMoodBubbleData(filteredEntries).sort((a, b) =>
    new Date(a.date) - new Date(b.date)
  );
  const moodHistogramData = getMoodHistogramData(filteredEntries, filteredReviews);
  const tagCloudData = getTagCloudData(filteredEntries, filteredReviews);

  return (
    <div className="dashboard-container">


      <div className="dashboard-header">
        <h1 >🧭 Dashboard</h1>
        <div className="dashboard-filters">
          <label>
            Début :
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="date-input"
            />
          </label>
          <label>
            Fin :
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="date-input"
            />
          </label>
        </div>
      </div>
      

      <div className="dashboard-cards">
        <DashboardCard
          icon="📄"
          title="Entrées totales"
          value={totalWritten}
          subtitle={`${filteredEntries.length} entrées + ${filteredReviews.length} bilans`}
        />
        <DashboardCard
          icon={getEmojiFromLabel(dominantMood)}
          title="Humeur dominante"
          value={dominantMood || "—"}
          subtitle={dominantMood ? `apparue ${moodCount} fois` : "Aucune donnée"}
        />
        <DashboardCard
          icon="🕰️"
          title="Rythme d’écriture"
          value={averageDays ? `1 écriture / ${averageDays} jours` : "—"}
          subtitle={averageDays ? "en moyenne" : "Pas assez d’écrits"}
        />
        <DashboardCard
          icon="🏷️"
          title="Tags fréquents"
          value={topTags.length > 0 ? topTags : ["—"]}
          subtitle={topTags.length > 0 ? "sur la période choisie" : "Aucun tag trouvé"}
        />

      </div>

      <MiniReview
        startDate={startDate}
        endDate={endDate}
        totalWritten={totalWritten}
        dominantMood={dominantMood}
        topTags={topTags}
      />

      <div className="charts-container">
        <MoodBubbleChart data={moodBubbles} />
        <MoodHistogram data={moodHistogramData} />
        <TagCloudDisplay data={tagCloudData} />
      </div>

      <div className="introspective-draw-container">
        <IntrospectiveDraw 
          entries={filteredEntries}
          reviews={filteredReviews}
        />
      </div>
      

    </div>
  );
};

export default Home;
