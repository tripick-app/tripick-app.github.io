import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LazyMotion, MotionConfig } from "motion/react";
import App from "./App.tsx";
import "./styles.css";

const loadMotionFeatures = () => import("./motion-features.ts").then((module) => module.default);

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("页面缺少 #root 挂载点。");

createRoot(rootElement).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadMotionFeatures} strict>
        <App />
      </LazyMotion>
    </MotionConfig>
  </StrictMode>,
);
