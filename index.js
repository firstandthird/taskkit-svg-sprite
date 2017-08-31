'use strict';
const TaskKitTask = require('taskkit-task');
const SVGSpriter = require('svg-sprite');
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

    const config = {
      shape: {
        id: {
          generator: function(n, file) {
            return path.basename(file.path, '.svg');
          }
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
          files.forEach(file => spriter.add(file.file, null, file.result));
          shapes = files.length;
        } catch(e) {
          next(e, null);
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

/*
'use strict';

const SVGSpriter = require('svg-sprite');
const path = require('path');
const fs = require('fs');
const config = {
  dest: 'web/public/_dist/',
  mode: {
    symbol: {
      inline: true
    }
  }
};
const spriter = new SVGSpriter(config);
const source = 'web/public/images/icons';

fs.readdir(source, (err, data) => {
  if (err) {
    throw new Error(err);
  }

  data.filter(f => path.extname(f).toLowerCase() === '.svg')
    .forEach(fileName => {
      const filePath = path.resolve(source, fileName);
      spriter.add(filePath, null, fs.readFileSync(filePath, { encoding: 'utf-8' }));
    });

  spriter.compile((error, result) => {
    fs.writeFileSync(`${config.dest}sprite.symbol.svg`, result.symbol.sprite.contents);
  });
});
*/
