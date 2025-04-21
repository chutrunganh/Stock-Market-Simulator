# THIS IS THE UTILS FOLDER

This folder contains all the utility functions that helps the software.
In this case the first function is a python function, that use `Alpha Vantage` api to fetch the stock price data with the input is stock symbol, such as `AAPL`. This function will access to the database and insert directly to the `stockprices` table.

For more details, look up to [Apha Vantage](https://www.alphavantage.co/documentation/)

Work flow - usage of this function
```bash
cd app/backend/src/utils #move to this folder
pip install -r requirements.txt #install the needed library
#There will be some default methods can be use:
#Fetch data for Apple for the past 30 days (default range)
python stock_fetcher.py AAPL

#Fetch data for Google with custom date range
python stock_fetcher.py GOOGL --start 2023-01-01 --end 2023-12-31

#If the stock is already exist in the database:
python stock_fetcher.py AAPL --update-info
```
