/*
 * The one place the app saves and loads library entries. It picks online
 * (Supabase) or local (this browser only) depending on whether the Supabase
 * keys are set — see .env.example.
 */

import * as localStore from './localStore.js';
import { createRemoteStore } from './remoteStore.js';
import { supabase } from './supabaseClient.js';

export const usesRemoteStore = Boolean(supabase);

/** The bucket in supabase/setup.sql caps files at 50 MB (the free-plan limit). */
export const MAX_VIDEO_MB = 50;
export const MAX_VIDEO_BYTES = usesRemoteStore ? MAX_VIDEO_MB * 1024 * 1024 : Infinity;

const store = supabase ? createRemoteStore(supabase) : localStore;

export const listProjects = (category) => store.listProjects(category);
export const addProject = (project) => store.addProject(project);
export const removeProject = (id) => store.removeProject(id);
