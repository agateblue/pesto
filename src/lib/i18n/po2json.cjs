#!/usr/bin/env node

// from https://github.com/rgglez/svelte-i18n-gettext/blob/main/bin/po2json.cjs

const { program } = require("commander");
const gettextParser = require("gettext-parser");
const fs = require("fs");

program
  .option("-i, --input <input>", "input PO file")
  .option("-o, --output <output>", "output JSON file")
  .option("-v, --verbose", "verbose?");

program.parse();

const translationsContent = fs.readFileSync(program.opts().input);
var po = gettextParser.po.parse(translationsContent);
fs.writeFileSync(program.opts().output, JSON.stringify(po));

if (program.opts().verbose) {
  console.log(po);
}
