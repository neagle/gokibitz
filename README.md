GoKibitz: Move-by-move conversations about go games [![Build Status](https://travis-ci.org/neagle/gokibitz.svg?branch=master)](https://travis-ci.org/neagle/gokibitz)
===================================================

[GoKibitz](http://gokibitz.com) is a web app that lets users upload and review kifu (go game records in [sgf](http://www.red-bean.com/sgf/) format) and leave comments on individual moves.

I developed this app because I found it frustrating to try to comment on games other players would post for review: instructions like "on move 140, black should consider e14..." are frustrating to write and to read.

License
=======
GoKibitz is currently free to all users, and its code is [open source](https://github.com/neagle/gokibitz/blob/master/LICENSE).

Feature Requests
================
[Feature requests](https://github.com/neagle/gokibitz/issues) are welcome! Timely delivery is, of course, not guaranteed. But knowing what people would like to see is very helpful.

Bugs
====

I'm grateful for [any and all bug submissions](https://github.com/neagle/gokibitz/issues). GoKibitz is in alpha, and I expect a lot of them.

Please have patience with me, though: I'm a one-father development shop, which means most coding gets done during naps and after bedtime.

Support
=======

There are two ways you can support development of GoKibitz:

1. [Feedback](mailto:nate@nateeagle.com)! I wrote this to help go players. If you use GoKibitz and tell me so, it's great encouragement to keep plugging away at features and bugs.
2. [Pull Requests](https://github.com/neagle/gokibitz/pulls): it's asking a lot to ask other developers to dive into your code and contribute, but if anyone feels especially generous, I'd welcome collaboration.


Native Development Setup
=================

If you like GoKibitz enough to feel motivated to fix a bug or implement a new feature, I'd like to give you a virtual hug right now.

First, fork this repo on Github. Once you've got it cloned, there's two ways to get set up. If you have Docker available on your machine, skip ahead to [Docker Development Setup](#docker-development-setup) as it's a much simpler path to getting up and running. If you don't have Docker, or if you just prefer to work natively, continue to the instructions below.

Warning: I've only tested this on OS X and Ubuntu.

#### 1. Install [Node](http://nodejs.org/) and [MongoDB](http://www.mongodb.com/h/a)
#### 2. Install gulp globally:

```sh
$ npm install --global gulp
```

#### 3. Install the project's npm packages:

```sh
(project directory)
$ npm install
```

#### 4. Start up MongoDB:

```sh
$ mongod
```

**Note:** If you see the following error - "`ERROR: dbpath (/data/db) does not exist`," you need to create a directory path for Mongo. The following commands will help you setup the standard directory:

```sh
$ sudo mkdir -p /data/db/
$ sudo chown `id -u` /data/db
```

#### 5. Create your .env file (In your project directory)

```
MONGO_URI=mongodb://localhost
```

#### 6. Run gulp to build your files:

```sh
(project directory)
$ gulp default
```

#### 7. Start up a local node server and gulp watcher:

```sh
(project directory)
$ gulp watch
```

#### 8. Open your local GoKibitz at http://localhost:3434

(Port named after the traditional alternating komoku opening.)

#### 9. Create a new branch, and start working

```sh
$ git checkout -B my-bug
```

When you're done, just submit a pull request.

Docker Development Setup
=================

The easiest way to get up and running with a local copy of GoKibitz is to use the provided [Docker Compose](https://docs.docker.com/compose/) configuration. You will need at least Docker 18.06.0 or higher.

To bring up the site, just navigate to the source directory, and run:

```sh
$ docker-compose build
$ docker-compose run gokibitz npm install
$ docker-compose up
```

That's it! Just navigate to http://localhost:3434 to test it out. The source directory is mounted as a Docker volume so any source changes should be picked up automatically. On any subsequent runs, you only need to run the `docker-compose up` command.

- - -

If you have any issues following these instructions, please let me know so that I can make the road smoother for others. Thanks!

Development Notes
-----------------

If you're fixing a bug, do me a solid and [create an issue](https://github.com/neagle/gokibitz/issues/new) and mention that you're working on it. That way I won't try to fix it while you're working.

If you're working on a feature, feel free to work on it and then unveil it to see what I think, but I'm also happy to give you feedback beforehand via an issue.

### Error: listen EADDRINUSE

If you're like me and you close your laptop without shutting down your `gulp watch` process, sometimes when you come back you'll close your gulp watch, but you'll still be able to access the site locally and if you try to start up `gulp watch` again, you'll get an `EADDRESSINUSE` error. (And you'll still get console output about requests.) Just type `killall node` on a Mac (Command for Windows?) to shut down the node process and you should be able to start `gulp watch` again. If anyone wants to let me know how to fix this, I'd be much obliged.

### Running Tests

There are two kinds of tests in this project: acceptance tests (sometimes
called functional or end-to-end tests) and unit tests. Acceptance tests make
sure that the system is working as a whole and unit tests make sure that the
logic of individual functions is correct.

#### Acceptance tests:

Assuming you have already run `npm install` you should already have links to
the binaries you need in `./bin`.

First you will need to get the Selenium Webdriver driver for Chrome. This is a
one-time task.

```bash
./bin/webdriver-manager update
```

Then you will need to open the webdriver-manager in a separate terminal window,
terminal tab, tmux pane, etc.

```bash
./bin/webdriver-manager start
```

In your main terminal you can run the tests with:

```bash
./bin/protractor spec/acceptance/conf.js
```

Note: You do not need to be running a development server, but you do need to
have MongoDB running. The acceptance test starts up its own test app server
that needs to connect to Mongo.

If all goes well you should see a Chrome window open briefly and you should see
information about passing (and failing) tests in your terminal.

For examples of how to write acceptance tests look in the
[spec/acceptance](spec/acceptance) folder. You can also look at the
documentation for [Protractor](http://angular.github.io/protractor/#/) and
[Chai](http://chaijs.com/) for information about the syntax.

#### Unit tests

These haven't been implemented yet.

### Tmuxinator

If you use [Tmuxinator](https://github.com/tmuxinator/tmuxinator) this
[workspace file](misc/gokibitz.yml) might be helpful.
