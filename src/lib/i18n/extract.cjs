const { GettextExtractor } = require("@rgglez/gettext-extractor");
const pofile = require("pofile");
const fs = require("fs");

const { RegexUtils } = require("@rgglez/gettext-extractor/dist/regex/utils");
const { Validate } = require("@rgglez/gettext-extractor/dist/utils/validate");

// type IAddConditionExtractorArgument = {
//   regex: RegExp,
//   text: number,
//   textPlural?: number
// };
function addConditionExtractor({ regex, text, textPlural, context }) {
  // from https://github.com/rgglez/gettext-extractor/blob/master/src/regex/extractors/factories/addCondition.ts
  // to support context strings
  Validate.required.argument({ regex });
  Validate.required.argument({ text });
  Validate.required.regexProperty({ regex }, "arguments[0].regex");
  Validate.required.numberProperty({ text }, "arguments[0].text");
  Validate.optional.numberProperty({ textPlural }, "arguments[0].textPlural");
  Validate.optional.numberProperty({ context }, "arguments[0].context");

  return (sourceFileContent, sourceFilePath, messages) => {
    // Check if the flags have a global flag
    if (regex.flags.indexOf("g") === -1) {
      // If not, add it.
      regex = new RegExp(regex.source, regex.flags + "g");
    }

    // Check if the flags have a multiline flag
    if (regex.flags.indexOf("m") === -1) {
      // If not, add it.
      regex = new RegExp(regex.source, regex.flags + "m");
    }

    const matches = sourceFileContent.match(regex);

    if (matches !== null) {
      for (let match of matches) {
        const matchGroups = regex.exec(match);

        if (matchGroups !== null) {
          const message = {
            text: matchGroups[text],
            references: [`${sourceFilePath}:${RegexUtils.getLineNumber(sourceFileContent, match)}`],
            comments: [],
            context: matchGroups[context] || null
          };

          if (textPlural) {
            message.textPlural = matchGroups[textPlural];
          }

          messages.push(message);
        }

        // Reset last index for next string
        regex.lastIndex = 0;
      }
    }
  };
}
class RegexExtractors {
  static addCondition = addConditionExtractor;
}

let extractor = new GettextExtractor();

extractor
  .createRegexParser([
    RegexExtractors.addCondition({
      regex: /\$_\(['"`](.*?)['"`](?:, ['"`](.*?)['"`])?\)?(?:, \[(.*?)\])?\)/i,
      text: 1,
      context: 2
    })
  ])
  .parseFilesGlob("./src/**/*.@(ts|js|tsx|jsx|svelte)");

extractor
  .createRegexParser([
    RegexExtractors.addCondition({
      regex:
        /\$_n\(['"`](.*?)['"`](?:, ['"`](.*?)['"`])(?:, (.*?))(?:, ['"`](.*?)['"`])?\)(?:, \[(.*?)\])?/i,
      text: 1,
      textPlural: 2,
      context: 4
    })
  ])
  .parseFilesGlob("./src/**/*.@(ts|js|tsx|jsx|svelte)");

function getPotString(headers = {}) {
  const po = new pofile();
  po.items = extractor
    .getPofileItems()
    .sort((a, b) => (a.references.sort()[0] > b.references.sort()[0] ? 1 : -1));
  po.headers = Object.assign({ "Content-Type": "text/plain; charset=UTF-8" }, headers);
  return po.toString();
}

fs.writeFileSync("./src/lib/i18n/messages/messages.pot", getPotString());

extractor.printStats();
