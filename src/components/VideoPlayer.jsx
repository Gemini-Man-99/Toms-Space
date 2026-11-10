import { useEffect, useRef } from 'react';
import { CloseIcon } from './Icons.jsx';

/*
 * Plays a library video on top of the library modal. `source` is a URL
 * (online mode) or a Blob (local mode).
 */
const VideoPlayer = ({ source, title, onClose }) => {
  const videoRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const isUrl = typeof source === 'string';
    const url = isUrl ? source : URL.createObjectURL(source);
    video.src = url;
    video.play().catch(() => {
      // Autoplay can be blocked; the controls are right there
    });
    return () => {
      video.pause();
      video.removeAttribute('src');
      video.load();
      if (!isUrl) URL.revokeObjectURL(url);
    };
  }, [source]);

  useEffect(() => {
    closeRef.current.focus();
  }, []);

  return (
    <div
      className="lightbox"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="lightbox-panel" role="dialog" aria-modal="true" aria-label={title}>
        <button type="button" className="icon-btn" ref={closeRef} onClick={onClose} aria-label="Close video">
          <CloseIcon />
        </button>
        <video ref={videoRef} controls playsInline />
      </div>
    </div>
  );
};

export default VideoPlayer;
