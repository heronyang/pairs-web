pairs-web
=========

Website (Client) for PAIRS

Applying Bootstrap Theme from http://www.bootstrapzero.com/bootstrap-template/bolt

# Test (Local)
* Make sure local server is on (ex. http://localhost:5000/)
    > cd pairs-api/
    > make run

* Run this client web
    > make run
* Setup Test URL, open browser console and type:
    > localStorage['base'] = "http://localhost:5000/"

* Open **index.html** in browser

# Test (Deployed Server)
* Run this client web
    > make run
* Setup Deployed Server URL, open browser console and type:
    > locaStorage['base'] = "http://api.pairs.cc/"
* Open **index.html** in browser

# Directory Structure
* **README.md**
* **assets**
* **assets/css**: CSS Files
* **assets/fonts**: Fonts for Bootstrap
* **assets/img**: Image Static Files
* **assets/js**: JS code
* **index.html**: index page
* **pairs-controller.js**: PAIRS's Controller (MVC)
* **pairs-view.css**: PAIRS's View (MVC)

# Resources

* Bootstrap 3.2: http://getbootstrap.com/
* Loading GIF: http://ajaxload.info/
