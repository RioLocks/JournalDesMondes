import React, { useState, useEffect } from 'react';
import './css/Review.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faStar, faTrash  } from '@fortawesome/free-solid-svg-icons';
import AddReviewModal from '../components/AddReviewModal';
import ReviewDetailModal from '../components/ReviewDetailModal';
import { invoke } from '@tauri-apps/api/core';
import { Timeline, TimelineItem } from 'vertical-timeline-component-for-react';
import { availableMoods, getEmojiFromLabel } from '../utils/moods';

const Review = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [availableTags, setAvailableTags] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [quotesMap, setQuotesMap] = useState({});

  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [learnings, setLearnings] = useState('');
  const [highlights, setHighlights] = useState('');
  const [alignmentReflection, setAlignmentReflection] = useState('');
  const [selectedQuote, setSelectedQuote] = useState(null); 
  const [gratitudePoints, setGratitudePoints] = useState('');
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [dominantEmotion, setDominantEmotion] = useState('');
  const [isRelevant, setIsRelevant] = useState(false);

  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterEmotion, setFilterEmotion] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterRelevance, setFilterRelevance] = useState(false);

  const resetFields = () => {
    setTitle('');
    setStartDate('');
    setEndDate('');
    setLearnings('');
    setHighlights('');
    setAlignmentReflection('');
    setSelectedQuote(null);
    setGratitudePoints('');
    setTags([]);
    setSelectedTag('');
    setDominantEmotion('');
    setIsRelevant(false);
  };

  useEffect(() => {
    fetchReviews();
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const tags = await invoke("get_tags");
      setAvailableTags(tags);
    } catch (error) {
      console.error("Erreur lors du chargement des tags :", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const reviews = await invoke("get_reviews");
      setReviews(reviews);

      const quoteIds = reviews.filter(r => r.quote_id).map(r => r.quote_id);
      const uniqueIds = [...new Set(quoteIds)];
      const quotePromises = uniqueIds.map(id => invoke("get_quote_by_id", { quoteId: id }).catch(() => null));
      const quoteResults = await Promise.all(quotePromises);

      const map = {};
      uniqueIds.forEach((id, i) => {
        if (quoteResults[i]) map[id] = quoteResults[i];
      });
      setQuotesMap(map);

    } catch (error) {
      console.error("Erreur lors du chargement des bilans :", error);
    }
  };

  const addReview = async () => {
    if (!title || !startDate || !endDate || !learnings || !highlights || !alignmentReflection || !dominantEmotion) {
      alert("Merci de remplir tous les champs obligatoires.");
      return;
    }

    try {
      await invoke("add_review", {
        title,
        startDate,
        endDate,
        learnings,
        highlights,
        alignmentReflection,
        quoteId: selectedQuote?.id || null,
        gratitudePoints,
        tags,
        dominantEmotion,
        isRelevant
      });

      fetchReviews();
      resetFields();
      setShowAddModal(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout du bilan :", error);
      alert("Une erreur est survenue : " + error);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Es-tu sûr de vouloir supprimer ce bilan ?")) return;
    try {
      await invoke("delete_review", { id });
      await fetchReviews();
      setSelectedReview(null);
    } catch (error) {
      console.error("Erreur lors de la suppression du bilan :", error);
      alert("Impossible de supprimer le bilan : " + error);
    }
  };

  const handleSaveReview = async (updatedReview) => {
    try {
      await invoke("update_review", {
        id: updatedReview.id,
        title: updatedReview.title,
        startDate: updatedReview.start_date,
        endDate: updatedReview.end_date,
        learnings: updatedReview.learnings,
        highlights: updatedReview.highlights,
        alignmentReflection: updatedReview.alignment_reflection,
        quoteId: updatedReview.quote_id,
        gratitudePoints: updatedReview.gratitude_points,
        tags: updatedReview.tags,
        dominantEmotion: updatedReview.dominant_emotion,
        isRelevant: updatedReview.is_relevant
      });
      await fetchReviews();
      setSelectedReview(null);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du bilan :", error);
      alert("Impossible de sauvegarder les modifications : " + error);
    }
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  };

  const filteredReviews = reviews.filter((review) => {
    const reviewStart = new Date(review.start_date);
    const reviewEnd = new Date(review.end_date);
    const filterStart = filterStartDate ? new Date(filterStartDate) : null;
    const filterEnd = filterEndDate ? new Date(filterEndDate) : null;

    const overlaps = (!filterStart || reviewEnd >= filterStart) && (!filterEnd || reviewStart <= filterEnd);
    const emotionOk = !filterEmotion || review.dominant_emotion === filterEmotion;
    const tagOk = !filterTag || review.tags?.includes(filterTag);
    const relevanceOk = !filterRelevance || review.is_relevant === true;

    return overlaps && emotionOk && tagOk && relevanceOk;
  });

  return (
    <div className="review-container">
      <div className="review-header">
        <h1>🛞 Bilan</h1>
        <button onClick={() => setShowAddModal(true)} className="add-review-btn">
          <FontAwesomeIcon icon={faPlus} />
        </button>
        {showAddModal && (
          <AddReviewModal
            onClose={() => setShowAddModal(false)}
            title={title} setTitle={setTitle}
            startDate={startDate} setStartDate={setStartDate}
            endDate={endDate} setEndDate={setEndDate}
            learnings={learnings} setLearnings={setLearnings}
            highlights={highlights} setHighlights={setHighlights}
            alignmentReflection={alignmentReflection} setAlignmentReflection={setAlignmentReflection}
            selectedQuote={selectedQuote} setSelectedQuote={setSelectedQuote}
            gratitudePoints={gratitudePoints} setGratitudePoints={setGratitudePoints}
            tags={tags} setTags={setTags}
            selectedTag={selectedTag} setSelectedTag={setSelectedTag}
            dominantEmotion={dominantEmotion} setDominantEmotion={setDominantEmotion}
            isRelevant={isRelevant} setIsRelevant={setIsRelevant}
            availableTags={availableTags} availableEmotions={availableMoods}
            addReview={addReview}
          />
        )}
      </div>

      <div className="review-filter-container">
        <div className="review-filter"><label>Date début</label><input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} /></div>
        <div className="review-filter"><label>Date fin</label><input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} /></div>
        <div className="review-filter"><label>Émotion dominante</label><select value={filterEmotion} onChange={(e) => setFilterEmotion(e.target.value)}><option value="">Toutes</option>{availableMoods.map((mood) => (<option key={mood.label} value={mood.label}>{mood.emoji} {mood.label}</option>))}</select></div>
        <div className="review-filter"><label>Tag</label><select value={filterTag} onChange={(e) => setFilterTag(e.target.value)}><option value="">Tous</option>{availableTags.map((tag) => (<option key={tag.id} value={tag.label}>{tag.label}</option>))}</select></div>
        <div className="review-filter toggle-filter"><label htmlFor="toggle-relevance">Bilans marquants</label><label className="toggle-switch"><input type="checkbox" id="toggle-relevance" checked={filterRelevance} onChange={(e) => setFilterRelevance(e.target.checked)} /><span className="slider"></span></label></div>
      </div>

      <div className="review-list-container">
        <Timeline lineColor="#d1c4e9">
          {filteredReviews
          .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
          .map((review) => (
            <TimelineItem
              key={review.id}
              dateText={`Du ${formatDate(review.start_date)} au ${formatDate(review.end_date)}`}
              dateInnerStyle={{ background: '#d1c4e9', color: '#2d2d2d' }}
              style={{ color: '#5e35b1' }}
            >
              <div onClick={() => setSelectedReview(review)} className="timeline-item-content">
                {review.is_relevant && <div title="Marquant" className="timeline-relevant-icon"><FontAwesomeIcon icon={faStar} /></div>}
                <div className="timeline-title">{getEmojiFromLabel(review.dominant_emotion)} {review.title}</div>
                {review.quote_id && quotesMap[review.quote_id] && (
                  <div className="timeline-quote">« {quotesMap[review.quote_id].text} » {quotesMap[review.quote_id].author && <span>— {quotesMap[review.quote_id].author}</span>}</div>
                )}
                <div className="timeline-learnings">{review.learnings.slice(0, 200)}...</div>
                <div className="timeline-footer">

                  <div className="timeline-tags tag-list">
                    {(typeof review.tags === "string"
                      ? review.tags.split(",")
                      : review.tags
                    ).map((tag, index) => (<span key={index} className="tag">#{tag.trim()}</span>))}
                  </div>
                  <div className="timeline-actions">
                    <button title="Supprimer" onClick={(e) => { e.stopPropagation(); handleDeleteReview(review.id); }}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                  
                </div>
              </div>
            </TimelineItem>
          ))}
        </Timeline>
        {selectedReview && (
          <ReviewDetailModal
            review={selectedReview}
            onClose={() => setSelectedReview(null)}
            onSave={handleSaveReview}
            availableMoods={availableMoods}
          />
        )}
      </div>
    </div>
  );
};

export default Review;
