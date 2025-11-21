from bs4 import BeautifulSoup
import requests
import os

response = requests.request("GET", "https://ygom.top/")
print(response.status_code)
if response.ok:
    response.encoding = 'utf-8'
    soup = BeautifulSoup(response.text, 'html.parser')
    elem = soup.select_one('#downloadButton')
    if elem:
        link = elem.get('href')
        if link:
            print(link)
            os.system(f"wget -O YGOMobile.apk {link} ")