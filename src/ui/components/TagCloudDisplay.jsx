import React from "react";
import { TagCloud } from "react-tagcloud";
import './css/TagCloudDisplay.css';

const TagCloudDisplay = ({ data }) => {
  return (
    <div className="tagcloud-wrapper chart-card">
      <h2>🌥️ Nuage de tags</h2>
      <TagCloud
        minSize={12}
        maxSize={35}
        tags={data}
        className="simple-cloud"
      />
    </div>
  );
};

export default TagCloudDisplay;
