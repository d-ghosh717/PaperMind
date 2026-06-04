import classNames from "classnames";
import styles from "./glass-card.module.css";

interface GlassCardProps {
  /**
   * The content to display inside the card
   * @important
   */
  children: React.ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * A glassmorphism card component with backdrop blur and subtle borders
 */
export function GlassCard({ children, className }: GlassCardProps) {
  return <div className={classNames(styles.card, className)}>{children}</div>;
}
