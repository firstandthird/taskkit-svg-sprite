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

test('spits svg sprite files', async (t) => {
  t.plan(2);

  const file = `sprite.symbol-${new Date().getTime()}.svg`;
  const outpath = `${os.tmpdir()}/${file}`;
  const files = {};
  files[file] = {
    input: [
      'test/fixtures/one.svg',
      'test/fixtures/two.svg',
      'test/fixtures/three.svg',
      'test/fixtures/four.svg',
      'test/fixtures/five.svg',
      'test/fixtures/six.svg'
    ]
  };

  const task = new SVGSpriteTask('sprite', {
    dist: os.tmpdir(),
    disableSVGO: true,
    files
  }, {});

  await task.execute();
  t.equal(fs.existsSync(outpath), true, 'file exists');
  t.equal(fs.readFileSync(outpath, 'utf8'), fs.readFileSync('test/expected/output.svg', 'utf8'));
});
