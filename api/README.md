PAIRS API
===========

PAIRS API is a RESTful API backend built with PHP with Slim Framework for PAIRS.cc service

# Requirement
* PHP 5.5
* MySQL 5.6

# Getting Started (Local Environment)

## Install PHP + MySQL
Make sure you install PHP and MySQL successfully on your device.
The installation method depends on your OS.

## Install Dependencies
    > make install

## Initial Test Database
    > make db_init

## Run Local Server
    > make run
      foreman start -f Procfile.dev
      13:55:36 web.1  | started with pid 21011

## Old Way

**Composer** is used as the dependency manager for PHP in this project, to install **Composer**, you may run the following command in Terminal.

	# Download and install Composer to current directory
	curl -sS https://getcomposer.org/installer | php
	# Move Composer for global access
	sudo mv composer.phar /usr/local/bin/composer

Notice: **Composer** support is a built in feature of Heroku, the instructions above is only required when running this application locally or on servers other than Heroku.

To install required libraries (such as Slim Framework and Facebook PHP SDK) automatically, you may use the following command.

	composer install

To set up database schema, you may restore the **db.schema.sql** file into a new MySQL database.

API credentials are loaded using environmental variables, it is named **CLEARDB_DATABASE_URL** and is consisted of a URL string like **mysql://user:pass@host/dbname**.

After all of above are performed, you may access the API service.

# Tests

## Install Dependencies
    > cd test/unit_test/
    > sudo make install
    > cd ../stress_test/
    > sudo make install

## Unit Test
    > cd test/unit_test/
    > make test

## Stress Test
    > cd test/stress_test/
    > make test

## Old Way
Tests of API is performed by Codeception, a modern PHP test tool. The **api.suite.yml** file located in **tests** directory is the configuration file of API tests, the **url:** parameter is used to determine where the test should be performed on. Files with a suffix of **Cept.php** located in **tests/api** are the scripts of testing.

To perform the test, just run the following command in Terminal.

	vendor/bin/codecept run

To create a new test, take **List Pairs** for example, just run the following command in Terminal.

	vendor/bin/codecept generate:cept api ListPairs

And a file named **test/api/ListPairsCept.php** will be created, you may edit the file to specify the request and expected response.

# Directory Structure

**codeception.yml** is the configuration file of Codeception, which is used for API tests.

**composer.json** is a file in JSON format which includes a list of packages required for this application

**composer.lock** is used to record which version of packages were used, preventing the potential risk that newer version of packages might cause compatibility issue.

**config.example.php** is a example of **config.php** which stores configuration parameters such as database credentials.

**db.schema.sql** is the schema of MySQL database used in this application.

**tests** is where the API tests located in.

**vendor** is where libraries downloaded by **Composer** located in, this directory is set to be ignored by the version control system.

**.htaccess** is used to make URL clean while using Apache as web server, refer to documentation of Slim Framework for clean URL settings under other web server such as Nginx.
