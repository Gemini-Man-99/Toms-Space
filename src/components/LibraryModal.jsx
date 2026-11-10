import { useEffect, useId, useRef, useState } from 'react';
import { useLibrary } from '../hooks/useLibrary.js';
import { useOwner } from '../hooks/useOwner.js';
import { ArrowLeftIcon, CloseIcon, LockIcon, LogOutIcon, PlusIcon } from './Icons.jsx';
import OwnerLogin from './OwnerLogin.jsx';
import ProjectCard from './ProjectCard.jsx';
import ProjectForm from './ProjectForm.jsx';
import VideoPlayer from './VideoPlayer.jsx';
import './library.css';

/*
 * The modal behind each portfolio card: a grid of saved entries. The owner also
 * gets a "+" tile (add-form) and delete buttons; visitors only get to look and
 * play videos.
 *
 * It is a plain overlay instead of a native <dialog> on purpose: a <dialog>
 * opens in the browser's top layer, which sits above everything — including
 * the butterfly cursor — and would leave you with no visible pointer.
 */
const LibraryModal = ({ category, onClose }) => {
  const { items, status, add, remove } = useLibrary(category.id);
  const { online, canEdit, signIn, signOut } = useOwner();
  const [view, setView] = useState('library'); // 'library' | 'form' | 'login'
  const [playing, setPlaying] = useState(null); // { source, title } while a video is open
  const [notice, setNotice] = useState('');
  const panelRef = useRef(null);
  const titleId = useId();

  // Move focus into the modal on open, and back to it after the video or a form closes
  useEffect(() => {
    if (!playing) panelRef.current.focus({ preventScroll: true });
  }, [playing, view]);

  // Escape steps back one level: video → library → closed
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (playing) setPlaying(null);
      else if (view !== 'library') setView('library');
      else onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [playing, view, onClose]);

  const handleAdd = async (project) => {
    await add(project);
    setNotice('');
    setView('library');
  };

  const handleDelete = async (project) => {
    if (!window.confirm(`Delete "${project.name}"? This can't be undone.`)) return;
    try {
      await remove(project.id);
      setNotice('');
    } catch {
      setNotice('Could not delete that entry. Try again.');
    }
  };

  const CategoryIcon = category.Icon;
  const titles = { library: category.libraryTitle, form: category.formTitle, login: 'Owner sign-in' };

  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        ref={panelRef}
        inert={Boolean(playing)}
      >
        <header className="modal-header">
          {view !== 'library' && (
            <button type="button" className="icon-btn" onClick={() => setView('library')} aria-label="Back to library">
              <ArrowLeftIcon />
            </button>
          )}
          <span className="modal-icon">
            <CategoryIcon />
          </span>
          <h2 className="modal-title" id={titleId}>
            {titles[view]}
          </h2>
          {/* Online mode only: a quiet way for the owner to sign in or out */}
          {online && view === 'library' && (
            <button
              type="button"
              className="icon-btn"
              onClick={canEdit ? signOut : () => setView('login')}
              aria-label={canEdit ? 'Sign out' : 'Owner sign-in'}
              title={canEdit ? 'Sign out' : 'Owner sign-in'}
            >
              {canEdit ? <LogOutIcon /> : <LockIcon />}
            </button>
          )}
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close library">
            <CloseIcon />
          </button>
        </header>

        <div className="modal-body" key={view}>
          {view === 'form' && canEdit && <ProjectForm category={category} onSubmit={handleAdd} />}
          {view === 'login' && <OwnerLogin onSignIn={signIn} onDone={() => setView('library')} />}
          {(view === 'library' || (view === 'form' && !canEdit)) && (
            <>
              {notice && (
                <p className="field-error" role="alert">
                  {notice}
                </p>
              )}
              {status === 'error' && (
                <p className="field-error" role="alert">
                  {online
                    ? 'The library could not be loaded. Check your connection and try again.'
                    : 'The library could not be opened. Your browser may be blocking site storage.'}
                </p>
              )}
              {status === 'loading' && <p className="library-empty">Loading…</p>}
              <ul className="library-grid">
                {canEdit && (
                  <li>
                    <button type="button" className="add-tile" onClick={() => setView('form')}>
                      <span className="add-tile-icon">
                        <PlusIcon />
                      </span>
                      <span className="add-tile-label">{category.addLabel}</span>
                    </button>
                  </li>
                )}
                {items.map((project) => (
                  <li key={project.id}>
                    <ProjectCard
                      category={category}
                      project={project}
                      onPlay={setPlaying}
                      onDelete={canEdit ? handleDelete : undefined}
                    />
                  </li>
                ))}
              </ul>
              {status === 'ready' && items.length === 0 && (
                <p className="library-empty">{canEdit ? category.emptyText : 'Nothing here yet. Check back soon.'}</p>
              )}
            </>
          )}
        </div>
      </div>

      {playing && <VideoPlayer source={playing.source} title={playing.title} onClose={() => setPlaying(null)} />}
    </div>
  );
};

export default LibraryModal;
