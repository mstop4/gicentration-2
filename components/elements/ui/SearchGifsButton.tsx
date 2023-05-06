import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import {
  useClickHereVisibleStore,
  useTitleVisibleStore,
} from '../../game/Game.stores';
import type { ReactElement } from 'react';
import { GameState } from '../../game/Game.typedefs';
import buttonBaseStyles from '@/styles/elements/ui/ButtonBase.module.scss';

export type SearchGifsButtonProps = {
  gameState: GameState;
  showSearchOverlay: () => void;
};

export default function SearchGifsButton(
  props: SearchGifsButtonProps
): ReactElement {
  const { gameState, showSearchOverlay } = props;

  const { titleRendered, headerVisible } = useTitleVisibleStore.getState();
  const setTitleVisibility = useTitleVisibleStore.setState;
  const setClickHereVisibility = useClickHereVisibleStore.setState;

  const handleClick = async (): Promise<void> => {
    if (gameState === GameState.Searching || gameState === GameState.Loading)
      return;

    showSearchOverlay();
    setClickHereVisibility({ visible: false });

    if (titleRendered) {
      setTitleVisibility({ titleVisible: false });

      setTimeout(() => {
        setTitleVisibility({ subtitleVisible: false });
      }, 250);
      setTimeout(() => {
        setClickHereVisibility({ rendered: false });
      }, 1000);
      setTimeout(() => {
        setTitleVisibility({ titleRendered: false });
      }, 1250);
    }

    if (!headerVisible) {
      setTimeout(() => {
        setTitleVisibility({ headerVisible: true });
      }, 1000);
    }
  };

  return (
    <button
      id="searchGifsButton"
      className={buttonBaseStyles.buttonBase}
      onClick={handleClick}
    >
      <FontAwesomeIcon
        icon={faMagnifyingGlass}
        data-testid="magnifying glass"
      />
    </button>
  );
}
