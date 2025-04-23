export const availableMoods = [
    { emoji: "😀", label: "Heureux" },
    { emoji: "😄", label: "Joyeux" },
    { emoji: "😊", label: "Reconnaissant" },
    { emoji: "😌", label: "Apaisé" },
    { emoji: "😎", label: "Confiant" },
    { emoji: "😍", label: "Amoureux" },
    { emoji: "🤩", label: "Émerveillé" },
    { emoji: "🥰", label: "Aimé" },
  
    { emoji: "😐", label: "Neutre" },
    { emoji: "😶", label: "Vide" },
    { emoji: "😕", label: "Perplexe" },
    { emoji: "😑", label: "Las" },
    { emoji: "🤔", label: "Pensif" },
  
    { emoji: "😔", label: "Triste" },
    { emoji: "😭", label: "Ému" },
    { emoji: "😢", label: "Déçu" },
    { emoji: "🥺", label: "Vulnérable" },
    { emoji: "😞", label: "Abattu" },
  
    { emoji: "😠", label: "En colère" },
    { emoji: "😤", label: "Frustré" },
    { emoji: "😡", label: "Furieux" },
    { emoji: "🙄", label: "Agacé" },
  
    { emoji: "😰", label: "Anxieux" },
    { emoji: "😨", label: "Inquiet" },
    { emoji: "😱", label: "Effrayé" },
    { emoji: "😓", label: "Stressé" },
  
    { emoji: "🥱", label: "Fatigué" },
    { emoji: "😴", label: "Épuisé" },
    { emoji: "🤒", label: "Malaise" },
  
    { emoji: "🤗", label: "Ouvert" },
    { emoji: "🫶", label: "Connecté" },
    { emoji: "🧘", label: "Présent" },
    { emoji: "💭", label: "Réfléchi" },
    { emoji: "🌈", label: "Espérant" },
];

export const getEmojiFromLabel = (label) => {
    const mood = availableMoods.find((m) => m.label === label);
    return mood ? mood.emoji : "🌱";
};

export const getLabelFromEmoji = (emoji) => {
    const mood = availableMoods.find((m) => m.emoji === emoji);
    return mood ? mood.label : "Inconnu";
};