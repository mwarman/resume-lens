import styles from './LoadingState.module.css';

const LoadingState = () => {
  return (
    <div className={styles.container}>
      <div>
        <div className={`${styles.skeleton} ${styles.headingSkeleton}`} />
        <div
          className={`${styles.skeleton} ${styles.lineSkeleton} ${styles.lineSkeletonFull} ${styles.skeletonGroupSpacing}`}
        />
        <div
          className={`${styles.skeleton} ${styles.lineSkeleton} ${styles.lineSkeletonWide} ${styles.skeletonGroupSpacing}`}
        />
        <div className={`${styles.skeleton} ${styles.lineSkeleton} ${styles.lineSkeletonMedium}`} />

        <div className={`${styles.skeleton} ${styles.headingSkeleton} ${styles.skeletonSection}`} />
        <div
          className={`${styles.skeleton} ${styles.lineSkeleton} ${styles.lineSkeletonFull} ${styles.skeletonGroupSpacing}`}
        />
        <div
          className={`${styles.skeleton} ${styles.lineSkeleton} ${styles.lineSkeletonWide} ${styles.skeletonGroupSpacing}`}
        />
        <div className={`${styles.skeleton} ${styles.lineSkeleton} ${styles.lineSkeletonMedium}`} />
      </div>
      <div className={styles.message}>Analyzing your résumé…</div>
    </div>
  );
};

export default LoadingState;
