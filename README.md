farm.bithound.io
----------------

Welcome to the farm.

This is a simple "framework" that we use at bitHound for working in a distributed environment.

It wasn't really built for anyone but us to use, but we thought it would be something nice to
share.

Example:
-------

You can clone this repo, npm install and then just run:

```
> node example/hello.js
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
  // (for now, it sucks but it was easier to code this way)
  farm.join('localhost', {worker: true});

```
