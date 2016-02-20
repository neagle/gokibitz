Grabbing a copy of the remote DB
================================

With the IP address of the VPS I'm hosting this on, grabbing a copy of the current db is as simple as running this command from mongo shell:

`$ mongo`
`$ use admin`
`$ db.runCommand({ copydb: 1, fromhost: '66.228.39.90:27017', fromdb: 'gokibitz', todb: 'gokibitz' })`

This requires having an ssh key set up for auth, of course.
