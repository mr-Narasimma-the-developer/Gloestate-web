import { useState, useEffect, useRef } from "react";
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./Lightbox.css";

const Lightbox = ({ images, startIndex = 0, onClose }) => {
  const [index, setIndex] = useState(startIndex);
  const touchStartX = useRef(null);

  const goNext = () => setIndex((i) => (i + 1) % images.length);
  const goPrev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;

    if (deltaX > 50) goPrev();
    else if (deltaX < -50) goNext();

    touchStartX.current = null;
  };

  return (
    <div
      className="lightbox-overlay"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button className="lightbox-close" onClick={onClose} aria-label="Close">
        <FaTimes />
      </button>

      {images.length > 1 && (
        <button
          className="lightbox-nav prev"
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          aria-label="Previous image"
        >
          <FaChevronLeft />
        </button>
      )}

      <img
        src={images[index]}
        alt=""
        className="lightbox-image"
        onClick={(e) => e.stopPropagation()}
      />

      {images.length > 1 && (
        <button
          className="lightbox-nav next"
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          aria-label="Next image"
        >
          <FaChevronRight />
        </button>
      )}

      {images.length > 1 && (
        <div className="lightbox-counter">{index + 1} / {images.length}</div>
      )}
    </div>
  );
};

export default Lightbox;