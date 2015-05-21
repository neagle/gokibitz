# How to contribute

I love to work with other developers who want to contribute to GoKibitz. It's good for me to get input from others, it's great for the site to get features and fixes it wouldn't get otherwise, and it can be useful for other developers who want some experience with a MEAN (Mongo, Express, Angular, Node) stack application. We're still a relatively new project, but we're beginning to get standards and procedures in place to make it easy to contribute great code to the project.

## Getting Started

* Fork the repository on Github
* Clone the repo and follow the [instructions for setting up your development environment](README.md#development-setup). If you have any problems, please add an issue to the project or, if you solve them yourself, submit a pull request to update the documentation. It's always great to make the road smoother for the people who follow you.

## Making Changes

* Before you begin, make sure there's an issue for your task. If you're doing something new, create an issue. If you're tackling an issue in the pipeline, leave a comment on it to let us know you'd like to take it on.
* Create a topic branch for your new work
* Make commits of logical units
* Make sure your new changes conform to the project's code and style standards. `gulp watch` checks for both of these things, but you'll have an even easier time if you get plugins for your editor of choice that let it read the project's [`.jshintrc`](http://jshint.com/install/) and `.jscsrc` files. [Travis CI](https://travis-ci.org/neagle/gokibitz) will fail your pull request if you don't!

## Submitting Changes

* For bonus points, note the issue number in your commit message.
* Push your changes to a topic branch in your fork of the repository.
* Submit a pull request to [`neagle/gokibitz`](https://github.com/neagle/gokibitz/pulls).

## Staying Current

GoKibitz changes rapidly, so you'll need to stay current if you're working on something for any length of time.

* Follow [Github's instructions on syncing a fork](https://help.github.com/articles/syncing-a-fork/) to pull changes from the primary repository.
* When in doubt, `npm install` in the project's root directory. There's new stuff all the time.

## Additional Resources

* [Github pull request documentation](http://help.github.com/send-pull-requests/)
* [SGF File Format specification](http://www.red-bean.com/sgf/)
