import React from "react";
import { useLocation } from "react-router";

const VisualizerId = () => {
  const location = useLocation();
  const { initialImage, name } = location.state || {};
  return (
    <section>
      <h1>{name || "Untitled Project"}</h1>

      <div className="visulaizer">
        {initialImage && (
          <div className="image_container">
            <h2>Source Image</h2>
            <img src={initialImage} alt="source" />
          </div>
        )}
      </div>
    </section>
  );
};

export default VisualizerId;
