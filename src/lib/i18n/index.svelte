<script context="module">
  
  // from https://github.com/rgglez/svelte-i18n-gettext/blob/main/src/index.svelte
  
  import { derived } from 'svelte/store';
  import { parsedTranslations, lang } from './stores';
  import Gettext from '@postalsys/gettext';
  
  const gt = new Gettext();
  
  export const _ = derived([lang, parsedTranslations], ([$lang, $parsedTranslations]) => function(msgid, msgctxt="") {
      gt.addTranslations($lang, 'messages', $parsedTranslations[$lang]);
      gt.setLocale($lang);
      return gt.pgettext(msgctxt, msgid);
  });
  
  export const _n = derived([lang, parsedTranslations], ([$lang, $parsedTranslations]) => function(msgid, msgidPlural="", count=0, msgctxt="") {
      gt.addTranslations($lang, 'messages', $parsedTranslations[$lang]);
      gt.setLocale($lang);
      return gt.npgettext(msgctxt, msgid, msgidPlural, count);
  });
  </script>