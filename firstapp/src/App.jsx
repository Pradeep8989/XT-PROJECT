import React from 'react';
import FullScreenVideoAd from "@/components/FullScreenVideoAd.jsx";

const App = () => {
  const videoSources = [
    '/videos/video1.mp4',
    '/videos/video2.mp4',
  ];

  return (
    <div>
      <FullScreenVideoAd videoSources={videoSources} />
      {/* Other content of your main page */}
    </div>
  );
};

export default App;