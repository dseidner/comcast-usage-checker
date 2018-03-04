# comcast-usage-checker

Comcast does not provide an API for programmatic checking of data usage. Comcast-usage-checker records hourly numbers of the Comcast data meter to MySQL server and displays usage with graphs + tables in a Bootstrap 3/AngularJS 1 web app.

## Installation

### Requirements
* Linux (for automation) OR Windows (if you want to test locally)
* Python 3.4 and up
* PHP and PHP-mysqlnd
* Selenium, PyMYSQL, Requests

`$ pip install selenium PyMySQL requests`

## Usage

1. Create a MySQL dabatabase named usage and then create a table named comcast

```sql
CREATE TABLE IF NOT EXISTS `comcast` (
  `id` int(8) NOT NULL AUTO_INCREMENT,
  `time_key` int(11) NOT NULL,
  `month` varchar(12) NOT NULL,
  `gb` float NOT NULL,
  `created_ts` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for table `comcast`
--
ALTER TABLE `comcast`
  ADD PRIMARY KEY (`id`);
```

2. Create a MySQL user with select/insert rights to the `comcast` table and use the credentials to fill in `app/dbconnect-example.php` and then rename file to `app/dbconnect.php`
3. Put `comc.py` and `secrets-example.py` in your server (not HTML directory) and fill in the secrets file with your Comcast credentials. Rename the file to `secrets.py`
4. Ensure Python 3.4 or higher is installed along with the required modules (selenium, PyMySQL, requests) 
5. Setup a crontab in Linux to execute the script every hour

```
0 * * * * python3.4 /home/youruser/comc.py
```
6. Setup the web app contents in the your HTML directory.

## Limitations

1. The Python script works for now, but any changes Comcast makes to their own web app (such as renaming the IDs of the username/password input boxes) could result in failure. 
2. This only captures the current month's latest count. Comcast could be late in rolling up their data count so the last month's captures might not reflect your final usage.
3. This app should in no way replace your regular checking of the official Comcast meter. I take no responsibility if you expect this to help prevent overages. Always refer back to the official Comcast meter if you are concerned about overages.

## License
[MIT](https://choosealicense.com/licenses/mit/)