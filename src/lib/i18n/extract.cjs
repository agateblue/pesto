const { GettextExtractor, RegexExtractors  } = require('@rgglez/gettext-extractor');
const pofile = require("pofile");
const fs = require("fs");

let extractor = new GettextExtractor();

extractor
    .createRegexParser([
        RegexExtractors.addCondition({
            regex: /\$_\(['"`](.*?)['"`]\)/i,
            text: 1
        })
    ])
    .parseFilesGlob('./src/**/*.@(ts|js|tsx|jsx|svelte)');

extractor
    .createRegexParser([
        RegexExtractors.addCondition({
            regex: /\$_n\(['"`](.*?)['"`]\)/i,
            text: 1,
            textPlural: 2
        })
    ])
    .parseFilesGlob('./src/**/*.@(ts|js|tsx|jsx|svelte)');    

function getPotString(headers = {}) {
    const po = new pofile();
    po.items = extractor.getPofileItems().sort((a, b) => (a.references.sort()[0] > b.references.sort()[0]) ? 1 : -1);
    po.headers = Object.assign({'Content-Type': 'text/plain; charset=UTF-8'}, headers);
    return po.toString();
}

fs.writeFileSync('./src/lib/i18n/messages/messages.pot', getPotString());

extractor.printStats();