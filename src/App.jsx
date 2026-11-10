import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import tomsLogo from './assets/tomslogo.svg';
import bgVideo from './assets/1001496755.mp4';
import Butterfly from './components/Butterfly.jsx';
import Hero from './components/Hero.jsx';
import LibraryModal from './components/LibraryModal.jsx';
import { CATEGORIES } from './data/categories.js';

const skills = [
  'Singer',
  'Songwriter',
  'Guitarist',
  'UX Designer',
  'Frontend Dev',
  'Visual Storyteller',
];

const App = () => {
  const [openId, setOpenId] = useState(null);
  const lastTrigger = useRef(null);
  const openCategory = CATEGORIES.find((category) => category.id === openId) ?? null;

  const openLibrary = (id, trigger) => {
    lastTrigger.current = trigger;
    setOpenId(id);
  };
  const closeLibrary = useCallback(() => setOpenId(null), []);

  // Hand focus back to the card that opened the modal
  useEffect(() => {
    if (openId === null) lastTrigger.current?.focus();
  }, [openId]);

  return (
    <>
      {/* `inert` keeps keyboard focus and screen readers inside the modal while it is open */}
      <div className="app-container" inert={openCategory !== null}>
        {/* Page background: looping video with a palette-tinted veil on top */}
        <video
          className="bg-video"
          src={bgVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        <div className="bg-veil" aria-hidden="true" />

        {/* Navigation */}
        <nav id="navbar" className="navbar">
          <div className="nav-logo-container">
            <img
              src= {tomsLogo}
              alt="Logo"
              className="nav-logo"
            />
          </div>
          <div className="nav-links">
            <a href="#hero" className="nav-link">Home</a>
            <a href="#portfolio" className="nav-link">Portfolio</a>
            <a href="#skills" className="nav-link">Skills</a>
            <a href="#about" className="nav-link">About</a>
          </div>
        </nav>

        {/* Hero Section */}
        <Hero />

        {/* Portfolio Section */}
        <section id="portfolio" className="portfolio-section">
          <h2 className="section-title">Portfolio</h2>
          <div className="portfolio-grid">
            {CATEGORIES.map((category) => {
              const CategoryIcon = category.Icon;
              return (
                <button
                  key={category.id}
                  type="button"
                  className="portfolio-card"
                  aria-haspopup="dialog"
                  onClick={(event) => openLibrary(category.id, event.currentTarget)}
                >
                  <span className="card-icon">
                    <CategoryIcon />
                  </span>
                  <span className="card-title">{category.cardTitle}</span>
                  <span className="card-text">{category.cardText}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="skills-section">
          <h2 className="section-title">Skills Acquired:</h2>
          <div className="skills-carousel">
            <div className="skills-track">
              {/* The list is rendered twice so the loop has no visible seam;
                  the second copy is hidden from assistive tech. */}
              <ul className="skills-set">
                {skills.map((skill) => (
                  <li key={skill} className="skill-circle">
                    <span className="skill-name">{skill}</span>
                  </li>
                ))}
              </ul>
              <ul className="skills-set" aria-hidden="true">
                {skills.map((skill) => (
                  <li key={skill} className="skill-circle">
                    <span className="skill-name">{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="about-section">
          <h2 className="section-title">About Me</h2>
          <p className="about-text">

           Where do I even start? Creativity is everything to me, to be honest.<br/>
           I've always wanted to create things my own way, to tap into the world of imagination
           where unbelievable things exist and can become a reality.<br/> I'm just that
           dude from nowhere for now, but I'd like to see myself as a visionary. <br/>
           I know I'm nowhere near my targets, but give me a couple of years
           when the dreams are no longer just dreams.
          </p>
        </section>
      </div>

      {openCategory && <LibraryModal key={openCategory.id} category={openCategory} onClose={closeLibrary} />}

      <Butterfly />
    </>
  );
};

export default App;
