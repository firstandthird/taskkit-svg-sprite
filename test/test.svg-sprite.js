const test = require('tape');
const SVGSpriteTask = require('../');
const TaskKitTask = require('taskkit-task');
const fs = require('fs');
const os = require('os');

test('instance of', assert => {
  const nt = new SVGSpriteTask();

  assert.equal(nt instanceof TaskKitTask, true, 'instance of TaskKitTask');
  assert.end();
});

test('spits svg sprite files', (t) => {
  t.plan(3);

  const file = `sprite.symbol-${new Date().getTime()}.svg`;
  const outpath = `${os.tmpdir()}/${file}`;

  const task = new SVGSpriteTask('sprite', {
    files: {
      [outpath]: 'test/fixtures/*.svg'
    }
  });

  task.execute((err) => {
    t.equal(err, null, 'not erroring');
    t.equal(fs.existsSync(outpath), true, 'file exists');
    t.equal(fs.readFileSync(outpath, 'utf8'), fs.readFileSync('test/expected/output.svg', 'utf8'));
  });
});