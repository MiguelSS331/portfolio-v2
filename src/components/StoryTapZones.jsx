import './StoryTapZones.css';

/**
 * Left / right tap targets for Instagram-style chapter navigation (mobile).
 */
export default function StoryTapZones({
  enabled = false,
  onPrev,
  onNext,
}) {
  if (!enabled) return null;

  return (
    <div className="story-taps" aria-hidden="true">
      <button
        type="button"
        className="story-taps__zone story-taps__zone--prev"
        tabIndex={-1}
        onClick={onPrev}
        aria-label="Previous"
      />
      <button
        type="button"
        className="story-taps__zone story-taps__zone--next"
        tabIndex={-1}
        onClick={onNext}
        aria-label="Next"
      />
    </div>
  );
}
