test:
	# 0. make sure test user accout is set and correct
	# 1. dump original database: mysqldump ...
	# 2. create a empty testing database: mysql < test_db.sql
	jasmine-node . --junitreport
	# (3. restore database)

install:
	npm install -g frisby
	npm install -g jasmine-node
