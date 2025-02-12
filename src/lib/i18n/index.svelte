<script context="module" lang="ts">
  // from https://github.com/rgglez/svelte-i18n-gettext/blob/main/src/index.svelte

  import { derived } from "svelte/store";
  import { parsedTranslations, lang } from "./stores";
  import Gettext from "@postalsys/gettext";

  const gt = new Gettext();

  function replaceParams(s: string, params: []) {
    let f = s;
    params.forEach((v, i) => {
      f = f.replace(`%${i}`, v);
    });
    return f;
  }
  export const _ = derived(
    [lang, parsedTranslations],
    ([$lang, $parsedTranslations]) =>
      function (msgid, msgctxt = "", params: any[] = []) {
        gt.addTranslations($lang, "messages", $parsedTranslations[$lang]);
        gt.setLocale($lang);
        return replaceParams(gt.pgettext(msgctxt, msgid), params);
      }
  );

  export const _n = derived(
    [lang, parsedTranslations],
    ([$lang, $parsedTranslations]) =>
      function (msgid, msgidPlural = "", count = 0, msgctxt = "", params: any[] = []) {
        gt.addTranslations($lang, "messages", $parsedTranslations[$lang]);
        gt.setLocale($lang);
        return replaceParams(
          gt.npgettext(msgctxt, msgid, msgidPlural, count).replace("%n", count),
          params
        );
      }
  );
</script>
