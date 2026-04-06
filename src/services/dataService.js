import { INIT } from '../data/team';
import { HISTORY, computePM } from '../data/history';
import { DATA_VERSION } from '../data/config';
import storageService from './storageService';

const base = import.meta.env.BASE_URL;

const CHARACTER_IMAGES = {
  villain: `${base}images/villain.png`,
  overlord: `${base}images/overlord.png`,
  sorcerer: `${base}images/sorcerer.png`,
  slayer: `${base}images/slayer.png`,
  knight: `${base}images/knight.png`,
  smasher: `${base}images/smasher.png`,
  scout: `${base}images/scout.png`,
  peasant: `${base}images/peasant.png`,
};

const LOGO_IMAGE = `${base}images/logo-orange.png`;

const dataService = {
  async getTeamData() {
    // FUTURE: return await fetch('/api/goals/current').then(r => r.json());
    return INIT;
  },

  async getHistory() {
    // FUTURE: return await fetch('/api/goals/history').then(r => r.json());
    return HISTORY;
  },

  computePM,

  async saveTeamData(members) {
    // FUTURE: await fetch('/api/goals/current', { method: 'PUT', body: JSON.stringify(members) });
    await storageService.set('remitian-members', JSON.stringify(members));
  },

  async loadSavedTeamData() {
    const ver = await storageService.get('remitian-version');
    if (ver?.value === DATA_VERSION) {
      const r = await storageService.get('remitian-members');
      if (r?.value) return JSON.parse(r.value);
    } else {
      await storageService.set('remitian-version', DATA_VERSION);
      try { await storageService.delete('remitian-members'); } catch {}
    }
    return null;
  },

  async resetData() {
    await storageService.delete('remitian-members');
    await storageService.set('remitian-version', DATA_VERSION);
  },

  getVersion() {
    return DATA_VERSION;
  },

  getCharacterImages() {
    // FUTURE: return await fetch('/api/assets/characters').then(r => r.json());
    return CHARACTER_IMAGES;
  },

  getLogoImage() {
    return LOGO_IMAGE;
  },
};

export default dataService;
