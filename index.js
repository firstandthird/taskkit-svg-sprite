'use strict';
const TaskKitTask = require('taskkit-task');
const svgstore = require('svgstore');
const async = require('async');
const fs = require('fs');
const path = require('path');

class SVGSpriteTask extends TaskKitTask {
  get description() {
    return 'Creates an SVG sprite file';
  }

  process(input, filename, done) {
    if (!Array.isArray(input)) {
      input = [input];
    }

    const spriter = svgstore();

    async.autoInject({
      files(next) {
        async.map(input, (file, done) => fs.readFile(file, 'utf8', (err, result) => {
          if (err) {
            return done(err);
          }
          done(null, { file, result });
        }), next);
      },
      sprite(files, next) {
        try {
          files.forEach(file => spriter.add(path.basename(file.file, '.svg'), file.result));
        } catch (e) {
          return next(e, null);
        }

        next(null, spriter);
      }
    }, (err, results) => {
      if (err) {
        return done(err);
      }

      this.write(filename, results.sprite.toString({ inline: true }), done);
    });
  }
}

module.exports = SVGSpriteTask;
