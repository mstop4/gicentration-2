import React, { ReactElement } from 'react';
import { render, waitFor } from '@testing-library/react';
import Tableau from './Tableau';
import '@testing-library/jest-dom';
import { GameState } from '../../layout/Game.typedefs';
import { IGif } from '@giphy/js-types';
import mockIGifs from '../../../mockData/IGifs.json';

const makeTableau = (): ReactElement => {
  return (
    <Tableau
      gameState={GameState.Playing}
      setGameState={jest.fn()}
      flipped={[false, false]}
      setFlipped={jest.fn()}
      matched={[false, false]}
      setMatched={jest.fn()}
      imageIndexes={[0, 0]}
      imageData={[mockIGifs[0], mockIGifs[1]] as unknown as IGif[]}
      selectedCardIndexes={[]}
      updateImageLoaded={jest.fn()}
      setSelectedCardIndexes={jest.fn()}
      showConfetti={jest.fn()}
    />
  );
};

describe('Tableau', () => {
  it('renders a Tableau', async () => {
    const { container } = render(makeTableau());
    const tableau = container.querySelector('#tableau');

    await waitFor(() => {
      expect(tableau).toBeInTheDocument();
    });
  });

  it('has 2 Cards in the tableau div', async () => {
    const { container } = render(makeTableau());
    const tableau = container.querySelector('#tableau');
    const cards = tableau?.querySelectorAll('.cardContainer');

    await waitFor(() => {
      expect(cards).toHaveLength(2);
      cards?.forEach(card => {
        expect(card).toBeInTheDocument();
      });
    });
  });
});
