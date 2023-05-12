import React, { useRef, useState } from 'react';
import Image from 'next/image';
import {
  useGameStore,
  useImageDataStore,
  useUIVisibleStore,
} from '../../../stores/stores';
import SearchQuery from './searchFormElements/SearchQuery';
import SearchRating from './searchFormElements/SearchRating';
import SearchTableauSize from './searchFormElements/SearchTableauSize';
import SearchPopular from './searchFormElements/SearchPopular';
import type { ReactElement, FormEventHandler } from 'react';
import { Rating } from '@giphy/js-fetch-api';
import { IGif } from '@giphy/js-types';
import { SortedGifData, organizeImages } from '../../../helpers/gif';
import { GameState, GifErrorState } from '../../game/Game.typedefs';
import { TopSearchResult } from '../../../lib/mongodb/helpers';
import giphyLogo from '@/img/giphyLogo.png';
import styles from '@/styles/elements/searchOverlay/SearchForm.module.scss';

export enum ServerHTTPStatus {
  Ok = 200,
  BadRequest = 400,
  Forbidden = 403,
  InternalServerError = 500,
  UnknownError = -1,
}

export type GifFetchResults = {
  numResults: number;
  status: ServerHTTPStatus;
};

export type SearchFormProps = {
  topSearches: TopSearchResult[];
  updateImageData: (data: SortedGifData[]) => void;
  resetImageLoaded: (numCards: number) => void;
  resetCards: (numCards: number) => void;
  startLoadTimers: () => void;
};

export default function SearchForm(props: SearchFormProps): ReactElement {
  const {
    topSearches,
    updateImageData,
    resetImageLoaded,
    resetCards,
    startLoadTimers,
  } = props;

  const idealTableauSize = useGameStore(state => state.idealTableauSize);
  const setGameState = useGameStore(state => state.setGameState);
  const setGifErrorState = useImageDataStore(state => state.setGifErrorState);
  const setUIVisibility = useUIVisibleStore.setState;

  const [searchQuery, setSearchQuery] = useState('');
  const [rating, setRating] = useState<Rating>('g');

  const alertTimeout = useRef<NodeJS.Timeout | null>(null);

  // Gets GIFs from API service
  const getGifs = async (): Promise<GifFetchResults> => {
    const tableauSizeInt = parseInt(idealTableauSize);

    const searchParams = new URLSearchParams({
      q: searchQuery,
      limit: (tableauSizeInt / 2).toString(),
      rating,
    });

    const response = await fetch('/api/search?' + searchParams, {
      headers: {
        'x-api-key': process.env.NEXT_PUBLIC_GIFCENTRATION_API_KEY ?? '',
      },
    });
    const json = await response.json();
    const { status } = response;

    switch (status) {
      case ServerHTTPStatus.BadRequest:
      case ServerHTTPStatus.Forbidden:
      case ServerHTTPStatus.InternalServerError:
        return {
          numResults: 0,
          status,
        };

      case ServerHTTPStatus.Ok:
        // Organize image data
        const organizedData = json.map((imageData: IGif) =>
          organizeImages(imageData)
        );

        updateImageData(organizedData);
        return {
          numResults: json.length,
          status,
        };

      default:
        return {
          numResults: 0,
          status: ServerHTTPStatus.UnknownError,
        };
    }
  };

  // Sets up game after receiving gif data
  const postGifSearchSetup = (numCards: number) => {
    resetCards(numCards);
    resetImageLoaded(numCards);
    startLoadTimers();
  };

  // Shows alert with a given state
  const showAlert = (state: GifErrorState) => {
    setGifErrorState(state);
    setUIVisibility({ alert: true });

    if (alertTimeout.current != null) {
      clearTimeout(alertTimeout.current);
    }

    alertTimeout.current = setTimeout(() => {
      setUIVisibility({ alert: false });
    }, 5000);
  };

  // Hides alert
  const hideAlert = () => {
    if (alertTimeout.current != null) {
      clearTimeout(alertTimeout.current);
    }
    setUIVisibility({ alert: false });
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async e => {
    e.preventDefault();
    hideAlert();
    setUIVisibility({ confetti: false });

    setGameState(GameState.Searching);
    const { numResults, status } = await getGifs();
    setGameState(GameState.Loading);
    const tableauSizeInt = parseInt(idealTableauSize);

    if (status !== ServerHTTPStatus.Ok) {
      // Something went wrong with the request
      setGameState(GameState.Idle);

      switch (status) {
        case ServerHTTPStatus.BadRequest:
          showAlert(GifErrorState.BadRequest);
          break;

        case ServerHTTPStatus.Forbidden:
          showAlert(GifErrorState.Forbidden);
          break;

        case ServerHTTPStatus.InternalServerError:
          showAlert(GifErrorState.InternalServerError);
          break;

        default:
          showAlert(GifErrorState.UnknownError);
      }
    } else if (numResults === 0) {
      // No GIFs found
      setGameState(GameState.Idle);
      showAlert(GifErrorState.NoGifs);
    } else if (numResults === tableauSizeInt / 2) {
      // There are enough GIFs for every card in the tableau
      postGifSearchSetup(tableauSizeInt);
      setGifErrorState(GifErrorState.Ok);
    } else if (numResults < tableauSizeInt / 2) {
      // There aren't enough GIFs for every card in the tableau, reduce tableau size
      postGifSearchSetup(numResults * 2);
      showAlert(GifErrorState.NotEnoughGifs);
    }
  };

  return (
    <form id={styles.searchForm} onSubmit={handleSubmit}>
      <SearchQuery searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <SearchPopular
        topSearches={topSearches}
        setSearchQuery={setSearchQuery}
      />
      <div id={styles.otherSettings}>
        <SearchRating rating={rating} setRating={setRating} />
        <SearchTableauSize />
      </div>
      <button id={styles.submit} type="submit">
        Go!
      </button>
      <a href="https://giphy.com" target="_blank" rel="noopener noreferrer">
        <Image id={styles.giphyLogo} src={giphyLogo} alt="Powered by GIPHY" />
      </a>
    </form>
  );
}
