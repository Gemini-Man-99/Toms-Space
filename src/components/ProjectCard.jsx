import { toSafeUrl } from '../lib/url.js';
import { EyeIcon, GithubIcon, PlayIcon, TrashIcon } from './Icons.jsx';

const LINK_ICONS = { eye: EyeIcon, github: GithubIcon };

const ProjectCard = ({ category, project, onPlay, onDelete }) => {
  const links = category.linkFields
    .map((field) => ({ ...field, href: toSafeUrl(project[field.name]) }))
    .filter((link) => link.href);

  return (
    <article className="project-card">
      <div className="project-media">
        <img src={project.image} alt={`${project.name} preview`} loading="lazy" />
        {/* Only the owner is given a delete button */}
        {onDelete && (
          <button
            type="button"
            className="project-delete"
            aria-label={`Delete ${project.name}`}
            onClick={() => onDelete(project)}
          >
            <TrashIcon />
          </button>
        )}
      </div>

      <div className="project-info">
        <h3 className="project-name">{project.name}</h3>

        {project.description && <p className="project-description">{project.description}</p>}

        {project.tools.length > 0 && (
          <ul className="chips" aria-label="Tools used">
            {project.tools.map((tool) => (
              <li key={tool} className="chip">
                {tool}
              </li>
            ))}
          </ul>
        )}

        {(links.length > 0 || project.video) && (
          <div className="project-links">
            {links.map((link) => {
              const LinkIcon = LINK_ICONS[link.icon];
              return (
                <a
                  key={link.name}
                  className="icon-link"
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${link.linkLabel}: ${project.name}`}
                  title={link.linkLabel}
                >
                  <LinkIcon />
                </a>
              );
            })}
            {project.video && (
              <button
                type="button"
                className="icon-link"
                aria-label={`Watch video: ${project.name}`}
                title="Watch video"
                onClick={() => onPlay({ source: project.video, title: project.name })}
              >
                <PlayIcon />
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default ProjectCard;
