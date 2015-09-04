[![bitHound Score](https://www.bithound.io/bithound/farm.bithound.io/badges/score.svg)](https://www.bithound.io/bithound/farm.bithound.io)

farm.bithound.io
----------------

Welcome to the farm.

This is a simple "framework" that we use at bitHound for working in a distributed environment.

Example:
-------

You can clone this repo, npm install and then just run:

```
> node examples/hello.js
hello world !!!
>
```
amazing isn't it

How to use
----------

The idea is that you would start up a 'broker' which allows all of your worker processes
to communicate with each other.

Example:

```
  //when your process starts:
  var broker = require('farm/lib/broker').start();


  //when your process exits:
  broker.stop();
```

Once you have your broker running you can have your other processes join the farm and
schedule work to be done.

```
  var farm = require('farm');
  farm.join('localhost');
  farm.jobs.send('show me the money', function (err, money) { });
```

Mind you not much will happen unless you have some processes out there that are set up to be workers:

```

  var farm = require('farm');

  farm.worker(function (task, callback) {
    //do something cool with the task

    //just because you are a worker, doesn't mean you can't start your own jobs
    farm.jobs.send('other task', function (err, result) {
      // you can get errors back, and pass errors along
      if (err) { return callback(err); }

      callback(null, "result");
    });
  
  });
  
  //just make sure you say you are a worker when you join
  farm.join('localhost', {worker: true});

```
