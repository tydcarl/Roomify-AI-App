import { generate3Dview } from "lib/ai.action";
import { useEffect, useRef, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router";

const VisualizerId = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { initialImage, initialRender, name } = location.state || {};

  const hasInitialGenerated = useRef(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(
    initialRender || null,
  );

  const handleBack = () => {
    navigate("/");
  };

  const runGeneration = async () => {
    if (!initialImage) return;

    try {
      setIsProcessing(true);
      const result = await generate3Dview({ sourceImage: initialImage });

      if (result.renderedImage) {
        setCurrentImage(result.renderedImage);
      }
    } catch (error) {
      console.error("Generation failed: ", error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!initialImage || hasInitialGenerated.current) return;

    if (initialRender) {
      setCurrentImage(initialRender);
      hasInitialGenerated.current = true;
      return;
    }

    hasInitialGenerated.current = true;
    runGeneration();
  }, [initialImage, initialRender]);

  return (
    <section>
      <div className="visualizer">
        {isProcessing && <p>Processing 3D view...</p>}
        {initialImage ? (
          <div className="image-container">
            <img
              src={currentImage || initialImage}
              alt="Source"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </div>
        ) : (
          <p>No image found. Try uploading again.</p>
        )}
      </div>
      <button onClick={handleBack}>Back</button>
    </section>
  );
};

export default VisualizerId;
