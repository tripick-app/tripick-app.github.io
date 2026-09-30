import { useEffect, useRef, useState } from "react";
import * as m from "motion/react-m";

const copy = {
  zh: {
    pageTitle: "Tripick — 让每段旅程，都留下几张想回看的照片。",
    description: "Tripick 在 iPhone 本地整理旅程照片。按拍摄时间与可用的地点信息归拢，再由你复核和确认。",
    heroImageAlt: "夕阳照亮海面、山坡与海岸村庄的旅行风景",
    appScreenAlt: "Tripick 新建精选时选择相册的应用界面",
    coastImageAlt: "夕阳下的海岸旅程示意画面",
    mountainImageAlt: "雾中的山脉与森林，另一段旅程示意画面",
    skip: "跳到正文",
    navLabel: "主要导航",
    footerNavLabel: "页脚导航",
    navHow: "整理过程",
    navPrivacy: "隐私",
    navHelp: "帮助",
    headerMotto: "让回忆更有位置",
    switchLabel: "EN",
    switchAria: "切换到 English",
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
    reviewStageOne: "本地整理",
    reviewStageTwo: "检查与调整",
    reviewStageThree: "确认写入",
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
  },
  en: {
    pageTitle: "Tripick — A few photos from every trip, worth revisiting.",
    description: "Tripick organizes trip photos on your iPhone by capture time and available location, then lets you review and confirm your picks.",
    heroImageAlt: "Coastal villages and hills beside the sea at sunset",
    appScreenAlt: "Tripick screen for choosing an album before creating a curated selection",
    coastImageAlt: "An illustrative coastal scene at sunset",
    mountainImageAlt: "Misty mountains and forest, an illustrative scene from another part of the trip",
    skip: "Skip to content",
    navLabel: "Main navigation",
    footerNavLabel: "Footer navigation",
    navHow: "How it works",
    navPrivacy: "Privacy",
    navHelp: "Support",
    headerMotto: "Give memories a place.",
    switchLabel: "中文",
    switchAria: "Switch to Chinese",
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
    reviewStageOne: "Organized on-device",
    reviewStageTwo: "Review and adjust",
    reviewStageThree: "Confirm in Photos",
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
  },
};

const imageAssets = {
  coast: {
    src: "/assets/plates/hero-panorama.png",
    srcSet: "/assets/images/webp/hero-480.webp 480w, /assets/images/webp/hero-768.webp 768w, /assets/images/webp/hero-1024.webp 1024w, /assets/images/webp/hero-1280.webp 1280w, /assets/images/webp/hero-1586.webp 1586w",
    placeholder: "/assets/images/webp/coast-blur.webp",
    width: 1586,
    height: 992,
  },
  mountain: {
    src: "/assets/plates/next-chapter-photo.png",
    srcSet: "/assets/images/webp/mountain-640.webp 640w, /assets/images/webp/mountain-960.webp 960w, /assets/images/webp/mountain-1280.webp 1280w, /assets/images/webp/mountain-1600.webp 1600w, /assets/images/webp/mountain-2172.webp 2172w",
    placeholder: "/assets/images/webp/mountain-blur.webp",
    width: 2172,
    height: 724,
  },
  app: {
    src: "/assets/plates/phone-app-screen.png",
    srcSet: "/assets/images/webp/screen-640.webp 640w, /assets/images/webp/screen-960.webp 960w, /assets/images/webp/screen-1320.webp 1320w",
    placeholder: "/assets/images/webp/screen-blur.webp",
    width: 1320,
    height: 2868,
  },
  frame: {
    src: "/assets/plates/phone-frame.png",
    srcSet: "/assets/images/webp/frame-400.webp 400w, /assets/images/webp/frame-640.webp 640w, /assets/images/webp/frame-916.webp 916w",
    placeholder: null,
    width: 916,
    height: 1717,
  },
};

function getInitialLanguage() {
  try {
    return window.localStorage.getItem("tripick-language") === "en" ? "en" : "zh";
  } catch {
    return "zh";
  }
}

function ResponsivePhoto({ name, alt, className = "", sizes, loading = "lazy", priority = false, decorative = false }) {
  const image = imageAssets[name];
  const imageRef = useRef(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const element = imageRef.current;
    if (element?.complete) setStatus(element.naturalWidth > 0 ? "loaded" : "error");
  }, []);

  return (
    <picture
      className={`photo-media ${className} is-${status}`}
      style={{ "--photo-placeholder": image.placeholder ? `url("${image.placeholder}")` : "none" }}
      aria-hidden={decorative || undefined}
    >
      <source type="image/webp" srcSet={image.srcSet} sizes={sizes} />
      <img
        ref={imageRef}
        src={image.src}
        alt={decorative ? "" : alt}
        aria-hidden={decorative || undefined}
        loading={loading}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        width={image.width}
        height={image.height}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
      />
    </picture>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M3 10h13M10 4l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function App() {
  const [language, setLanguage] = useState(getInitialLanguage);
  const strings = copy[language];

  useEffect(() => {
    document.documentElement.lang = language === "en" ? "en" : "zh-Hans";
    document.title = strings.pageTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", strings.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", strings.pageTitle);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", strings.description);
    try {
      window.localStorage.setItem("tripick-language", language);
    } catch {
      // Keep the selected language for this page when storage is unavailable.
    }
  }, [language, strings]);

  const toggleLanguage = () => setLanguage((current) => current === "en" ? "zh" : "en");

  return (
    <>
      <a className="skip-link" href="#main">{strings.skip}</a>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Tripick">
          <img src="/assets/plates/brand-icon.png" width="50" height="48" alt="" />
          <span>Tripick</span>
        </a>
        <nav className="main-nav" aria-label={strings.navLabel}>
          <span className="nav-motto">{strings.headerMotto}</span>
          <a href="#how-it-works">{strings.navHow}</a>
          <a href="#privacy">{strings.navPrivacy}</a>
          <a href="https://s-1307850796.cos.ap-beijing.myqcloud.com/tripick-support/latest/index.html" target="_blank" rel="noreferrer">{strings.navHelp}</a>
        </nav>
        <button className="language-switch" type="button" onClick={toggleLanguage} aria-label={strings.switchAria} aria-pressed={language === "en"}>
          <span>{strings.switchLabel}</span>
        </button>
      </header>

      <main id="main">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <m.div
            className="hero-copy"
            initial={{ opacity: 1, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.68, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 id="hero-title" className={language === "en" ? "is-english" : "is-chinese"}>
              <span>{strings.heroLineOne}</span>
              <span>{strings.heroLineTwo}</span>
              <span className="hero-accent">{strings.heroLineThree}</span>
            </h1>
            <p className="hero-lead">{strings.heroLead}</p>
            <a className="primary-link" href="#how-it-works">
              <span>{strings.heroAction}</span>
              <ArrowIcon />
            </a>
            <p className="hero-assurance">{strings.heroAssurance}</p>
          </m.div>

          <div className="hero-visual">
            <ResponsivePhoto
              name="coast"
              className="hero-photo"
              alt={strings.heroImageAlt}
              sizes="(max-width: 800px) 100vw, (max-width: 1120px) 64vw, (max-width: 1600px) 70vw, 1056px"
              loading="eager"
              priority
            />
            <div className="photo-caption">
              <span className="caption-rule" aria-hidden="true" />
              <div>
                <p>{strings.captionTime}</p>
                <span>{strings.captionLocation}</span>
              </div>
            </div>
            <m.div
              className="phone-showcase"
              initial={{ opacity: 1, y: 18, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.82, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="phone-screen">
                <ResponsivePhoto
                  name="app"
                  className="phone-screen-image"
                  alt={strings.appScreenAlt}
                  sizes="(max-width: 800px) 40vw, (max-width: 1120px) 30vw, 28vw"
                  loading="eager"
                />
              </div>
              <ResponsivePhoto
                name="frame"
                className="phone-frame"
                alt=""
                sizes="(max-width: 800px) 52vw, (max-width: 1120px) 41vw, 38vw"
                loading="eager"
                decorative
              />
            </m.div>
          </div>
        </section>

        <div className="chapter-transition" aria-label={`${strings.nextTitle}: ${strings.nextSubtitle}`}>
          <ResponsivePhoto
            name="mountain"
            className="chapter-preview"
            alt=""
            sizes="(max-width: 800px) 100vw, 81vw"
            decorative
          />
          <div className="chapter-transition-label">
            <p>{strings.nextTitle}</p>
            <span>{strings.nextSubtitle}</span>
          </div>
        </div>

        <section className="chapter-section" id="how-it-works" aria-labelledby="chapter-title">
          <div className="section-copy">
            <h2 id="chapter-title">{strings.chapterTitle}</h2>
            <p>{strings.chapterBody}</p>
          </div>
          <m.div className="chapter-art" initial="rest" whileInView="settled" viewport={{ once: true, amount: 0.22 }}>
            <m.span
              className="chapter-track"
              aria-hidden="true"
              variants={{ rest: { scale: 0.16 }, settled: { scale: 1 } }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
            <m.figure
              className="moment moment-first"
              variants={{ rest: { x: -14 }, settled: { x: 0 } }}
              transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
            >
              <ResponsivePhoto
                name="coast"
                className="moment-image coast-crop"
                alt={strings.coastImageAlt}
                sizes="(max-width: 800px) 100vw, (max-width: 1120px) 60vw, 48vw"
              />
              <figcaption><span>{strings.momentOne}</span><span className="caption-separator" aria-hidden="true">·</span><span>{strings.sampleNote}</span></figcaption>
            </m.figure>
            <m.figure
              className="moment moment-second"
              variants={{ rest: { x: 14 }, settled: { x: 0 } }}
              transition={{ duration: 0.76, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <ResponsivePhoto
                name="mountain"
                className="moment-image mountain-crop"
                alt={strings.mountainImageAlt}
                sizes="(max-width: 800px) 100vw, (max-width: 1120px) 60vw, 48vw"
              />
              <figcaption><span>{strings.momentTwo}</span><span className="caption-separator" aria-hidden="true">·</span><span>{strings.sampleNote}</span></figcaption>
            </m.figure>
          </m.div>
        </section>

        <section className="curation-section" aria-labelledby="curation-title">
          <div className="section-copy">
            <h2 id="curation-title">{strings.curationTitle}</h2>
            <p>{strings.curationBody}</p>
            <p className="small-note">{strings.curationNote}</p>
          </div>
          <ol className="review-flow" aria-label={strings.curationTitle}>
            <li><span>01</span><strong>{strings.reviewStageOne}</strong></li>
            <li><span>02</span><strong>{strings.reviewStageTwo}</strong></li>
            <li><span>03</span><strong>{strings.reviewStageThree}</strong></li>
          </ol>
        </section>

        <section className="privacy-section" id="privacy" aria-labelledby="privacy-title">
          <div className="privacy-copy">
            <span className="privacy-icon" aria-hidden="true">
              <svg viewBox="0 0 32 32"><rect x="6.5" y="13" width="19" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="1.7" /><path d="M10 13V9.5a6 6 0 0 1 12 0V13M16 18v4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
            </span>
            <h2 id="privacy-title">{strings.privacyTitle}</h2>
            <p>{strings.privacyBody}</p>
            <a className="text-link" href="https://s-1307850796.cos.ap-beijing.myqcloud.com/tripick-privacy/latest/index.html" target="_blank" rel="noreferrer">
              <span>{strings.privacyLink}</span>
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 15 15 5M6 5h9v9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
          </div>
          <ul className="privacy-aside">
            <li>{strings.privacyPointOne}</li>
            <li>{strings.privacyPointTwo}</li>
            <li>{strings.privacyPointThree}</li>
          </ul>
        </section>

        <section className="closing-section" aria-labelledby="closing-title">
          <div>
            <h2 id="closing-title"><span>{strings.closingLineOne}</span><br /><span>{strings.closingLineTwo}</span></h2>
            <a className="primary-link" href="#how-it-works">
              <span>{strings.closingAction}</span>
              <ArrowIcon />
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="footer-brand" href="#top">Tripick</a>
        <p>{strings.footerNote}</p>
        <nav aria-label={strings.footerNavLabel}>
          <a href="https://s-1307850796.cos.ap-beijing.myqcloud.com/tripick-privacy/latest/index.html" target="_blank" rel="noreferrer">{strings.navPrivacy}</a>
          <a href="https://s-1307850796.cos.ap-beijing.myqcloud.com/tripick-support/latest/index.html" target="_blank" rel="noreferrer">{strings.navHelp}</a>
        </nav>
        <span className="copyright">© <span>{new Date().getFullYear()}</span> Tripick</span>
      </footer>
    </>
  );
}

export default App;
