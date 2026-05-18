import { ThemeToggle } from '@/components/theme/ThemeToggle';
import styles from './Header.module.css';

/**
 * Header component displays the application title and theme toggle.
 * Appears at the top of the page across all application states.
 */
const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <h1 className={styles.title}>Resume Lens</h1>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
