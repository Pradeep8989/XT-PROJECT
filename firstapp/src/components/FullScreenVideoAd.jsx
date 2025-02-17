import React, { useState, useRef, useEffect } from "react";
import "@/FullScreenVideoAd.css";

const FullScreenVideoAd = ({ videoSources }) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [isVideoReady, setIsVideoReady] = useState(false);  // Track when video feed is ready
  const videoRef = useRef(null);
  const cameraRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Handle looping ads
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleVideoEnd = () => {
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videoSources.length);
    };

    videoElement.addEventListener("ended", handleVideoEnd);
    return () => {
      videoElement.removeEventListener("ended", handleVideoEnd);
    };
  }, [videoSources.length]);

  // Ensure video autoplay works
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.warn("Autoplay prevented:", error);
      });
    }
  }, [currentVideoIndex]);

  // Open camera and show live stream
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      if (cameraRef.current) {
        cameraRef.current.srcObject = stream;
      }

      mediaStreamRef.current = stream; // Store stream for stopping later
      setIsCameraOpen(true);
      setCapturedPhoto(null);
      setIsVideoReady(false); // Initially set video to not ready
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (!cameraRef.current || !canvasRef.current || !isVideoReady) {
      console.warn("Camera feed is not ready yet.");
      return;
    }

    const videoElement = cameraRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      console.warn("Camera feed is not ready yet.");
      return;
    }

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Convert to Base64 and store
    setCapturedPhoto(canvas.toDataURL("image/png"));
  };

  // Handle video readiness
  const handleVideoReady = () => {
    setIsVideoReady(true); // Set the video as ready once it starts playing
  };

  // Close camera and stop video stream
  const closeCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
    setCapturedPhoto(null);
  };

  return (
    <div className="fullscreen-video-container">
      <img src="/videos/amul-logo.png" alt="Logo" className="video-logo" />

      {/* Show ads if the camera is not open */}
      {!isCameraOpen && (
        <video
          ref={videoRef}
          className="fullscreen-video"
          autoPlay
          muted
          playsInline
          src={videoSources[currentVideoIndex]}
        />
      )}

      {/* Show live camera feed */}
      {isCameraOpen && (
        <video
          ref={cameraRef}
          className="camera-preview"
          autoPlay
          playsInline
          onPlaying={handleVideoReady} // Mark the video as ready once it starts playing
        />
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Control Buttons */}
      <div className="video-footer">
        {!isCameraOpen ? (
          <button className="go-button" onClick={openCamera}>Go</button>
        ) : (
          <>
            <button className="capture-button" onClick={capturePhoto}>Capture</button>
            <button className="close-button" onClick={closeCamera}>Close</button>
          </>
        )}
      </div>

      {/* Show Captured Photo */}
      {capturedPhoto && (
        <div className="captured-photo-container">
          <img src={capturedPhoto} alt="Captured" className="captured-photo" />
        </div>
      )}
    </div>
  );
};

export default FullScreenVideoAd;
