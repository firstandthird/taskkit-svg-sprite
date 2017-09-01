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
  const files = {};
  files[file] = {
    input: ['test/fixtures/one.svg', 'test/fixtures/two.svg', 'test/fixtures/three.svg']
  };

  const task = new SVGSpriteTask('sprite', {
    dist: os.tmpdir(),
    files
  }, {});

  task.execute((err) => {
    t.equal(err, null, 'not erroring');
    t.equal(fs.existsSync(outpath), true, 'file exists');
    t.equal(fs.readFileSync(outpath, 'utf8'), fs.readFileSync('test/expected/output.svg', 'utf8'));
  });
});