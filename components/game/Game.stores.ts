import { create } from 'zustand';
import {
  CardArrayAction,
  ClickHereVisibility,
  GameState,
  GameStore,
  TitleVisibility,
  UIVisibility,
} from './Game.typedefs';
import clientConfig from '../../config/clientConfig';

const { defaultTableauSize } = clientConfig.game;

const _cardArrayReducer = (
  prevState: GameStore,
  key: 'flipped' | 'matched' | 'selectedCardIndexes',
  action: CardArrayAction
) => {
  let newArray: (number | boolean)[];
  const { type, payload } = action;

  switch (type) {
    case 'set':
      newArray = [...prevState[key]];
      if (Array.isArray(payload)) {
        for (const index of payload) {
          if (index < newArray.length) {
            newArray[index] = true;
          }
        }
      } else {
        if (payload < newArray.length) {
          newArray[payload] = true;
        }
      }
      break;

    case 'push':
      if (Array.isArray(payload)) {
        newArray = [...prevState[key], ...payload];
      } else {
        newArray = [...prevState[key], payload];
      }
      break;

    case 'copy':
      newArray = [...payload];
      break;

    case 'clear':
      newArray = Array(payload).fill(false);
      break;
  }

  return { [key]: newArray };
};

export const useGameStore = create<GameStore>(set => ({
  gameState: GameState.Idle,
  flipped: [],
  matched: [],
  selectedCardIndexes: [],
  idealTableauSize: defaultTableauSize.toString(),
  actualTableauSize: defaultTableauSize,
  setGameState: gameState =>
    set(() => ({
      gameState: gameState,
    })),
  setFlipped: action =>
    set(state => _cardArrayReducer(state, 'flipped', action)),
  setMatched: action =>
    set(state => _cardArrayReducer(state, 'matched', action)),
  setSelectedCardIndexes: action =>
    set(state => _cardArrayReducer(state, 'selectedCardIndexes', action)),
  setIdealTableauSize: size => set(() => ({ idealTableauSize: size })),
  setActualTableauSize: size => set(() => ({ actualTableauSize: size })),
}));

export const useUIVisibleStore = create<UIVisibility>(() => ({
  overlay: false,
  alert: false,
  confetti: false,
  longWaitMsg: false,
}));

export const useClickHereVisibleStore = create<ClickHereVisibility>(() => ({
  visible: false,
  rendered: true,
}));

export const useTitleVisibleStore = create<TitleVisibility>(() => ({
  headerVisible: false,
  titleRendered: true,
  titleVisible: false,
  subtitleVisible: false,
}));
