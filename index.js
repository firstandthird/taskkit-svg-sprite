'use strict';
const TaskKitTask = require('taskkit-task');
const SVGSpriter = require('svg-sprite');
const async = require('async');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

class SVGSpriteTask extends TaskKitTask {
  get description() {
    return 'Creates an SVG sprite file';
  }

  process(input, filename, done) {
    const config = {
      shape: {
        transform: [],
        id: {
          generator: (n, file) => path.basename(file.path, '.svg')
        }
      },
      mode: {
        symbol: {
          inline: true
        }
      }
    };

    const spriter = new SVGSpriter(config);
    let shapes = 0;

    async.autoInject({
      inputs(next) {
        glob(input, next);
      },
      files(inputs, next) {
        async.map(inputs, (file, done) => fs.readFile(file, 'utf8', (err, result) => {
          if (err) {
            return done(err);
          }
          done(null, { file, result });
        }), next);
      },
      sprite(files, next) {
        try {
          files.forEach(file => spriter.add(file.file, null, file.result));
          shapes = files.length;
        } catch (e) {
          next(e, null);
          return;
        }

        spriter.compile(next);
      }
    }, (err, results) => {
      if (err) {
        return done(err);
      }
      const contents = results.sprite[0].symbol.sprite.contents;

      this.write(filename, contents.toString('utf8'), done);
    });
  }
}

module.exports = SVGSpriteTask;
