import styles from './LoadingState.module.css';

const LoadingState = () => {
  return (
    <div className={styles.container}>
      {/* Overlay message */}
      <div className={styles.messageOverlay}>
        <div className={styles.message}>Analyzing…</div>
      </div>

      {/* Two-column layout mirroring ResultCard */}
      <div className={styles.contentWrapper}>
        {/* Left column: Structured skeleton content */}
        <div className={styles.leftColumn}>
          {/* Header skeleton */}
          <div className={styles.headerSkeleton}>
            <div className={`${styles.skeleton} ${styles.headingSkeleton}`} />
            <div className={`${styles.skeleton} ${styles.lineSkeleton}`} />
            <div className={`${styles.skeleton} ${styles.lineSkeleton} ${styles.lineSkeletonShort}`} />
          </div>

          {/* Summary skeleton */}
          <div className={`${styles.skeleton} ${styles.headingSkeleton} ${styles.skeletonSection}`} />
          <div
            className={`${styles.skeleton} ${styles.lineSkeleton} ${styles.lineSkeletonFull} ${styles.skeletonGroupSpacing}`}
          />
          <div
            className={`${styles.skeleton} ${styles.lineSkeleton} ${styles.lineSkeletonWide} ${styles.skeletonGroupSpacing}`}
          />
          <div className={`${styles.skeleton} ${styles.lineSkeleton} ${styles.lineSkeletonMedium}`} />

          {/* Tech Skills section */}
          <div className={`${styles.skeleton} ${styles.headingSkeleton} ${styles.skeletonSection}`} />
          <div className={`${styles.skeleton} ${styles.lineSkeleton} ${styles.lineSkeletonWide}`} />

          {/* Soft Skills section */}
          <div className={`${styles.skeleton} ${styles.headingSkeleton} ${styles.skeletonSection}`} />
          <div className={`${styles.skeleton} ${styles.lineSkeleton} ${styles.lineSkeletonWide}`} />

          {/* Experience skeleton */}
          <div className={`${styles.skeleton} ${styles.headingSkeleton} ${styles.skeletonSection}`} />
          <div className={`${styles.skeleton} ${styles.lineSkeleton} ${styles.lineSkeletonShort}`} />
          <div className={`${styles.skeleton} ${styles.lineSkeleton} ${styles.lineSkeletonShort}`} />
          <div
            className={`${styles.skeleton} ${styles.lineSkeleton} ${styles.lineSkeletonFull} ${styles.skeletonGroupSpacing}`}
          />
          <div
            className={`${styles.skeleton} ${styles.lineSkeleton} ${styles.lineSkeletonMedium} ${styles.skeletonGroupSpacing}`}
          />

          {/* Education section */}
          <div className={`${styles.skeleton} ${styles.headingSkeleton} ${styles.skeletonSection}`} />
          <div className={`${styles.skeleton} ${styles.lineSkeleton} ${styles.lineSkeletonWide}`} />
          <div className={`${styles.skeleton} ${styles.lineSkeleton} ${styles.lineSkeletonMedium}`} />

          {/* Certifications section */}
          <div className={`${styles.skeleton} ${styles.headingSkeleton} ${styles.skeletonSection}`} />
          <div className={`${styles.skeleton} ${styles.lineSkeleton} ${styles.lineSkeletonWide}`} />
          <div className={`${styles.skeleton} ${styles.lineSkeleton} ${styles.lineSkeletonWide}`} />
          <div className={`${styles.skeleton} ${styles.lineSkeleton} ${styles.lineSkeletonMedium}`} />
        </div>

        {/* Right column: Large skeleton block for JSON */}
        <div className={styles.rightColumn}>
          <div className={`${styles.skeleton} ${styles.jsonSkeleton}`} />
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
