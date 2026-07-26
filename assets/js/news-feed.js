 (() => {
  "use strict";

  const NEWS_JSON_PATH = "data/news.json";
  const MAX_ITEMS = 12;

  /*
   * 기존 HTML 구조가 조금 달라도 작동하도록
   * 여러 가지 ID와 선택자를 순서대로 확인합니다.
   */
  const SECTION_CONFIG = {
    domestic: {
      title: "국내 뉴스",
      selectors: [
        "#domestic-news",
        "#domesticNews",
        "#news-domestic",
        "[data-news-section='domestic']"
      ]
    },

    government: {
      title: "부처 보도자료",
      selectors: [
        "#government-news",
        "#governmentNews",
        "#news-government",
        "[data-news-section='government']"
      ]
    },

    overseas: {
      title: "해외 뉴스",
      selectors: [
        "#overseas-news",
        "#overseasNews",
        "#news-overseas",
        "[data-news-section='overseas']"
      ]
    },

    nature: {
      title: "Nature News",
      selectors: [
        "#nature-news",
        "#natureNews",
        "#news-nature",
        "[data-news-section='nature']"
      ]
    }
  };

  function findContainer(selectors) {
    for (const selector of selectors) {
      const element = document.querySelector(selector);

      if (element) {
        return element;
      }
    }

    return null;
  }

  function normalizeText(value, fallback = "") {
    if (typeof value !== "string") {
      return fallback;
    }

    return value.trim();
  }

  function normalizeUrl(value) {
    const url = normalizeText(value);

    if (!url) {
      return "#";
    }

    try {
      const parsed = new URL(url, window.location.href);

      if (
        parsed.protocol !== "http:" &&
        parsed.protocol !== "https:"
      ) {
        return "#";
      }

      return parsed.href;
    } catch (error) {
      return "#";
    }
  }

  function formatDate(value) {
    const dateText = normalizeText(value);

    if (!dateText) {
      return "";
    }

    const parsed = new Date(dateText);

    if (Number.isNaN(parsed.getTime())) {
      return dateText;
    }

    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(parsed);
  }

  function sortByDateDescending(items) {
    return [...items].sort((a, b) => {
      const aDate = new Date(a?.date || 0).getTime();
      const bDate = new Date(b?.date || 0).getTime();

      const safeA = Number.isNaN(aDate) ? 0 : aDate;
      const safeB = Number.isNaN(bDate) ? 0 : bDate;

      return safeB - safeA;
    });
  }

  function createEmptyMessage(message) {
    const empty = document.createElement("p");
    empty.className = "news-empty";
    empty.textContent = message;

    return empty;
  }

  function createNewsItem(item) {
    const article = document.createElement("article");
    article.className = "news-item";

    const link = document.createElement("a");
    link.className = "news-link";
    link.href = normalizeUrl(item?.url);
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    const title = document.createElement("h4");
    title.className = "news-title";
    title.textContent =
      normalizeText(item?.title, "제목이 없는 자료");

    const meta = document.createElement("div");
    meta.className = "news-meta";

    const source = document.createElement("span");
    source.className = "news-source";
    source.textContent =
      normalizeText(item?.source, "출처 미상");

    const date = document.createElement("span");
    date.className = "news-date";
    date.textContent = formatDate(item?.date);

    meta.appendChild(source);

    if (date.textContent) {
      meta.appendChild(date);
    }

    link.appendChild(title);
    link.appendChild(meta);
    article.appendChild(link);

    return article;
  }

  function renderSection(sectionKey, items) {
    const config = SECTION_CONFIG[sectionKey];

    if (!config) {
      return;
    }

    const container = findContainer(config.selectors);

    if (!container) {
      console.warn(
        `[news-feed] ${config.title} 영역을 찾지 못했습니다.`,
        config.selectors
      );

      return;
    }

    container.replaceChildren();

    if (!Array.isArray(items) || items.length === 0) {
      container.appendChild(
        createEmptyMessage("수집된 자료가 없습니다.")
      );

      return;
    }

    const list = document.createElement("div");
    list.className = "news-list";

    const sortedItems = sortByDateDescending(items)
      .slice(0, MAX_ITEMS);

    sortedItems.forEach((item) => {
      list.appendChild(createNewsItem(item));
    });

    container.appendChild(list);
  }

  function renderUpdatedTime(updatedAt) {
    const value = normalizeText(updatedAt);

    if (!value) {
      return;
    }

    const selectors = [
      "#news-updated-at",
      "#newsUpdatedAt",
      "[data-news-updated-at]"
    ];

    const element = findContainer(selectors);

    if (element) {
      element.textContent = `업데이트: ${value}`;
    }
  }

  function renderAllSections(data) {
    renderSection("domestic", data?.domestic);
    renderSection("government", data?.government);
    renderSection("overseas", data?.overseas);
    renderSection("nature", data?.nature);
    renderUpdatedTime(data?.updated_at);
  }

  function renderGlobalError(message) {
    Object.entries(SECTION_CONFIG).forEach(
      ([sectionKey, config]) => {
        const container = findContainer(config.selectors);

        if (!container) {
          return;
        }

        container.replaceChildren();
        container.appendChild(
          createEmptyMessage(message)
        );

        console.warn(
          `[news-feed] ${sectionKey}: ${message}`
        );
      }
    );
  }

  async function loadNews() {
    const cacheBuster = Date.now();

    /*
     * GitHub Pages가 하위 경로에서 운영되는 경우를 고려해
     * 현재 페이지 위치를 기준으로 JSON 주소를 만듭니다.
     */
    const jsonUrl = new URL(
      NEWS_JSON_PATH,
      document.baseURI
    );

    jsonUrl.searchParams.set("v", String(cacheBuster));

    try {
      const response = await fetch(jsonUrl.href, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(
          `news.json 요청 실패: HTTP ${response.status}`
        );
      }

      const data = await response.json();

      if (!data || typeof data !== "object") {
        throw new Error(
          "news.json의 형식이 올바르지 않습니다."
        );
      }

      renderAllSections(data);

      if (
        Array.isArray(data.errors) &&
        data.errors.length > 0
      ) {
        console.warn(
          "[news-feed] 뉴스 수집 과정에서 일부 오류가 있었습니다.",
          data.errors
        );
      }
    } catch (error) {
      console.error(
        "[news-feed] 뉴스를 불러오지 못했습니다.",
        error
      );

      renderGlobalError(
        "뉴스 데이터를 불러오지 못했습니다."
      );
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      loadNews,
      { once: true }
    );
  } else {
    loadNews();
  }
})();
