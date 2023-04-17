import React, { ReactElement } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestion } from '@fortawesome/free-solid-svg-icons';
import { Measures, useMeasure } from '@react-hookz/web';
import { SizeProp } from '@fortawesome/fontawesome-svg-core';
import styles from '@/styles/elements/Card.module.scss';
import { Gif } from '@giphy/react-components';
import { GameState } from '../layout/Game';
import { IGif } from '@giphy/js-types';

export type CardProps = {
  gameState: GameState;
  index: number;
  imageData: IGif;
  flipped: boolean;
  active: boolean;
  matched: boolean;
  handleCardClick: (index: number) => void;
  updateImageLoaded: (index: number) => void;
};

const defaultSize = 100;
const gifSizeScale = 0.9;

export default function Card(props: CardProps): ReactElement {
  const {
    index,
    imageData,
    flipped,
    active,
    matched,
    handleCardClick,
    updateImageLoaded,
  } = props;

  const onClick = (): void => {
    handleCardClick(index);
  };

  const handleGifSeen = (): void => {
    updateImageLoaded(index);
  };

  // Determine CSS classes
  const cardBodyClasses = `${styles.cardBody} ${
    active ? styles.active : styles.inactive
  } ${flipped ? styles.flipped : ''}`;

  const cardBackClasses = `${styles.cardFace} ${styles.back} ${
    matched ? styles.matched : ''
  }`;

  // Calculate size multipler of FA question mark
  const [measurements, ref] = useMeasure<HTMLDivElement>();
  const { width } = measurements || ({} as Measures);
  const sizeMultipler = Math.round(Math.min(10, width / 25)) || 1;
  const size = `${sizeMultipler}x` as SizeProp;

  // Determine aspect ratio of image and resize
  const { width: originalWidth, height: originalHeight } =
    imageData.images.original;
  let newWidth, newHeight;

  if (originalWidth >= originalHeight) {
    // Wide
    newWidth = (width ?? defaultSize) * gifSizeScale;
    newHeight =
      (((width ?? defaultSize) * originalHeight) / originalWidth) *
      gifSizeScale;
  } else {
    // Tall
    newHeight = (width ?? defaultSize) * gifSizeScale;
    newWidth =
      (((width ?? defaultSize) * originalWidth) / originalHeight) *
      gifSizeScale;
  }

  const hideLinks = true; // gameState === GameState.Playing;

  return (
    <div className={styles.cardContainer} onClick={onClick}>
      <div className={cardBodyClasses} ref={ref}>
        <div className={`${styles.cardFace} ${styles.front}`}>
          <FontAwesomeIcon
            icon={faQuestion}
            size={size}
            data-testid="question mark"
          />
        </div>
        <div className={cardBackClasses}>
          {imageData && (
            <Gif
              gif={imageData}
              width={newWidth}
              height={newHeight}
              hideAttribution={hideLinks}
              noLink={hideLinks}
              onGifSeen={handleGifSeen}
            />
          )}
        </div>
      </div>
    </div>
  );
}
