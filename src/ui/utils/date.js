export const formatShortDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
    });
};

export const formatLongDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
};