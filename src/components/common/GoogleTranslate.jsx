import { useEffect } from 'react';
import { loadGoogleTranslate } from '../../lib/googleTranslate.js';

export default function GoogleTranslate() {
  useEffect(() => {
    loadGoogleTranslate();
  }, []);

  return <div id="google_translate_element" aria-hidden="true" />;
}
