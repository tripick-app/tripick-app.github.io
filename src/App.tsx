import { useEffect, useRef, useState, type CSSProperties, type ImgHTMLAttributes } from "react";
import type { Variants } from "motion/react";
import * as m from "motion/react-m";

type Language = "zh" | "en";

const zhCopy = {
    pageTitle: "Tripick — 让每段旅程，都留下几张想回看的照片。",
    description: "Tripick 在 iPhone 本地整理旅程照片。按拍摄时间与可用的地点信息归拢，再由你复核和确认。",
    heroImageAlt: "夕阳照亮海面、山坡与海岸村庄的旅行风景",
    appScreenAlt: "Tripick 精选预览界面，展示六张候选旅行照片、分析信息和确认操作",
    coastImageAlt: "日落时分的海岸村庄与山坡",
    mountainImageAlt: "雾中的山脉与森林",
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
    heroLead: "Tripick 会按拍摄时间整理旅程；照片带有地点时，也会参考位置线索，帮你找出值得回看的照片。",
    heroAction: "看看整理过程",
    heroAssurance: "照片留在你的 iPhone 上。整理结果由你复核。",
    captionTime: "按拍摄时间",
    captionLocation: "照片有地点，整理更有脉络",
    nextTitle: "下一段旅程",
    nextSubtitle: "每段回忆，都有自己的位置",
    chapterTitle: "把旅程分成片段，回看时就更有脉络。",
    chapterBody: "Tripick 会按拍摄时间串起旅程；照片带有地点时，也会参考位置线索，帮你看清旅程中的不同片段。不必从头到尾手动翻完整本相册。",
    momentOne: "海岸暮色",
    momentTwo: "雾起山间",
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
    footerNote: "页面中的风景照片均为生成示例，不来自真实用户相册。",
};
type SiteCopy = { [Key in keyof typeof zhCopy]: string };

const copy = {
  zh: zhCopy,
  en: {
    pageTitle: "Tripick — A few photos from every trip, worth revisiting.",
    description: "Tripick organizes trip photos on your iPhone by capture time and available location, then lets you review and confirm your picks.",
    heroImageAlt: "Coastal villages and hills beside the sea at sunset",
    appScreenAlt: "Tripick curation preview showing six candidate travel photos, analysis details, and the confirmation action",
    coastImageAlt: "A coastal village and hillside at sunset",
    mountainImageAlt: "Misty mountains and forest",
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
    heroLead: "Tripick groups your photos by capture time and uses location when a photo includes it, helping you find moments worth revisiting.",
    heroAction: "See how it works",
    heroAssurance: "Your photos stay on your iPhone. You review every selection.",
    captionTime: "Grouped by capture time",
    captionLocation: "Location adds context",
    nextTitle: "The next chapter",
    nextSubtitle: "Every memory has its own place",
    chapterTitle: "Bring each trip into focus, one moment at a time.",
    chapterBody: "Tripick groups a journey by capture time and uses location when a photo includes it. That helps bring distinct parts of a trip together, without searching your whole library by hand.",
    momentOne: "Coast at dusk",
    momentTwo: "Mist over the mountains",
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
    footerNote: "Travel photos on this page are generated examples, not images from real users.",
  },
} satisfies Record<Language, SiteCopy>;

type ImageAsset = { src: string; srcSet: string; placeholder: string | null; width: number; height: number };

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
  appZh: {
    src: "/assets/plates/phone-review-zh.png",
    srcSet: "/assets/images/webp/review-zh-640.webp 640w, /assets/images/webp/review-zh-960.webp 960w, /assets/images/webp/review-zh-1320.webp 1320w",
    placeholder: "/assets/images/webp/review-zh-blur.webp",
    width: 1320,
    height: 2868,
  },
  appEn: {
    src: "/assets/plates/phone-review-en.png",
    srcSet: "/assets/images/webp/review-en-640.webp 640w, /assets/images/webp/review-en-960.webp 960w, /assets/images/webp/review-en-1320.webp 1320w",
    placeholder: "/assets/images/webp/review-en-blur.webp",
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
} satisfies Record<string, ImageAsset>;

const heroRiseVariants: Variants = {
  hidden: { opacity: 1, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.76, ease: [0.16, 1, 0.3, 1] },
  },
};
const heroStaggerVariants: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.12, staggerChildren: 0.18 } },
};
const heroLineStaggerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11 } },
};

function getInitialLanguage(): Language {
  try {
    return window.localStorage.getItem("tripick-language") === "en" ? "en" : "zh";
  } catch {
    return "zh";
  }
}

type ResponsivePhotoProps = {
  name: keyof typeof imageAssets;
  alt: string;
  className?: string;
  sizes?: string;
  loading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
  priority?: boolean;
  decorative?: boolean;
};

type PhotoStyle = CSSProperties & { "--photo-placeholder": string };

type PhotoStatus = "loading" | "loaded" | "error";

function ResponsivePhoto({ name, alt, className = "", sizes, loading = "lazy", priority = false, decorative = false }: ResponsivePhotoProps) {
  const image = imageAssets[name];
  const imageRef = useRef<HTMLImageElement>(null);
  const pictureStyle: PhotoStyle = {
    "--photo-placeholder": image.placeholder ? `url("${image.placeholder}")` : "none",
  };
  const [status, setStatus] = useState<PhotoStatus>("loading");

  useEffect(() => {
    const element = imageRef.current;
    if (element?.complete) setStatus(element.naturalWidth > 0 ? "loaded" : "error");
  }, []);

  return (
    <picture
      className={`photo-media ${className} is-${status}`}
      style={pictureStyle}
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
          <m.div className="hero-copy" initial="hidden" animate="visible" variants={heroStaggerVariants}>
            <m.h1 id="hero-title" className={language === "en" ? "is-english" : "is-chinese"} variants={heroLineStaggerVariants}>
              <m.span variants={heroRiseVariants}>{strings.heroLineOne}</m.span>
              <m.span variants={heroRiseVariants}>{strings.heroLineTwo}</m.span>
              <m.span className="hero-accent" variants={heroRiseVariants}>{strings.heroLineThree}</m.span>
            </m.h1>
            <m.p className="hero-lead" variants={heroRiseVariants}>{strings.heroLead}</m.p>
            <m.a className="primary-link" href="#how-it-works" variants={heroRiseVariants}>
              <span>{strings.heroAction}</span>
              <ArrowIcon />
            </m.a>
            <m.p className="hero-assurance" variants={heroRiseVariants}>{strings.heroAssurance}</m.p>
          </m.div>

          <div className="hero-visual">
            <div className="hero-photo-viewport">
              <m.div
                className="hero-photo-reveal"
                initial={{ opacity: 0.48, scale: 1.035 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.35, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
              >
                <ResponsivePhoto
                  name="coast"
                  className="hero-photo"
                  alt={strings.heroImageAlt}
                  sizes="(max-width: 800px) 100vw, (max-width: 1120px) 64vw, (max-width: 1600px) 70vw, 1056px"
                  loading="eager"
                  priority
                />
              </m.div>
            </div>
            <div className="photo-caption">
              <span className="caption-rule" aria-hidden="true" />
              <div>
                <p>{strings.captionTime}</p>
                <span>{strings.captionLocation}</span>
              </div>
            </div>
            <div className="phone-showcase">
              <m.div
                className="phone-motion"
                initial={{ opacity: 0.82, y: 56, rotateY: -16, rotateZ: -4, scale: 0.91 }}
                animate={{ opacity: 1, y: 0, rotateY: 0, rotateZ: 0, scale: 1 }}
                transition={{
                  opacity: { duration: 0.68, delay: 0.12 },
                  y: { duration: 1.28, delay: 0.12, ease: [0.16, 1, 0.3, 1] },
                  rotateY: { duration: 1.28, delay: 0.12, ease: [0.16, 1, 0.3, 1] },
                  rotateZ: { duration: 1.28, delay: 0.12, ease: [0.16, 1, 0.3, 1] },
                  scale: { duration: 1.28, delay: 0.12, ease: [0.16, 1, 0.3, 1] },
                }}
              >
                <m.div
                  className="phone-float"
                  animate={{ y: [0, -7, 0], rotateZ: [0, 0.28, 0] }}
                  transition={{ duration: 7.2, delay: 1.55, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="phone-screen">
                    <ResponsivePhoto
                      key={language}
                      name={language === "en" ? "appEn" : "appZh"}
                      className="phone-screen-image"
                      alt={strings.appScreenAlt}
                      sizes="(max-width: 800px) 40vw, (max-width: 1120px) 26vw, 20vw"
                      loading="eager"
                    />
                    <m.span
                      className="phone-glint"
                      aria-hidden="true"
                      initial={{ opacity: 0, x: "-24%" }}
                      animate={{ opacity: [0, 0.3, 0], x: ["-24%", "252%"] }}
                      transition={{ duration: 1.12, delay: 1.35, ease: [0.16, 1, 0.3, 1] }}
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
              </m.div>
            </div>
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
              variants={{ rest: { opacity: 0, x: -22, y: 18, scale: 0.97 }, settled: { opacity: 1, x: 0, y: 0, scale: 1 } }}
              transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
            >
              <ResponsivePhoto
                name="coast"
                className="moment-image coast-crop"
                alt={strings.coastImageAlt}
                sizes="(max-width: 800px) 100vw, (max-width: 1120px) 60vw, 48vw"
              />
              <figcaption><span>{strings.momentOne}</span></figcaption>
            </m.figure>
            <m.figure
              className="moment moment-second"
              variants={{ rest: { opacity: 0, x: 22, y: 28, scale: 0.97 }, settled: { opacity: 1, x: 0, y: 0, scale: 1 } }}
              transition={{ duration: 0.76, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <ResponsivePhoto
                name="mountain"
                className="moment-image mountain-crop"
                alt={strings.mountainImageAlt}
                sizes="(max-width: 800px) 100vw, (max-width: 1120px) 60vw, 48vw"
              />
              <figcaption><span>{strings.momentTwo}</span></figcaption>
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
