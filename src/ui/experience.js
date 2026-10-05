// Habillage de la vallée, parcours, réglages et accueil. La simulation reste dans core/.
import { el, fmt, setText } from "./dom.js";
import { icon } from "./icons.js";
import { currentGoal, GOALS, journeyScore } from "../core/journey.js";
import { LEVELS, LEVEL_BY_ID } from "../data/levels.js";
import { evaluateGoals } from "../core/career-session.js";
import { rememberLesson } from "../core/career.js";
import { tutorialState, tutorialProgress } from "../core/tutorial.js";
import { assetUrl } from "../version.js";
export function tileImage(id, cls = "") {
  return el("img", {
    class: `tile-preview ${cls}`,
    src: assetUrl(`assets/previews/${id}.webp`),
    alt: "",
    draggable: false,
    loading: "lazy",
  });
}
export function createExperience({
  root,
  app,
  getGame,
  applyGame,
  audio,
  claim,
  startGame,
  openLevel,
  restored,
  homeView,
  fitView,
  zoom,
  pause,
  onResize,
}) {
  let welcomed = false,
    shownResult = false,
    lastGoal = "";
  const button = (name, label, fn, cls = "") =>
    el(
      `button.round-button${cls ? "." + cls : ""}`,
      { type: "button", "aria-label": label, title: label, onclick: fn },
      icon(name),
    );
  const openSettings = () => settings();
  const brand = el(
    "div.brand",
    el("div.brand-mark", icon("house")),
    el(
      "div.brand-copy",
      el("span.brand-name", "tiletown"),
      el("span.brand-tag", "UNE VILLE QUI RESPIRE"),
    ),
  );
  const soundBtn = button("sound", "Activer ou couper la musique", () => {
    audio.unlock();
    audio.set("music", !audio.settings.music);
    refreshSound();
  });
  const settingsBtn = button("gear", "Réglages", openSettings);
  const masthead = el(
    "div.masthead",
    brand,
    el("div.masthead-actions", soundBtn, settingsBtn),
  );
  app.hud.element.prepend(masthead);
  const goalText = el("strong", "Un village prend vie"),
    goalSub = el("span", "Votre prochaine étape"),
    goalFill = el("span.mission-fill");
  const mission = el(
    "button.mission",
    {
      type: "button",
      "aria-label": "Objectif de la vallée",
      onclick: () => openGoals(),
    },
    el("span.mission-icon", icon("flag")),
    el(
      "span.mission-copy",
      goalSub,
      goalText,
      el("span.mission-track", goalFill),
    ),
    el("span.mission-arrow", icon("arrow")),
  );
  root.append(mission);
  const cameras = el(
    "div.camera-tools",
    button("plus", "Zoomer", () => zoom(0.8)),
    button("minus", "Dézoomer", () => zoom(1.25)),
    button("compass", "Vue d’ensemble", fitView),
    button("house", "Recentrer sur le village", homeView),
  );
  root.append(cameras);
  const help = el(
    "div.gesture-hint",
    icon("compass"),
    el("span", "Glissez pour explorer · pincez pour zoomer"),
  );
  root.append(help);
  const quick = el(
    "div.quick-build",
    el(
      "div.quick-heading",
      el("span", "À vous de faire pousser la ville"),
      el("span.quick-kicker", "CONSTRUIRE"),
    ),
  );
  const picks = el("div.quick-grid");
  for (const t of [
    { id: "house", name: "Quartier", price: 60 },
    { id: "shop", name: "Commerce", price: 80 },
    { id: "tree-planting", name: "Forêt", price: 30 },
  ]) {
    picks.append(
      el(
        "button.quick-card",
        {
          type: "button",
          "aria-label": `Construire : ${t.name}`,
          onclick: () => take(t.id),
        },
        tileImage(t.id),
        el(
          "span",
          el("strong", t.name),
          el("span.quick-price", `${t.price} $`),
        ),
        el("span.quick-plus", "+"),
      ),
    );
  }
  quick.append(picks);
  root.append(quick);
  function take(id) {
    app.sheets.close();
    app.placement.take(id);
    audio.effect("tap");
    onResize();
  }
  function refreshSound() {
    soundBtn.replaceChildren(icon(audio.settings.music ? "sound" : "mute"));
    soundBtn.setAttribute("aria-pressed", String(audio.settings.music));
  }
  function openGoals() {
    const game = getGame(),
      goal = currentGoal(game);
    const body = el(
      "div.journey-body",
      el(
        "p.sheet-hint",
        "Une belle ville grandit avec sa vallée. Chaque étape vous aide à trouver cet équilibre.",
      ),
    );
    if (goal) {
      body.append(
        el(
          "div.goal-feature",
          tileImage(goal.tile || "park"),
          el(
            "div",
            el("span.eyebrow", `ÉTAPE ${goal.index + 1} / ${GOALS.length}`),
            el("h3", goal.title),
            el("p", goal.text),
            el("strong", `${goal.value} / ${goal.target}`),
          ),
        ),
      );
      body.append(
        el(
          "button.btn.btn--wide",
          {
            type: "button",
            onclick: () => {
              if (currentGoal(getGame())?.ready) {
                claim();
                audio.effect("reward");
                openGoals();
              } else if (goal.tile) take(goal.tile);
            },
          },
          goal.ready ? `Recevoir ${goal.reward} $` : "Construire pour avancer",
          icon(goal.ready ? "coin" : "arrow"),
        ),
      );
    } else
      body.append(
        el("h3", "Votre vallée a trouvé son équilibre"),
        el(
          "p",
          "Toutes les étapes sont accomplies. Continuez à faire grandir votre ville jusqu’au bilan des trois ans.",
        ),
      );
    const level = LEVEL_BY_ID[game.levelId];
    if (level) {
      body.append(
        el("h3", level.title),
        el("p.sheet-hint", "À accomplir avant la fin des trois années :"),
      );
      for (const g of evaluateGoals(game))
        body.append(
          el(
            "div.metric-row",
            el("span", g.label),
            el("strong", `${g.value}/${g.target}${g.done ? " ✓" : ""}`),
          ),
        );
      body.append(
        el(
          "button.btn.btn--ghost",
          { type: "button", onclick: careerMap },
          "Les cinq vallées",
        ),
      );
      const progress = tutorialProgress("base", game.career.seen);
      body.append(
        el(
          "button.btn.btn--ghost",
          { type: "button", onclick: openTutorial },
          icon("book"),
          `Premiers pas · ${progress.done}/${progress.total} leçons`,
        ),
      );
    }
    const list = el("div.journey-list");
    for (const g of GOALS) {
      const done = game.journey?.claimed?.includes(g.id);
      list.append(
        el(
          "div.journey-row",
          icon(done ? "check" : "flag"),
          el("span", g.title),
          el("strong", done ? "Accompli" : `+${g.reward} $`),
        ),
      );
    }
    body.append(list);
    app.sheets.open({
      id: "journey",
      title: "Le carnet de votre vallée",
      content: body,
    });
  }
  function settings() {
    const s = audio.settings;
    const body = el("div.settings-body");
    const toggle = (label, value, fn) => {
      const b = el(
        "button.setting-toggle",
        {
          type: "button",
          "aria-pressed": String(value),
          onclick: () => {
            value = !value;
            b.setAttribute("aria-pressed", String(value));
            b.lastElementChild.textContent = value ? "Activé" : "Désactivé";
            fn(value);
          },
        },
        el("span", label),
        el("strong", value ? "Activé" : "Désactivé"),
      );
      return b;
    };
    body.append(
      el("span.eyebrow", "L’AMBIANCE DE VOTRE VALLÉE"),
      toggle("Musique", s.music, (v) => {
        audio.unlock();
        audio.set("music", v);
        refreshSound();
      }),
      toggle("Sons du jeu", s.effects, (v) => audio.set("effects", v)),
    );
    const slider = el("input", {
      type: "range",
      min: 0,
      max: 100,
      value: Math.round(s.volume * 100),
      "aria-label": "Volume de la musique",
      oninput: (e) => audio.set("volume", Number(e.target.value) / 100),
    });
    body.append(el("label.volume-row", el("span", "Volume musical"), slider));
    const song = el(
      "span.now-playing",
      `${audio.track.title} · ${audio.track.author}`,
    );
    body.append(
      el(
        "div.track-row",
        song,
        button("arrow", "Morceau suivant", () => {
          audio.unlock();
          audio.next();
          song.textContent = `${audio.track.title} · ${audio.track.author}`;
        }),
      ),
    );
    body.append(
      el("span.eyebrow", "À VOTRE RYTHME"),
      toggle("Animations réduites", app.a11y.reducedMotion(), (v) => {
        app.a11y.apply({ reducedMotion: v });
      }),
      toggle(
        "Lumière du soir",
        document.body.classList.contains("evening"),
        (v) => {
          document.body.classList.toggle("evening", v);
          app.renderer.setEvening(v);
        },
      ),
    );
    body.append(
      el(
        "button.btn.btn--ghost",
        { type: "button", onclick: careerMap },
        icon("flag"),
        "Les cinq vallées",
      ),
      el(
        "button.btn.btn--ghost",
        { type: "button", onclick: () => helpSheet() },
        icon("book"),
        "Comment jouer",
      ),
      el(
        "button.btn.btn--ghost",
        { type: "button", onclick: () => newValley() },
        icon("plus"),
        "Nouvelle vallée",
      ),
    );
    body.append(
      el(
        "p.credit-note",
        "Modèles : Kenney, Quaternius et Gobkit (CC0). Musiques : Komiku, Zane Little et Spring Spring (CC0). Police : Nunito (OFL). Icônes : Lucide (ISC). Crédits complets dans le dépôt.",
      ),
    );
    app.sheets.open({
      id: "settings",
      title: "Prenez le temps",
      content: body,
    });
  }
  function helpSheet() {
    const body = el("div.help-body");
    const steps = [
      [
        "house",
        "Construisez en deux gestes",
        "Choisissez un bâtiment, touchez une case, puis validez. Les rues se dessinent toutes seules.",
      ],
      [
        "leaf",
        "Laissez la nature respirer",
        "Gardez les forêts anciennes. Les espaces verts améliorent l’air et le bonheur de vos habitants.",
      ],
      [
        "people",
        "Un village équilibré",
        "Maisons, emplois, nourriture, eau et énergie vont ensemble. Touchez les indicateurs pour consulter le détail.",
      ],
      [
        "compass",
        "Explorez à votre rythme",
        "Glissez pour déplacer la carte, pincez pour zoomer. Appui long : détail d’une case. La vitesse et la pause se règlent en haut.",
      ],
    ];
    for (const [i, title, text] of steps)
      body.append(
        el("div.help-step", icon(i), el("div", el("h3", title), el("p", text))),
      );
    body.append(
      el(
        "p.sheet-hint",
        "Votre partie se sauvegarde automatiquement sur cet appareil. Le temps s’arrête quand vous quittez le jeu.",
      ),
    );
    app.sheets.open({
      id: "help",
      title: "Bienvenue dans la vallée",
      content: body,
    });
  }
  function openTutorial() {
    const game = getGame();
    const state = tutorialState("base", game, game.career?.seen || [], {
      layer: app.layers.kind,
    });
    const body = el("div.help-body");
    if (!state) {
      body.append(
        el("h3", "Vous connaissez les chemins de la vallée"),
        el(
          "p",
          "Les dix leçons sont terminées. Votre carnet garde les objectifs et les primes à venir.",
        ),
      );
    } else {
      body.append(
        el("span.eyebrow", `LEÇON ${state.index + 1} / ${state.total}`),
        el("h3", state.title),
        el("p", state.text),
      );
      if (state.done && state.reward?.text)
        body.append(el("p.sheet-hint", state.reward.text));
      const remember = () => {
        const current = getGame();
        if (current.career)
          applyGame(
            {
              ...current,
              career: rememberLesson(current.career, state.lesson.id),
            },
            { kind: "tutorial" },
          );
        openTutorial();
      };
      body.append(
        el(
          "button.btn",
          {
            type: "button",
            onclick: () => {
              if (state.done) {
                remember();
                return;
              }
              if (state.tile) take(state.tile);
              else {
                app.sheets.close();
                const h = state.highlight;
                if (h?.kind === "tile")
                  app.renderer.setHighlight([{ x: h.x, y: h.y }]);
                if (h?.kind === "tab" && h.id === "layers")
                  app.layers.set("air");
                const selector =
                  h?.kind === "tab"
                    ? `.tab--${h.id}`
                    : h?.kind === "gauge"
                      ? `.gauge--${h.id}`
                      : h?.kind === "speed"
                        ? "#speed"
                        : null;
                if (selector) {
                  const node = document.querySelector(selector);
                  node?.classList.add("tutorial-focus");
                  setTimeout(
                    () => node?.classList.remove("tutorial-focus"),
                    5000,
                  );
                }
              }
            },
          },
          state.done ? "Leçon suivante" : "Me montrer",
          icon("arrow"),
        ),
      );
      if (!state.done)
        body.append(
          el(
            "button.btn.btn--ghost",
            { type: "button", onclick: remember },
            "Passer cette leçon",
          ),
        );
    }
    app.sheets.open({ id: "tutorial", title: "Premiers pas", content: body });
  }
  function careerMap() {
    const game = getGame(),
      career = game.career;
    const body = el(
      "div.settings-body",
      el(
        "p.sheet-hint",
        "Cinq vallées à découvrir. Choisir une vallée remplace la partie en cours ; vos étoiles, vos leçons et vos déblocages sont conservés.",
      ),
    );
    for (const level of LEVELS) {
      const unlocked =
        career?.unlocked?.includes(level.id) ||
        (!career && level.id === "vallee-1");
      body.append(
        el(
          "button.mode-card",
          {
            type: "button",
            "aria-disabled": String(!unlocked),
            onclick: () => {
              if (!unlocked) {
                app.toasts.show({
                  text: "Terminez la vallée précédente pour ouvrir celle-ci.",
                });
                return;
              }
              shownResult = false;
              openLevel(level.id);
              refresh();
            },
          },
          icon(unlocked ? "flag" : "leaf"),
          el(
            "span",
            el("strong", level.title),
            el("small", level.subtitle),
            el(
              "small",
              unlocked
                ? "★".repeat(career?.stars?.[level.id] || 0) +
                    "☆".repeat(3 - (career?.stars?.[level.id] || 0))
                : "À découvrir",
            ),
          ),
        ),
      );
    }
    app.sheets.open({
      id: "career",
      title: "Les chemins de la vallée",
      content: body,
    });
  }
  function newValley() {
    const body = el(
      "div.settings-body",
      el(
        "p.sheet-hint",
        "Commencer une nouvelle vallée remplacera la partie sauvegardée sur cet appareil.",
      ),
    );
    for (const [mode, label, desc] of [
      [
        "career",
        "Une nouvelle aventure",
        "Trois ans pour créer une ville qui respire.",
      ],
      [
        "sandbox",
        "Une vallée libre",
        "Tout le catalogue et 100 000 $ pour imaginer sans attendre.",
      ],
    ])
      body.append(
        el(
          "button.mode-card",
          {
            type: "button",
            onclick: () => {
              startGame(mode, true);
              shownResult = false;
              app.sheets.close();
              refresh();
            },
          },
          icon(mode === "career" ? "flag" : "leaf"),
          el("span", el("strong", label), el("small", desc)),
        ),
      );
    body.append(
      el(
        "button.btn.btn--ghost",
        { type: "button", onclick: () => app.sheets.close() },
        "Garder ma vallée",
      ),
    );
    app.sheets.open({
      id: "new-valley",
      title: "Une nouvelle histoire",
      content: body,
    });
  }
  function welcome() {
    let seen = false;
    try {
      seen = localStorage.getItem("tiletown.welcomed") === "2";
    } catch {
      /* facultatif */
    }
    if (seen) {
      welcomed = true;
      refresh();
      return;
    }
    pause(true);
    const overlay = el("div.welcome", {
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "welcome-title",
    });
    const modes = el("div.welcome-modes");
    let mode = "career";
    for (const [id, label] of [
      ["career", "Aventure"],
      ["sandbox", "Mode libre"],
    ])
      modes.append(
        el(
          "button",
          {
            type: "button",
            "aria-pressed": String(id === mode),
            onclick: (e) => {
              mode = id;
              for (const b of modes.children)
                b.setAttribute("aria-pressed", String(b === e.currentTarget));
            },
          },
          label,
        ),
      );
    const enter = () => {
      audio.unlock();
      audio.effect("reward");
      if (!restored) startGame(mode);
      else pause(false);
      overlay.remove();
      welcomed = true;
      try {
        localStorage.setItem("tiletown.welcomed", "2");
      } catch {
        /* facultatif */
      }
      refresh();
      onResize();
    };
    overlay.append(
      el(
        "div.welcome-card",
        el("span.eyebrow", "UN PETIT MONDE. DE GRANDES IDÉES."),
        el(
          "h1",
          { id: "welcome-title" },
          "Et si on faisait",
          el("br"),
          "pousser une ville ?",
        ),
        el(
          "p",
          "Quelques maisons, une rivière, des voisins heureux. Le reste de l’histoire vous appartient.",
        ),
        restored ? null : modes,
        el(
          "button.btn.welcome-play",
          { id: "welcome-play", type: "button", onclick: enter },
          restored ? "Retrouver ma vallée" : "Bienvenue chez vous",
          icon("arrow"),
        ),
        el(
          "span.welcome-note",
          "Jouez à votre rythme · sauvegarde automatique",
        ),
      ),
    );
    root.append(overlay);
    requestAnimationFrame(() => overlay.querySelector(".welcome-play").focus());
  }
  function result() {
    shownResult = true;
    const score = getGame().journey?.result || journeyScore(getGame());
    const body = el(
      "div.result-body",
      el(
        "div.result-stars",
        "★".repeat(score.stars) + "☆".repeat(3 - score.stars),
      ),
      el("h3", "Trois années, une belle histoire."),
      el(
        "p",
        "Votre ville et sa nature ont grandi ensemble. Voici le bilan de votre vallée.",
      ),
      el("div.result-score", `${score.score}`, el("small", " / 100")),
      el(
        "div.result-metrics",
        el("span", `Nature ${score.nature}`),
        el("span", `Prospérité ${score.prosperity}`),
      ),
      el(
        "button.btn",
        {
          type: "button",
          onclick: () => {
            applyGame(
              { ...getGame(), mode: "sandbox", speed: 1 },
              { kind: "continue" },
            );
            app.sheets.close();
          },
        },
        "Continuer ma vallée",
      ),
      el(
        "button.btn.btn--ghost",
        { type: "button", onclick: newValley },
        "Créer une autre vallée",
      ),
    );
    const firstAction = body.querySelector("button");
    if (score.goals)
      for (const g of score.goals)
        body.insertBefore(
          el(
            "div.metric-row",
            el("span", g.label),
            el("strong", g.done ? "Atteint" : `${g.value}/${g.target}`),
          ),
          firstAction,
        );
    if (score.details)
      for (const detail of score.details)
        body.insertBefore(
          el("p.sheet-hint", `${detail.done ? "★" : "☆"} ${detail.label}`),
          firstAction,
        );
    if (getGame().career)
      body.append(
        el(
          "button.btn",
          { type: "button", onclick: careerMap },
          score.stars > 0
            ? "Découvrir la vallée suivante"
            : "Rejouer cette vallée",
        ),
      );
    app.sheets.open({
      id: "result",
      title: "Votre vallée, trois ans plus tard",
      content: body,
    });
  }
  function refresh() {
    const game = getGame(),
      goal = currentGoal(game);
    const name = goal ? `${goal.id}:${goal.value}:${goal.ready}` : "done";
    if (name !== lastGoal) {
      lastGoal = name;
      setText(goalText, goal?.title || "Une vallée à votre image");
      setText(
        goalSub,
        goal
          ? goal.ready
            ? "OBJECTIF ACCOMPLI · RÉCUPÉREZ VOTRE PRIME"
            : `VOTRE PROCHAINE ÉTAPE · ${goal.value}/${goal.target}`
          : "TOUTES LES ÉTAPES ACCOMPLIES",
      );
      goalFill.style.width = `${goal ? (goal.value / goal.target) * 100 : 100}%`;
      mission.classList.toggle("is-ready", !!goal?.ready);
    }
    mission.hidden = game.mode === "sandbox";
    if (game.journey?.finished && !shownResult && welcomed) result();
    refreshSound();
  }
  refresh();
  return { refresh, welcome, openGoals, careerMap, settings, take };
}
