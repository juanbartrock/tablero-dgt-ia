'use client';

import React from 'react';
import styles from './PulsingTitle.module.css';

interface PulsingTitleProps {
  titleText: string;
  className?: string;
}

const PulsingTitle: React.FC<PulsingTitleProps> = ({ titleText, className = '' }) => {
  return (
    <div className={styles.titleContainer}>
      <div className={styles.flank}>
        <div className={`${styles.dot} ${styles.dot1}`}></div>
        <div className={`${styles.dot} ${styles.dot2}`}></div>
        <div className={`${styles.dot} ${styles.dot3}`}></div>
      </div>
      <h1 className={`${className}`}>
        {titleText}
      </h1>
      <div className={styles.flank}>
        <div className={`${styles.dot} ${styles.dot4}`}></div>
        <div className={`${styles.dot} ${styles.dot5}`}></div>
        <div className={`${styles.dot} ${styles.dot6}`}></div>
      </div>
    </div>
  );
};

export default PulsingTitle; 