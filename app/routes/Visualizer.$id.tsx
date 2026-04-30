import { useParams, useLocation } from "react-router";

const VisualizerId = () => {
  const { id } = useParams();
  const location = useLocation();
  const { initialImage, name } = location.state || {};

  return (
    <section>
      <h1>{name || `Project ${id}`}</h1>
      <div className="visualizer">
        {" "}
        {initialImage ? (
          <div className="image-container">
            <img
              src={initialImage}
              alt="Source"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </div>
        ) : (
          <p>No image found. Try uploading again.</p>
        )}
      </div>
    </section>
  );
};

export default VisualizerId;
