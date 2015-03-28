GoKibitz: Move-by-move conversations about go games
===================================================

[GoKibitz](http://gokibitz.com) is a web app that lets users upload and review kifu (go game records in [sgf](http://www.red-bean.com/sgf/) format) and leave comments on individual moves.

I developed this app because I found it frustrating to try to comment on games other players would post for review: instructions like "on move 140, black should consider e14..." are frustrating to write and to read.

GoKibitz solves the per-move comment issue pretty well, but it doesn't yet solve the need to be able to suggest variations in an easy to read and understand way. Hopefully I can address that in the future.

License
=======
GoKibitz is currently free to all users, and its code is [open source](https://github.com/neagle/gokibitz/blob/master/LICENSE).

Future Monetization
===================

My plan is always to have GoKibitz be free to use, but it's possible (though by no means certain) that in the future there may be additional functionality or features that cost money to use (like a pro or plus membership). If you are a developer who would like to contribute, but are uncertain about the possibility that your code could some day be part of something that costs money, please ask me. All code contributed to this repo is and will remain open source.

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

Development Setup
=================

If you like GoKibitz enough to feel motivated to fix a bug or implement a new feature, I'd like to give you a virtual hug right now.

First, fork this repo on Github. Once you've got it cloned, Here's how to get set up:

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

#### 5. Run gulp to build your files:

```sh
(project directory)
$ gulp
```

#### 6. Start up a local node server and gulp watcher:

```sh
(project directory)
$ gulp watch
```

#### 7. Open your local GoKibitz at http://localhost:3434

(Port named after the traditional alternating komoku opening.)

#### 8. Create a new branch, and start working

```sh
$ git checkout -B my-bug
```

When you're done, just submit a pull request.

- - -

If you have any issues following these instructions, please let me know so that I can make the road smoother for others. Thanks!

Development Notes
-----------------

If you're fixing a bug, do me a solid and [create an issue](https://github.com/neagle/gokibitz/issues/new) and mention that you're working on it. That way I won't try to fix it while you're working.

If you're working on a feature, feel free to work on it and then unveil it to see what I think, but I'm also happy to give you feedback beforehand via an issue.

### Error: listen EADDRINUSE

If you're like me and you close your laptop without shutting down your `gulp watch` process, sometimes when you come back you'll close your gulp watch, but you'll still be able to access the site locally and if you try to start up `gulp watch` again, you'll get an `EADDRESSINUSE` error. (And you'll still get console output about requests.) Just type `killall node` on a Mac (Command for Windows?) to shut down the node process and you should be able to start `gulp watch` again. If anyone wants to let me know how to fix this, I'd be much obliged.
