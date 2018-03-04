from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from datetime import datetime
from time import mktime
import requests
import pymysql.cursors
import secrets as sec

# get unix timestamp and change from float to integer to string
# for sql insert later
unix_time = datetime.now()
unix_secs = str(int(mktime(unix_time.timetuple())))

# START Linux option of running selenium headless
chrome_options = Options()
chrome_options.add_argument("--headless")
print("Opening browser")
browser = webdriver.Chrome(chrome_options=chrome_options)
# END Linux option of running selenium headless

# START Windows option of running selenium
# path_to_chromedriver = 'C:/Users/Daniel/Documents/chromedriver.exe'
# print("Opening browser")
# browser = webdriver.Chrome(executable_path = path_to_chromedriver)
# END Windows option of running selenium

# set url to login page and tell browser to load it
url = 'https://customer.xfinity.com/#/'
print("Getting to login page")
browser.get(url)

# load login form inputs
# if they change the id for login page, this will break!
username = browser.find_element_by_id("user")
password = browser.find_element_by_id("passwd")

# tell selenium to send username and password
print("Sending login keys")
username.send_keys(sec.COMCAST_USER) # grab user/pass from secrets file
password.send_keys(sec.COMCAST_PASS)

# now click the submit button
print("Clicking submit")
browser.find_element_by_id("sign_in").click()

# get the cookies they set so we can make other requests
print("Getting cookies")
cookies = browser.get_cookies()

# use Requests to set and use the cookies from the browser
print("Setting cookies for request")
s = requests.Session()
for cookie in cookies:
    s.cookies.set(cookie['name'], cookie['value'])

# internal API used by the Comcast site to get JSON of usage
comc_usage = "https://customer.xfinity.com/apis/services/internet/usage"

# use Requests to do a GET on the API using the cookies we got from selenium
print("Get usage from API")
response = s.get(comc_usage)

# Requests has built-in JSON support, so get the response in JSON from API request
json_response = response.json()
print(json_response['usageMonths'])

# the JSON is ordered by month ascending, so we only need the last object in the JSON array
# make a for loop that iterates over the usageMonths in JSON response
for i, value in enumerate(json_response['usageMonths']):
    # the i will be the index so we can make sure only to get the last object
    # use -1 at the end since index is one less than length
    if i == len(json_response['usageMonths'])-1:
        # set the variables we'll use in MySQL later
        print(value['homeUsage'])
        homeUsage = value['homeUsage']
        print(value['startDate'])
        startDate = value['startDate']

# Connect to the database
connection = pymysql.connect(host='localhost',
                             user='root',
                             db='usage',
                             cursorclass=pymysql.cursors.DictCursor)

#PyMySQL to connect/insert records
try:
    with connection.cursor() as cursor:
        # Create a new record
        sql = "INSERT INTO `comcast` (`time_key`, `month`, `gb`) VALUES (%s, %s, %s)"
        # Execute the above SQL with the following arguments
        cursor.execute(sql, (unix_secs, startDate, homeUsage))
    # Must commit to save since the connection doesn't autocommit
    connection.commit()
finally:
    connection.close()

# Quit the browser used by selenium
browser.quit()
