// Calendrier de la partie (docs/GAME_DESIGN.md §6.2 ; docs/ARCHITECTURE.md §9.1).
//
// `game.month` compte les mois écoulés depuis le début : le mois 0 est mars de l'an 1 (la partie commence
// au printemps). Saison = floor(month / 3) % 4 (0 printemps, 1 été, 2 automne, 3 hiver), année =
// floor(month / 12) + 1. Tout est pur.

export const SEASON_LABELS = Object.freeze(['Printemps', 'Été', 'Automne', 'Hiver']);

/** Noms des mois dans l'ordre de l'année de jeu : le mois 0 est mars. */
export const MONTH_LABELS = Object.freeze([
  'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre', 'janvier', 'février',
]);

export const MONTHS_PER_SEASON = 3;
export const MONTHS_PER_YEAR = 12;

/** Saison (0..3) d'un mois écoulé. */
export function seasonOf(month) {
  return Math.floor(month / MONTHS_PER_SEASON) % 4;
}

/** Année (à partir de 1) d'un mois écoulé. */
export function yearOf(month) {
  return Math.floor(month / MONTHS_PER_YEAR) + 1;
}

/**
 * Calendrier d'une partie (ou de n'importe quel objet portant `month`).
 * @returns {{ month, season, seasonLabel, year, monthLabel, monthInSeason, monthOfYear }}
 *   month : mois écoulés ; season 0..3 ; year ≥ 1 ; monthInSeason 0..2 ; monthOfYear 0..11 (0 = mars).
 */
export function calendar(game) {
  const month = Math.max(0, Math.floor(game.month || 0));
  const season = seasonOf(month);
  return {
    month,
    season,
    seasonLabel: SEASON_LABELS[season],
    year: yearOf(month),
    monthLabel: MONTH_LABELS[month % MONTHS_PER_YEAR],
    monthInSeason: month % MONTHS_PER_SEASON,
    monthOfYear: month % MONTHS_PER_YEAR,
  };
}

/** Vrai si `month` est le dernier mois de sa saison : quand il s'achève, la saison aussi (mai, août, novembre, février). */
export function isSeasonEnd(month) {
  return (month + 1) % MONTHS_PER_SEASON === 0;
}

/** Vrai si `month` est le dernier mois de son année (février). */
export function isYearEnd(month) {
  return (month + 1) % MONTHS_PER_YEAR === 0;
}

/** Libellé court d'une date : « mars, an 1 ». */
export function dateLabel(game) {
  const c = calendar(game);
  return `${c.monthLabel}, an ${c.year}`;
}
