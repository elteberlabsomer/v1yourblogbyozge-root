import {
  useReducer,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from 'react';

const TOP_RESET_Y = 64;
const DELTA_THRESHOLD = 12;

type Overlay = 'none' | 'drawer' | 'search';
type InputMode = 'pointer' | 'keyboard';

type ChromeState = {
  overlay: Overlay;
  inputMode: InputMode;
  headerHidden: boolean;
};

type ChromeAction =
  | { type: 'OPEN_DRAWER' }
  | { type: 'CLOSE_DRAWER' }
  | { type: 'TOGGLE_DRAWER' }
  | { type: 'OPEN_SEARCH' }
  | { type: 'CLOSE_SEARCH' }
  | { type: 'INPUT_KEYBOARD' }
  | { type: 'INPUT_POINTER' }
  | { type: 'HEADER_HIDE' }
  | { type: 'HEADER_SHOW' };

const initialState: ChromeState = {
  overlay: 'none',
  inputMode: 'pointer',
  headerHidden: false,
};

function enforceInvariants(state: ChromeState): ChromeState {
  if (state.overlay !== 'none' || state.inputMode === 'keyboard') {
    if (state.headerHidden) {
      return { ...state, headerHidden: false };
    }
  }
  return state;
}

function reducer(state: ChromeState, action: ChromeAction): ChromeState {
  let next = state;

  switch (action.type) {
    case 'OPEN_DRAWER': {
      next = { ...state, overlay: 'drawer', headerHidden: false };
      break;
    }

    case 'CLOSE_DRAWER': {
      if (state.overlay === 'drawer') {
        next = { ...state, overlay: 'none', headerHidden: false };
      }
      break;
    }

    case 'TOGGLE_DRAWER': {
      if (state.overlay === 'drawer') {
        next = { ...state, overlay: 'none', headerHidden: false };
      } else {
        next = { ...state, overlay: 'drawer', headerHidden: false };
      }
      break;
    }

    case 'OPEN_SEARCH': {
      next = { ...state, overlay: 'search', headerHidden: false };
      break;
    }

    case 'CLOSE_SEARCH': {
      if (state.overlay === 'search') {
        next = { ...state, overlay: 'none', headerHidden: false };
      }
      break;
    }

    case 'INPUT_KEYBOARD': {
      next = { ...state, inputMode: 'keyboard', headerHidden: false };
      break;
    }

    case 'INPUT_POINTER': {
      next = { ...state, inputMode: 'pointer' };
      break;
    }

    case 'HEADER_HIDE': {
      const isOverlayNone = state.overlay === 'none';
      const isPointerMode = state.inputMode === 'pointer';
      const autoHideAllowed = isOverlayNone && isPointerMode;

      if (autoHideAllowed && !state.headerHidden) {
        next = { ...state, headerHidden: true };
      }
      break;
    }

    case 'HEADER_SHOW': {
      if (state.headerHidden) {
        next = { ...state, headerHidden: false };
      }
      break;
    }

    default: {
      break;
    }
  }

  return enforceInvariants(next);
}

export function useChromeBehavior() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const stateRef = useRef<ChromeState>(state);
  useLayoutEffect(() => {
    stateRef.current = state;
  }, [state]);

  const lastScrollY = useRef(0);
  const scrollDelta = useRef(0);
  const lastDir = useRef<1 | -1 | 0>(0);

  const closeDrawer = useCallback(() => {
    dispatch({ type: 'CLOSE_DRAWER' });
  }, []);

  const closeSearch = useCallback(() => {
    dispatch({ type: 'CLOSE_SEARCH' });
  }, []);

  const openDrawer = useCallback(() => {
    dispatch({ type: 'OPEN_DRAWER' });
  }, []);

  const openSearch = useCallback(() => {
    dispatch({ type: 'OPEN_SEARCH' });
  }, []);

  const toggleDrawer = useCallback(() => {
    dispatch({ type: 'TOGGLE_DRAWER' });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        dispatch({ type: 'INPUT_KEYBOARD' });
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        dispatch({ type: 'OPEN_SEARCH' });
      } else if (e.key === 'Escape') {
        const s = stateRef.current;
        if (s.overlay === 'drawer') {
          dispatch({ type: 'CLOSE_DRAWER' });
        }
        if (s.overlay === 'search') {
          dispatch({ type: 'CLOSE_SEARCH' });
        }
      }
    };

    const handleMouseDown = () => {
      dispatch({ type: 'INPUT_POINTER' });
    };

    const handleTouchStart = () => {
      dispatch({ type: 'INPUT_POINTER' });
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('is-scrollLocked', state.overlay !== 'none');
  }, [state.overlay]);

  useEffect(() => {
    const handleScroll = () => {
      const s = stateRef.current;
      const y = window.scrollY;

      if (y <= TOP_RESET_Y) {
        if (s.headerHidden) {
          dispatch({ type: 'HEADER_SHOW' });
        }
        scrollDelta.current = 0;
        lastDir.current = 0;
        lastScrollY.current = y;
        return;
      }

      const isOverlayNone = s.overlay === 'none';
      const isPointerMode = s.inputMode === 'pointer';
      const autoHideEnabled = isOverlayNone && isPointerMode;

      if (!autoHideEnabled) {
        scrollDelta.current = 0;
        lastDir.current = 0;
        lastScrollY.current = y;
        return;
      }

      const delta = y - lastScrollY.current;

      let dir: 1 | -1 | 0 = 0;
      if (delta > 0) {
        dir = 1;
      } else if (delta < 0) {
        dir = -1;
      }

      if (dir !== 0 && dir !== lastDir.current) {
        scrollDelta.current = delta;
        lastDir.current = dir;
      } else {
        scrollDelta.current += delta;
      }

      if (scrollDelta.current >= DELTA_THRESHOLD) {
        if (!s.headerHidden) {
          dispatch({ type: 'HEADER_HIDE' });
        }
        scrollDelta.current = 0;
      } else if (scrollDelta.current <= -DELTA_THRESHOLD) {
        if (s.headerHidden) {
          dispatch({ type: 'HEADER_SHOW' });
        }
        scrollDelta.current = 0;
      }

      lastScrollY.current = y;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const drawerOpen = state.overlay === 'drawer';
  const searchOpen = state.overlay === 'search';

  return {
    drawerOpen,
    searchOpen,
    headerHidden: state.headerHidden,
    openDrawer,
    toggleDrawer,
    openSearch,
    closeDrawer,
    closeSearch,
  };
}
