install:
	curl -sS https://getcomposer.org/installer | php
	php composer.phar install

run:
	foreman start -f Procfile.dev

db_init:
	mysql -u root -p < test_environment.sql
	mysql pairs_test -u root -p < db.schema.sql
