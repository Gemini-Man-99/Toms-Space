import { useId, useState } from 'react';
import { imageToDataUrl } from '../lib/image.js';
import { MAX_VIDEO_BYTES, MAX_VIDEO_MB, usesRemoteStore } from '../lib/projectStore.js';
import { toSafeUrl } from '../lib/url.js';

/* The add-form. Which inputs show up is decided by the category config. */
const ProjectForm = ({ category, onSubmit }) => {
  const uid = useId();
  const [imageData, setImageData] = useState('');
  const [imageError, setImageError] = useState('');
  const [videoError, setVideoError] = useState('');
  const [reading, setReading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleImage = async (event) => {
    const input = event.target;
    const file = input.files?.[0];
    setImageData('');
    setImageError('');
    if (!file) return;

    setReading(true);
    try {
      setImageData(await imageToDataUrl(file));
    } catch {
      input.value = '';
      setImageError('That file could not be read as an image. Try a PNG or JPG.');
    } finally {
      setReading(false);
    }
  };

  const handleVideo = (event) => {
    const input = event.target;
    const file = input.files?.[0];
    setVideoError('');
    if (file && file.size > MAX_VIDEO_BYTES) {
      input.value = '';
      setVideoError(
        `That video is ${Math.round(file.size / 1048576)} MB and the limit is ${MAX_VIDEO_MB} MB. Compress it (for example with HandBrake) and try again.`,
      );
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const project = {
      id: crypto.randomUUID(),
      category: category.id,
      name: String(form.get('name')).trim(),
      image: imageData,
      description: String(form.get('description') ?? '').trim(),
      tools: form.getAll('tools'),
      createdAt: Date.now(),
    };
    for (const field of category.linkFields) {
      project[field.name] = toSafeUrl(String(form.get(field.name) ?? ''));
    }
    const video = form.get('video');
    project.video = video instanceof File && video.size > 0 ? video : null;

    setSaving(true);
    setError('');
    try {
      await onSubmit(project);
    } catch {
      setSaving(false);
      setError(
        usesRemoteStore
          ? 'Could not save this. Check your connection and that you are still signed in, then try again.'
          : 'Could not save this. Your browser storage may be full or blocked — try a smaller video or image.',
      );
    }
  };

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <div className="field">
        <label className="field-label" htmlFor={`${uid}-image`}>
          {category.imageLabel}
        </label>
        <input
          id={`${uid}-image`}
          className="field-input file-input"
          type="file"
          accept="image/*"
          required
          onChange={handleImage}
        />
        {reading && <p className="field-hint">Reading image…</p>}
        {imageError && (
          <p className="field-error" role="alert">
            {imageError}
          </p>
        )}
        {imageData && <img className="form-preview" src={imageData} alt="Selected preview" />}
      </div>

      <div className="field">
        <label className="field-label" htmlFor={`${uid}-name`}>
          Name
        </label>
        <input id={`${uid}-name`} className="field-input" type="text" name="name" required maxLength={80} />
      </div>

      {category.hasDescription && (
        <div className="field">
          <label className="field-label" htmlFor={`${uid}-description`}>
            Description
          </label>
          <textarea id={`${uid}-description`} className="field-input" name="description" rows={4} maxLength={600} />
        </div>
      )}

      {category.tools.length > 0 && (
        <fieldset className="field">
          <legend className="field-label">Tools used</legend>
          <div className="tool-options">
            {category.tools.map((tool) => (
              <label key={tool} className="tool-option">
                <input type="checkbox" name="tools" value={tool} />
                <span>{tool}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {category.linkFields.map((field) => (
        <div className="field" key={field.name}>
          <label className="field-label" htmlFor={`${uid}-${field.name}`}>
            {field.label}
          </label>
          <input
            id={`${uid}-${field.name}`}
            className="field-input"
            type="url"
            name={field.name}
            placeholder="https://"
          />
        </div>
      ))}

      {category.hasVideo && (
        <div className="field">
          <label className="field-label" htmlFor={`${uid}-video`}>
            Video file
          </label>
          <input
            id={`${uid}-video`}
            className="field-input file-input"
            type="file"
            name="video"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={handleVideo}
          />
          {usesRemoteStore && <p className="field-hint">MP4, WebM or MOV, up to {MAX_VIDEO_MB} MB.</p>}
          {videoError && (
            <p className="field-error" role="alert">
              {videoError}
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="btn-primary" disabled={reading || saving}>
        {saving ? (usesRemoteStore ? 'Uploading…' : 'Saving…') : 'Enter'}
      </button>
    </form>
  );
};

export default ProjectForm;
