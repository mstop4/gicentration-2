import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import ClickHere from './ClickHere';
import '@testing-library/jest-dom';
import { useClickHereVisibleStore } from '../../game/Game.stores';
import { getZustandHooks } from '../../../helpers/zustandTest';

let zustandHooks;

describe('ClickHere', () => {
  beforeAll(() => {
    zustandHooks = getZustandHooks(useClickHereVisibleStore);
    jest.useFakeTimers();
  });

  beforeEach(() => {
    zustandHooks.reset();
  });

  afterAll(() => {
    zustandHooks.unmount();
    zustandHooks = null;
    jest.useRealTimers();
  });

  it('renders a ClickHere', () => {
    const { container } = render(<ClickHere showSearchOverlay={jest.fn()} />);

    const clickHere = container.querySelector('#clickHere');
    expect(clickHere).toBeInTheDocument();
  });

  it('should be visible', async () => {
    await act(() => zustandHooks.setState({ visible: true }));

    await waitFor(() => {
      const { container } = render(<ClickHere showSearchOverlay={jest.fn()} />);

      const clickHere = container.querySelector('#clickHere') as Element;
      expect(clickHere).toHaveClass('elementVisible');
    });
  });

  it('should be hidden', async () => {
    await act(() => zustandHooks.setState({ visible: false }));

    await waitFor(() => {
      const { container } = render(<ClickHere showSearchOverlay={jest.fn()} />);

      const clickHere = container.querySelector('#clickHere') as Element;
      expect(clickHere).toHaveClass('elementHidden');
    });
  });

  it('should show search overlay when not rendered', async () => {
    const showSearchOverlayMock = jest.fn();
    const { container } = render(
      <ClickHere showSearchOverlay={showSearchOverlayMock} />
    );

    const clickHere = container.querySelector('#clickHere') as Element;
    fireEvent.click(clickHere);

    await waitFor(() => {
      expect(showSearchOverlayMock).toBeCalled();
    });
  });

  it('calls dispatches and callbacks when clicked', async () => {
    const showSearchOverlayMock = jest.fn();
    const { container } = render(
      <ClickHere showSearchOverlay={showSearchOverlayMock} />
    );

    const clickHere = container.querySelector('#clickHere') as Element;

    fireEvent.click(clickHere);
    await act(() => jest.runAllTimers());

    await waitFor(() => {
      expect(showSearchOverlayMock).toBeCalled();
    });
  });
});
