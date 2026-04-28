import styles from './Header.module.css';

/**
 * Header component displays the application title.
 * Appears at the top of the page across all application states.
 */
const Header = () => {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Resume Lens</h1>
    </header>
  );
};

export default Header;
