import Button from "components/ui/Button";
import { generate3Dview } from "lib/ai.action";
import { Box, X, Download, Loader2, Share2 } from "lucide-react";
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
    <div className="visualizer">
      <nav className="topbar">
        <div className="brand">
          <Box className="logo" />
          <span className="name">Roomify</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleBack} className="exit">
          <X className="icon" /> Exit Editor
        </Button>
      </nav>

      <section className="content">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-meta">
              <p>Project</p>
              <h2>{name || "Untitled Project"}</h2>
              <p className="note">Created by You</p>
            </div>
            <div className="panel-actions">
              <Button
                size="sm"
                onClick={() => {}}
                className="export"
                disabled={!currentImage || isProcessing}
              >
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
              <Button size="sm" onClick={() => {}} className="share">
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
            </div>
          </div>
          <div className={`render-area ${isProcessing ? "is-processing" : ""}`}>
            {currentImage ? (
              <img src={currentImage} alt="AI Render" className="render-img" />
            ) : (
              <div className="render-placeholder">
                {initialImage && (
                  <img
                    src={initialImage}
                    alt="Original"
                    className="render-fallback"
                  />
                )}
              </div>
            )}
          </div>

          <div className="view-container">
            {isProcessing ? (
              <div className="loading-state">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p>Generating your 3D view...</p>
              </div>
            ) : (
              <div className="image-wrapper">
                <img
                  src={currentImage || initialImage}
                  alt="Visualization"
                  className="main-image"
                />
              </div>
            )}
          </div>
        </div>{" "}
      </section>
    </div>
  );
};

export default VisualizerId;
