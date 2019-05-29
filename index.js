'use strict';
const TaskKitTask = require('taskkit-task');
const SVGSpriter = require('svg-sprite');
const async = require('async');
const fs = require('fs');
const path = require('path');
const DOMParser = require('xmldom').DOMParser;

const defs = new DOMParser().parseFromString('<defs></defs>');
let count = 0;

/**
 * Fixes Firefox defs issue: https://github.com/jkphl/svg-sprite/issues/74
 */
function regexEscape(str) {
  return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function updateUrls(svg, idsToReplace) {
  for (let i = 0; i < idsToReplace.length; i++) {
    const str = `url(#${idsToReplace[i][0]})`;
    svg = svg.replace(
      new RegExp(regexEscape(str), 'g'),
      `url(#${idsToReplace[i][1]})`
    );
  }

  return svg;
}

function extractGradients(shape, tag) {
  const idsToReplace = [];

  const gradients = shape.dom.getElementsByTagName(tag);
  while (gradients.length > 0) {
    defs.documentElement.appendChild(gradients[0]);

    const id = gradients[0].getAttribute('id');
    const newId = `g${++count}`;
    gradients[0].setAttribute('id', newId);
    idsToReplace.push([id, newId]);
  }

  return idsToReplace;
}

function gradientsExtraction(shape, spriter, callback) {
  const idsToReplace = [].concat(
    extractGradients(shape, 'linearGradient'),
    extractGradients(shape, 'radialGradient')
  );

  shape.setSVG(updateUrls(shape.getSVG(), idsToReplace));
  callback(null);
}

class SVGSpriteTask extends TaskKitTask {
  get description() {
    return 'Creates an SVG sprite file';
  }

  get classModule() {
    return path.join(__dirname, 'index.js');
  }

  get defaultOptions() {
    return {
      disableSVGO: false
    };
  }

  process(input, filename) {
    if (!Array.isArray(input)) {
      input = [input];
    }

    const config = {
      shape: {
        transform: [
          gradientsExtraction
        ],
        id: {
          generator: (n, file) => path.basename(file.path, '.svg')
        }
      },
      mode: {
        symbol: {
          inline: true
        }
      },
      svg: {
        transform: [
          svg => svg.replace(
            '<symbol ',
            `${defs.firstChild.toString()}<symbol `
          )
        ],
      }
    };

    if (!this.options.disableSVGO) {
      config.shape.transform.push('svgo');
    }

    const spriter = new SVGSpriter(config);

    return async.autoInject({
      files(next) {
        async.map(input, (file, cb) => fs.readFile(file, 'utf8', (err, result) => {
          if (err) {
            return cb(err);
          }

          cb(null, { file, result });
        }), next);
      },
      sprite(files, next) {
        try {
          files.forEach(file => spriter.add(file.file, null, file.result));
        } catch (e) {
          return next(e, null);
        }

        spriter.compile(next);
      }
    }).then(results => {
      const contents = results.sprite[0].symbol.sprite.contents;
      return this.write(filename, contents.toString('utf8'));
    });
  }
}

module.exports = SVGSpriteTask;
