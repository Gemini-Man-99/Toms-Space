/*
 * Online mode: entries live in a Supabase table (`projects`) and the files in
 * a public storage bucket (`portfolio`), so every visitor sees the same
 * library. Setup is in supabase/setup.sql.
 *
 * It is built from a client passed in, rather than importing one, so it can be
 * tested with a stand-in client and never touches the network by itself.
 *
 * Returns projects in the same shape as localStore.js, except that `image`
 * and `video` are public URLs instead of a data URL and a Blob.
 */

const BUCKET = 'portfolio';

const MIME_EXTENSIONS = { 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov' };

function extensionOf(file) {
  const fromName = file.name?.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '');
  return fromName || MIME_EXTENSIONS[file.type] || 'mp4';
}

async function dataUrlToBlob(dataUrl) {
  const response = await fetch(dataUrl);
  return response.blob();
}

export function createRemoteStore(supabase) {
  const files = () => supabase.storage.from(BUCKET);
  const publicUrl = (path) => files().getPublicUrl(path).data.publicUrl;

  const toProject = (row) => ({
    id: row.id,
    category: row.category,
    name: row.name,
    description: row.description ?? '',
    tools: row.tools ?? [],
    liveUrl: row.live_url ?? '',
    githubUrl: row.github_url ?? '',
    image: publicUrl(row.image_path),
    video: row.video_path ? publicUrl(row.video_path) : null,
    createdAt: Date.parse(row.created_at),
  });

  return {
    /** Newest first. */
    async listProjects(category) {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(toProject);
    },

    /** Uploads the files, then saves the row. Cleans the files up again if any step fails. */
    async addProject(project) {
      const uploaded = [];
      const upload = async (path, body, contentType) => {
        const { error } = await files().upload(path, body, {
          contentType,
          cacheControl: '31536000', // names are unique, so browsers can cache these for a year
          upsert: false,
        });
        if (error) throw error;
        uploaded.push(path);
        return path;
      };

      try {
        const imagePath = await upload(`images/${project.id}.jpg`, await dataUrlToBlob(project.image), 'image/jpeg');
        const videoPath = project.video
          ? await upload(`videos/${project.id}.${extensionOf(project.video)}`, project.video, project.video.type || 'video/mp4')
          : null;

        const { data, error } = await supabase
          .from('projects')
          .insert({
            id: project.id,
            category: project.category,
            name: project.name,
            description: project.description,
            tools: project.tools,
            live_url: project.liveUrl ?? '',
            github_url: project.githubUrl ?? '',
            image_path: imagePath,
            video_path: videoPath,
          })
          .select()
          .single();
        if (error) throw error;
        return toProject(data);
      } catch (error) {
        if (uploaded.length) await files().remove(uploaded);
        throw error;
      }
    },

    /** Deletes the row first (so a failure never leaves a card pointing at missing files), then its files. */
    async removeProject(id) {
      const { data: row, error: readError } = await supabase
        .from('projects')
        .select('image_path, video_path')
        .eq('id', id)
        .maybeSingle();
      if (readError) throw readError;

      // Row-level security hides rows you may not delete instead of raising an error,
      // so an empty result means "not allowed" (or already gone).
      const { data: deleted, error } = await supabase.from('projects').delete().eq('id', id).select('id');
      if (error) throw error;
      if (!deleted?.length) throw new Error('Nothing was deleted');

      const paths = [row?.image_path, row?.video_path].filter(Boolean);
      if (paths.length) await files().remove(paths); // leftovers here are harmless, so errors are ignored
    },
  };
}
