import './StoryProgress.css';

/**
 * Instagram-style progress segments across story chapters (mobile only).
 */
export default function StoryProgress({ count, activeIndex, visible = false }) {
  if (!visible || count < 1) return null;

  return (
    <div className="story-progress" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={`seg-${i}`}
          className={[
            'story-progress__seg',
            i < activeIndex ? 'is-done' : '',
            i === activeIndex ? 'is-active' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        />
      ))}
    </div>
  );
}
