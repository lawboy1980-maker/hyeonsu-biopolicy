 (() => {
  "use strict";

  const NEWS_JSON_PATH = "data/news.json";
  const MAX_ITEMS = 5;

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

  function addNewsStyles() {
    if (document.getElementById("hslab-news-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "hslab-news-styles";

    style.textContent = `
      .hslab-news-panel {
        overflow: hidden;
        background: #ffffff;
        border: 1px solid #e3e8ef;
        border-radius: 18px;
        box-sizing: border-box;
      }

      .hslab-news-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 52px;
        padding: 0 18px;
        background: #f4f6f8;
        border-bottom: 1px solid #e3e8ef;
        box-sizing: border-box;
      }

      .hslab-news-header-title {
        margin: 0;
        color: #182230;
        font-size: 16px;
        font-weight: 700;
        line-height: 1.4;
      }

      .hslab-news-count {
        color: #8793a3;
        font-size: 12px;
        font-weight: 500;
      }

      .hslab-news-list {
        padding: 2px 18px 10px;
      }

      .hslab-news-item {
        margin: 0;
        padding: 15px 0;
        border-bottom: 1px solid #edf0f4;
      }

      .hslab-news-item:last-child {
        border-bottom: 0;
      }

      .hslab-news-link,
      .hslab-news-link:link,
      .hslab-news-link:visited {
        display: block;
        color: #1d2939 !important;
        text-decoration: none !important;
      }

      .hslab-news-link:hover {
        color: #315b88 !important;
        text-decoration: none !important;
      }

      .hslab-news-title {
        margin: 0 0 9px;
        color: inherit;
        font-size: 15px;
        font-weight: 650;
        line-height: 1.52;
        word-break: keep-all;
        overflow-wrap: break-word;
      }

      .hslab-news-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        color: #8a96a6;
        font-size: 11px;
        line-height: 1.4;
      }

      .hslab-news-source {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .hslab-news-date {
        flex: 0 0 auto;
        white-space: nowrap;
      }

      .hslab-news-empty {
        margin: 0;
        padding: 28px 18px;
        color: #98a2b3;
        font-size: 13px;
        text-align: center;
      }

      @media (max-width: 900px) {
        .hslab-news-header {
          min-height: 48px;
          padding: 0 15px;
        }

        .hslab-news-list {
          padding-left: 15px;
          padding-right: 15px;
        }

        .hslab-news-title {
          font-size: 14px;
        }
      }
    `;

    document.head.appendChild(style);
  }

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
    return typeof value === "string" && value.trim()
      ? value.trim()
      : fallback;
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

  function sortItems(items) {
    return [...items].sort((a, b) => {
      const aTime = new Date(a?.date || 0).getTime();
      const bTime = new Date(b?.date || 0).getTime();

      return (Number.isNaN(bTime) ? 0 : bTime) -
             (Number.isNaN(aTime) ? 0 : aTime);
    });
  }

  function createHeader(title, count) {
    const header = document.createElement("div");
    header.className = "hslab-news-header";

    const heading = document.createElement("h3");
    heading.className = "hslab-news-header-title";
    heading.textContent = title;

    const countElement = document.createElement("span");
    countElement.className = "hslab-news-count";
    countElement.textContent = `${count}건`;

    header.appendChild(heading);
    header.appendChild(countElement);

    return header;
  }

  function createNewsItem(item) {
    const article = document.createElement("article");
    article.className = "hslab-news-item";

    const link = document.createElement("a");
    link.className = "hslab-news-link";
    link.href = normalizeUrl(item?.url);
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    const title = document.createElement("h4");
    title.className = "hslab-news-title";
    title.textContent = normalizeText(
      item?.title,
      "제목이 없는 자료"
    );

    const meta = document.createElement("div");
    meta.className = "hslab-news-meta";

    const source = document.createElement("span");
    source.className = "hslab-news-source";
    source.textContent = normalizeText(
      item?.source,
      "출처 미상"
    );

    const date = document.createElement("span");
    date.className = "hslab-news-date";
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
        `[news-feed] ${config.title} 영역을 찾지 못했습니다.`
      );
      return;
    }

    const allItems = Array.isArray(items)
  ? sortItems(items)
  : [];

const safeItems = allItems.slice(0, MAX_ITEMS);

    container.classList.add("hslab-news-panel");
    container.replaceChildren();

    container.appendChild(
      createHeader(config.title, safeItems.length)
    );

    if (safeItems.length === 0) {
      const empty = document.createElement("p");
      empty.className = "hslab-news-empty";
      empty.textContent = "수집된 자료가 없습니다.";
      container.appendChild(empty);
      return;
    }

    const list = document.createElement("div");
    list.className = "hslab-news-list";

    safeItems.forEach((item) => {
      list.appendChild(createNewsItem(item));
    });

    container.appendChild(list);
   if (allItems.length > MAX_ITEMS) {

  const btn = document.createElement("button");

  btn.className = "news-more-btn";

  btn.textContent = "더보기 ▼";

  let expanded = false;

  btn.onclick = () => {

    expanded = !expanded;

    list.innerHTML = "";

    const displayItems = expanded
      ? allItems
      : allItems.slice(0, MAX_ITEMS);

    displayItems.forEach(item=>{
      list.appendChild(createNewsItem(item));
    });

    btn.textContent =
      expanded ? "접기 ▲" : "더보기 ▼";
  };

  container.appendChild(btn);
}
  }

  function renderUpdatedTime(updatedAt) {
    const value = normalizeText(updatedAt);

    if (!value) {
      return;
    }

    const element =
      document.querySelector("#news-updated-at") ||
      document.querySelector("#newsUpdatedAt") ||
      document.querySelector("[data-news-updated-at]");

    if (element) {
      element.textContent = `업데이트: ${value}`;
    }
  }

  async function loadNews() {
    addNewsStyles();

    const jsonUrl = new URL(
      NEWS_JSON_PATH,
      document.baseURI
    );

    jsonUrl.searchParams.set("v", Date.now().toString());

    try {
      const response = await fetch(jsonUrl.href, {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      renderSection("domestic", data?.domestic);
      renderSection("government", data?.government);
      renderSection("overseas", data?.overseas);
      renderSection("nature", data?.nature);

      renderUpdatedTime(data?.updated_at);
    } catch (error) {
      console.error(
        "[news-feed] 뉴스 데이터를 불러오지 못했습니다.",
        error
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
