// src/env.js
export function getEnv(key, fallback = undefined) {
  try {
    if (typeof window !== 'undefined' && window._env_ && window._env_[key] !== undefined) {
      return window._env_[key];
    }
  } catch (e) {
    // ignore
  }

  // fall back to Vite's import.meta.env during development/build
  try {
    return import.meta.env[key] ?? fallback;
  } catch (e) {
    return fallback;
  }
}

export default getEnv;
