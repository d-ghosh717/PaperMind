import type { Route } from "./+types/home";
import { Link } from "react-router";
import { Upload, FileText, Calculator, Lightbulb } from "lucide-react";
import { Navbar } from "~/components/navbar";
import { GlassCard } from "~/components/glass-card";
import styles from "./home.module.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "PaperMind - AI Research Paper Analysis" },
    {
      name: "description",
      content: "Analyze research papers with AI-powered summaries, formula extraction, and key concept flashcards",
    },
  ];
}

export default function Home() {
  return (
    <div className={styles.home}>
      <Navbar />
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.badge}>
            <Lightbulb className={styles.cardIcon} />
            AI RESEARCH ANALYZER
          </div>
          <h1 className={styles.headline}>
            ANALYZE
            <br />
            <span className={styles.headlineGradient}>RESEARCH</span>
            <br />
            WITH AI
          </h1>
          <p className={styles.subtext}>
            Transform complex research papers into structured summaries, extract formulas, and generate flashcards—all powered by advanced AI.
          </p>
          <div className={styles.buttonGroup}>
            <Link to="/dashboard" className={styles.primaryButton}>
              <Upload size={20} />
              Upload Paper
            </Link>
          </div>
        </div>
        <div className={styles.heroRight}>
          <div className={styles.floatingCards}>
            <GlassCard className={styles.floatingCard}>
              <h3 className={styles.cardTitle}>
                <FileText className={styles.cardIcon} />
                Structured Summary
              </h3>
              <p className={styles.cardContent}>AI-generated summaries with key points, methodology, and conclusions</p>
              <div className={styles.chartPlaceholder} />
            </GlassCard>
            <GlassCard className={styles.floatingCard}>
              <h3 className={styles.cardTitle}>
                <Calculator className={styles.cardIcon} />
                Formula Extraction
              </h3>
              <p className={styles.cardContent}>Automatically extract and render mathematical formulas</p>
              <div className={styles.formula}>E = mc²</div>
            </GlassCard>
            <GlassCard className={styles.floatingCard}>
              <h3 className={styles.cardTitle}>
                <Lightbulb className={styles.cardIcon} />
                Key Concepts
              </h3>
              <p className={styles.cardContent}>Flashcards to learn and master key research concepts</p>
              <div className={styles.chartPlaceholder} style={{ height: "40px" }} />
            </GlassCard>
          </div>
        </div>
      </section>
    </div>
  );
}
