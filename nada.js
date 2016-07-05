var later = require('later');




  var sched = later.parse.recur().on('20:00:00').time()
  .and()
  .on('03:00:00').time()
  .and()
  .on('12:00:00').time(),
 
  t = later.setInterval(test, sched),
      count = 4;

  function test() {
    console.log(new Date());
    console.log("ola k ase");
    count--;
    if(count <= 0) {
      t.clear();
    }
  }