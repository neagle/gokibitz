GoKibitz: Move-by-move conversations about go games
===================================================

GoKibitz is a web app that lets users upload and review kifu (go game records in [sgf](http://www.red-bean.com/sgf/) format) and leave comments on individual moves.

I developed this app because I found it frustrating to try to comment on games other players would post for review: instructions like "on move 140, black should consider e14..." are frustrating to write and to read.

GoKibitz solves the per-move comment issue pretty well, but it doesn't yet solve the need to be able to suggest variations in an easy to read and understand way. Hopefully I can address that in the future.

License
=======
GoKibitz is free to all users, and its code is [open source](blob/master/LICENSE).

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

### 3. Initialize git submodules:

```sh
(project directory)
$ git submodule update --init --recursive
```

#### 4. Install the project's npm packages:

```sh
(project directory)
$ npm install
```

#### 5. Start up MongoDB:

```sh
$ mongod
```

### 6. Run gulp to build your files:

```sh
(project directory)
$ gulp
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

- - -

If you have any issues following these instructions, please let me know so that I can make the road smoother for others. Thanks!

Development Notes
-----------------

If you're fixing a bug, do me a solid and [create an issue](https://github.com/neagle/gokibitz/issues/new) and assign it to yourself. That way I won't try to fix it while you're working.

If you're working on a feature, feel free to work on it and then unveil it to see what I think, but I'm also happy to give you feedback beforehand via an issue.
