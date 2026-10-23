import { useState } from 'react';
import CurvasVivas from './CurvasVivas';
import { useLocale } from '../i18n';
import './AboutMe.css';

const EMAIL = 'miguelsolanogeo@gmail.com';
const CV_HREF = '/pdfs/CV_SEP26.pdf';
const MIXCLOUD_HREF = 'https://www.mixcloud.com/MÄIpunktWAV/';

const SOCIALS = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/territorial.shp?igsh=MXh2Nmd0Y3dqaHZjNQ%3D%3D&utm_source=qr',
  },
  {
    label: 'Behance',
    href: 'https://www.behance.net/miguelmartine117',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/miguel-solano-5511a5273',
  },
];

/**
 * Final story page: title top-left, large portrait + Curvas Vivas ring,
 * quote under photo, bio on the right, thin socials bar with Side quests.
 */
export default function AboutMe({ active = false }) {
  const { t } = useLocale();
  const about = t.about;
  const [sideQuestOpen, setSideQuestOpen] = useState(false);

  return (
    <article
      className={['about-me', active ? 'is-active' : ''].filter(Boolean).join(' ')}
      aria-label={about.title}
    >
      <h2 className="about-me__title">{about.title}</h2>

      <div className="about-me__layout">
        <aside className="about-me__left">
          <div className="about-me__avatar">
            <CurvasVivas active={active} />
            <div className="about-me__photo">
              <img
                src="/images/aboutme.jpg"
                alt="Miguel Solano"
                width={360}
                height={360}
              />
            </div>
          </div>

          <blockquote className="about-me__quote">
            <p className="about-me__quote-text">{about.quote}</p>
            <cite className="about-me__quote-cite">{about.quoteCite}</cite>
          </blockquote>
        </aside>

        <section className="about-me__right" aria-label={about.title}>
          {about.paragraphs.map((p, i) => (
            <p key={`about-p-${i}`} className="about-me__text">
              {p}
            </p>
          ))}
          <p className="about-me__closing">{about.closing}</p>
          <div className="about-me__actions">
            <a className="about-me__email" href={`mailto:${EMAIL}`}>
              {about.emailCta}
            </a>
            <a
              className="about-me__cv"
              href={CV_HREF}
              target="_blank"
              rel="noopener noreferrer"
            >
              {about.cvCta}
            </a>
          </div>
        </section>
      </div>

      <footer className="about-me__socials">
        <div className="about-me__sidequest">
          <button
            type="button"
            className={[
              'about-me__sidequest-btn',
              sideQuestOpen ? 'is-open' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-expanded={sideQuestOpen}
            onClick={() => setSideQuestOpen((v) => !v)}
          >
            {about.sideQuestLabel}
          </button>
          {sideQuestOpen ? (
            <a
              className="about-me__sidequest-bubble"
              href={MIXCLOUD_HREF}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="about-me__sidequest-bubble-img"
                src="/images/mai.jpg"
                alt=""
              />
              <span className="about-me__sidequest-bubble-label">
                {about.sideQuestProject}
              </span>
            </a>
          ) : null}
        </div>

        <ul className="about-me__social-list">
          {SOCIALS.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </footer>
    </article>
  );
}
