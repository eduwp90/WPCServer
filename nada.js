var later = require('later');

  var sched = later.parse.recur().every(1).minute(),
      t = later.setInterval(test, sched),
      count = 5;

  function test() {
    console.log(new Date());
    count--;
    if(count <= 0) {
      t.clear();
    }
  }