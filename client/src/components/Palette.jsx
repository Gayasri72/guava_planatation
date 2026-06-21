import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client.js';
import { DEFAULT_PALETTE, FALLBACK_HEX, normalizePalette } from '../colors.js';

const PaletteCtx = createContext({
  palette: DEFAULT_PALETTE,
  hexFor: () => FALLBACK_HEX,
  reload: () => {},
});

export function usePalette() {
  return useContext(PaletteCtx);
}

export function PaletteProvider({ children }) {
  const [palette, setPalette] = useState(DEFAULT_PALETTE);

  const reload = useCallback(async () => {
    try {
      const r = await api.get('/settings');
      const next = normalizePalette(r.data.availableColors);
      if (next.length) setPalette(next);
    } catch {
      /* keep default palette */
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const hexFor = useCallback(
    (name) => palette.find((c) => c.name === name)?.hex || FALLBACK_HEX,
    [palette]
  );

  const value = useMemo(() => ({ palette, hexFor, reload }), [palette, hexFor, reload]);

  return <PaletteCtx.Provider value={value}>{children}</PaletteCtx.Provider>;
}
