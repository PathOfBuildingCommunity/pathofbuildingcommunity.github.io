(function () {
  const repos = {
    poe1: {
      latestApi: "https://api.github.com/repos/PathOfBuildingCommunity/PathOfBuilding/releases/latest",
      releases: "https://github.com/PathOfBuildingCommunity/PathOfBuilding/releases",
      latest: "https://github.com/PathOfBuildingCommunity/PathOfBuilding/releases/latest",
      setupName: /setup\.exe$/i,
      portableName: /portable\.zip$/i
    },
    poe2: {
      latestApi: "https://api.github.com/repos/PathOfBuildingCommunity/PathOfBuilding-PoE2/releases/latest",
      releases: "https://github.com/PathOfBuildingCommunity/PathOfBuilding-PoE2/releases",
      latest: "https://github.com/PathOfBuildingCommunity/PathOfBuilding-PoE2/releases/latest",
      setupName: /setup\.exe$/i,
      portableName: /portable\.zip$/i
    }
  };

  const dateFormat = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const cacheKey = "pob-release-data-v3";
  const cacheTtl = 5 * 60 * 1000;

  const cleanVersion = (tag) => String(tag || "").replace(/^v/i, "");

  const unavailableText = {
    "poe1-version": "Unavailable",
    "poe2-version": "Unavailable",
    "poe1-release-label": "Release unavailable",
    "poe2-release-label": "Release unavailable",
    "poe1-published": "Unavailable",
    "poe2-published": "Unavailable"
  };

  const formatDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.valueOf()) ? "Unavailable" : dateFormat.format(date);
  };

  const assetUrl = (release, pattern) => {
    const asset = release?.assets?.find((item) => pattern.test(item.name));
    return asset?.browser_download_url || release?.html_url;
  };

  const fetchJson = async (url) => {
    const response = await fetch(url, {
      headers: { Accept: "application/vnd.github+json" }
    });
    if (!response.ok) throw new Error(`GitHub request failed: ${response.status}`);
    return response.json();
  };

  const loadBranch = async (branch) => {
    const config = repos[branch];
    const release = await fetchJson(config.latestApi);

    return {
      release,
      version: cleanVersion(release.tag_name),
      published: formatDate(release.published_at),
      setupUrl: assetUrl(release, config.setupName),
      portableUrl: assetUrl(release, config.portableName),
      releaseUrl: release.html_url || config.latest,
      releasesUrl: config.releases
    };
  };

  const readCache = () => {
    try {
      const cached = JSON.parse(sessionStorage.getItem(cacheKey) || "null");
      if (!cached || Date.now() - cached.savedAt > cacheTtl) return null;
      return cached.data;
    } catch (error) {
      return null;
    }
  };

  const writeCache = (data) => {
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), data }));
    } catch (error) {
      /* Ignore storage failures; live data still rendered for this page. */
    }
  };

  const setText = (key, value) => {
    document.querySelectorAll(`[data-live="${key}"]`).forEach((node) => {
      node.textContent = value;
    });
  };

  const setInput = (key, value) => {
    document.querySelectorAll(`[data-live-value="${key}"]`).forEach((node) => {
      node.value = value;
    });
  };

  const setHref = (key, value) => {
    document.querySelectorAll(`[data-download="${key}"]`).forEach((node) => {
      if (value) node.href = value;
    });
  };

  const markUnavailable = () => {
    Object.entries(unavailableText).forEach(([key, value]) => setText(key, value));
    setInput("poe1-release-url", repos.poe1.latest);
    setInput("poe2-release-url", repos.poe2.latest);
    setHref("poe1-setup", repos.poe1.latest);
    setHref("poe1-portable", repos.poe1.latest);
    setHref("poe1-latest", repos.poe1.latest);
    setHref("poe1-releases", repos.poe1.releases);
    setHref("poe2-setup", repos.poe2.latest);
    setHref("poe2-portable", repos.poe2.latest);
    setHref("poe2-latest", repos.poe2.latest);
    setHref("poe2-releases", repos.poe2.releases);
  };

  const applyData = ({ poe1, poe2 }) => {
    setText("poe1-version", `v${poe1.version}`);
    setText("poe2-version", `v${poe2.version}`);
    setText("poe1-release-label", `Release v${poe1.version}`);
    setText("poe2-release-label", `Release v${poe2.version}`);
    setText("poe1-published", poe1.published);
    setText("poe2-published", poe2.published);

    setHref("poe1-setup", poe1.setupUrl);
    setHref("poe1-portable", poe1.portableUrl);
    setHref("poe1-latest", poe1.releaseUrl);
    setHref("poe1-releases", poe1.releasesUrl);
    setHref("poe2-setup", poe2.setupUrl);
    setHref("poe2-portable", poe2.portableUrl);
    setHref("poe2-latest", poe2.releaseUrl);
    setHref("poe2-releases", poe2.releasesUrl);

    setInput("poe1-release-url", poe1.releaseUrl);
    setInput("poe2-release-url", poe2.releaseUrl);
    document.documentElement.dataset.liveData = "ready";
  };

  const hydrate = async () => {
    try {
      const cached = readCache();
      if (cached) {
        applyData(cached);
        return;
      }

      const [poe1, poe2] = await Promise.all([loadBranch("poe1"), loadBranch("poe2")]);
      const data = { poe1, poe2 };
      writeCache(data);
      applyData(data);
    } catch (error) {
      markUnavailable();
      document.documentElement.dataset.liveData = "unavailable";
      console.warn("Path of Building live release data unavailable.", error);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hydrate);
  } else {
    hydrate();
  }
})();
