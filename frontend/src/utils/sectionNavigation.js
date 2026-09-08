/** Section IDs — keep in sync with section id= attributes */
export const SECTION_IDS = {
  HOME:       'home',
  ABOUT:      'about',
  SKILLS:     'skills',
  PROJECTS:   'projects',
  EXPERIENCE: 'experience',
  CONTACT:    'contact',
};

export const SECTION_ID_LIST = Object.values(SECTION_IDS);

export const MOBILE_MENU_CLOSE_MS = 320;

export const getSectionHref = (sectionId, pathname = '/') =>
  pathname === '/' ? `#${sectionId}` : `/#${sectionId}`;

export const scrollToSectionById = (sectionId, behavior = 'smooth') => {
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior, block: 'start' });
    return true;
  }
  setTimeout(() => {
    const retryEl = document.getElementById(sectionId);
    if (retryEl) {
      retryEl.scrollIntoView({ behavior, block: 'start' });
    } else {
      window.location.hash = sectionId;
    }
  }, 80);
  return false;
};

export const isValidSectionId = (id, sections = null) => {
  if (!SECTION_ID_LIST.includes(id)) return false;
  if (sections && sections[id] === false) return false;
  return true;
};
