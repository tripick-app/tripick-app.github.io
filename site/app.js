const copy = {
  zh: {
    pageTitle: "Tripick — 让每段旅程，都留下几张想回看的照片。",
    description: "Tripick 在 iPhone 本地整理旅程照片。按拍摄时间与可用的地点信息归拢，再由你复核和确认。",
    heroImageAlt: "夕阳照亮海面、山坡与海岸村庄的旅行风景",
    appScreenAlt: "Tripick 新建精选时选择相册的应用界面",
    nextImageAlt: "薄雾中的山脉与森林，下一段旅程的示意风景",
    coastImageAlt: "海岸旅行风景示意图",
    mountainImageAlt: "山林旅行风景示意图",
    skip: "跳到正文",
    navLabel: "主要导航",
    footerNavLabel: "页脚导航",
    navHow: "整理过程",
    navPrivacy: "隐私",
    navHelp: "帮助",
    heroLineOne: "让每段旅程，",
    heroLineTwo: "都留下几张",
    heroLineThree: "想回看的照片。",
    heroLead: "Tripick 会根据照片的拍摄时间，并在有位置信息时，帮你在设备本地整理出值得回看的精选。",
    heroAction: "看看整理过程",
    heroAssurance: "照片留在你的 iPhone 上。整理结果由你复核。",
    captionTime: "按拍摄时间",
    captionLocation: "地点信息（如有）",
    nextTitle: "下一段旅程",
    nextSubtitle: "每段回忆，都有自己的位置",
    chapterTitle: "把旅程分成片段，回看时就更有脉络。",
    chapterBody: "Tripick 根据照片的拍摄时间整理旅程；当照片带有地点信息时，也会用它帮助归拢。无需先手动翻完整个相册。",
    momentOne: "旅程片段",
    momentTwo: "另一段片段",
    sampleNote: "示意画面",
    curationTitle: "留下哪些照片，最后由你确认。",
    curationBody: "Tripick 在 iPhone 本地参考画面质量、人物状态、连拍与相似度，帮你减少重复、挑出值得回看的候选。你可以检查和调整，再确认写入 Apple Photos。",
    curationNote: "Tripick 不删除或改动原始照片。",
    privacyTitle: "你的照片，只在你的设备上整理。",
    privacyBody: "照片、缩略图和分析结果都留在 iPhone 上，不会上传到 Tripick 服务器或第三方云端 AI。只有你复核并确认后，Tripick 才会在 Apple Photos 中创建或合并精选相簿、标记收藏。",
    privacyLink: "阅读隐私说明",
    privacyPointOne: "设备本地分析",
    privacyPointTwo: "你复核、你确认",
    privacyPointThree: "原始照片保持不变",
    closingLineOne: "让值得回看的照片，",
    closingLineTwo: "更容易被找回来。",
    closingAction: "了解 Tripick 如何整理",
    footerNote: "页面中的旅行照片为示意画面。",
    switchLabel: "EN",
    switchAria: "切换到 English",
  },
  en: {
    pageTitle: "Tripick — A few photos from every trip, worth revisiting.",
    description: "Tripick organizes trip photos on your iPhone by capture time and available location, then lets you review and confirm your picks.",
    heroImageAlt: "Coastal villages and hills beside the sea at sunset",
    appScreenAlt: "Tripick screen for choosing an album before creating a curated selection",
    nextImageAlt: "Misty mountains and forest, an illustrative view of the next chapter",
    coastImageAlt: "Illustrative coastal travel scene",
    mountainImageAlt: "Illustrative mountain and forest travel scene",
    skip: "Skip to content",
    navLabel: "Main navigation",
    footerNavLabel: "Footer navigation",
    navHow: "How it works",
    navPrivacy: "Privacy",
    navHelp: "Support",
    heroLineOne: "A few photos",
    heroLineTwo: "from every trip,",
    heroLineThree: "worth revisiting.",
    heroLead: "Tripick groups photos on your iPhone by capture time and, when available, location—then helps you find the moments worth revisiting.",
    heroAction: "See how it works",
    heroAssurance: "Your photos stay on your iPhone. You review every selection.",
    captionTime: "Grouped by capture time",
    captionLocation: "Location, when available",
    nextTitle: "The next chapter",
    nextSubtitle: "Every memory has its own place",
    chapterTitle: "Bring each trip into focus, one moment at a time.",
    chapterBody: "Tripick groups photos by capture time and uses location metadata when it is available to help bring distinct parts of a journey together—without asking you to search an entire library by hand.",
    momentOne: "One part of the journey",
    momentTwo: "A little later",
    sampleNote: "Illustrative scene",
    curationTitle: "You choose what stays.",
    curationBody: "On-device visual signals help bring forward clear photos, good expressions, burst representatives, and similar images. Review and adjust the suggestions, then confirm before Tripick makes changes in Apple Photos.",
    curationNote: "Tripick never deletes or alters your original photos.",
    privacyTitle: "Your photos stay on your iPhone.",
    privacyBody: "Photos, thumbnails, and analysis results stay on your device. Tripick does not upload them to its servers or to third-party cloud AI. Only after you review and confirm will Tripick create or merge a curated album and mark favorites in Apple Photos.",
    privacyLink: "Read the privacy notice",
    privacyPointOne: "Analysis happens on-device",
    privacyPointTwo: "You review and confirm",
    privacyPointThree: "Original photos stay unchanged",
    closingLineOne: "Find your favorite moments",
    closingLineTwo: "when you want to relive them.",
    closingAction: "See how Tripick organizes photos",
    footerNote: "Travel photos on this page are illustrative.",
    switchLabel: "中文",
    switchAria: "Switch to Chinese",
  },
};

const languageButton = document.querySelector("[data-language-switch]");
const languageLabel = document.querySelector("[data-language-label]");
const descriptionTag = document.querySelector('meta[name="description"]');
const openGraphTitle = document.querySelector('meta[property="og:title"]');
const openGraphDescription = document.querySelector('meta[property="og:description"]');

function setLanguage(language, persist = true) {
  const selected = language === "en" ? "en" : "zh";
  const strings = copy[selected];
  document.documentElement.lang = selected === "en" ? "en" : "zh-Hans";

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const value = strings[node.dataset.i18n];
    if (value !== undefined) node.textContent = value;
  });
  document.querySelectorAll("[data-i18n-alt]").forEach((node) => {
    const value = strings[node.dataset.i18nAlt];
    if (value !== undefined) node.setAttribute("alt", value);
  });

  document.querySelector(".main-nav")?.setAttribute("aria-label", strings.navLabel);
  document.querySelector(".site-footer nav")?.setAttribute("aria-label", strings.footerNavLabel);
  document.title = strings.pageTitle;
  descriptionTag?.setAttribute("content", strings.description);
  openGraphTitle?.setAttribute("content", strings.pageTitle);
  openGraphDescription?.setAttribute("content", strings.description);
  languageButton?.setAttribute("aria-label", strings.switchAria);
  languageButton?.setAttribute("aria-pressed", String(selected === "en"));
  if (languageLabel) languageLabel.textContent = strings.switchLabel;

  if (persist) {
    try { window.localStorage.setItem("tripick-language", selected); } catch { /* Private browsing can disable storage. */ }
  }
}

let initialLanguage = "zh";
try {
  const savedLanguage = window.localStorage.getItem("tripick-language");
  if (savedLanguage === "en") initialLanguage = "en";
} catch { /* Keep Chinese as the default when storage is unavailable. */ }
setLanguage(initialLanguage, false);

languageButton?.addEventListener("click", () => {
  const next = document.documentElement.lang === "en" ? "zh" : "en";
  setLanguage(next);
});

const year = document.querySelector("#current-year");
if (year) year.textContent = String(new Date().getFullYear());

const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const revealTargets = document.querySelectorAll("[data-reveal], [data-chapter-motion]");

if (!motionPreference.matches && "IntersectionObserver" in window && revealTargets.length) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -4% 0px" });

  revealTargets.forEach((target) => revealObserver.observe(target));
  document.documentElement.classList.add("motion-ready");
} else {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}
