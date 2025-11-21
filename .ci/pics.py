from bs4 import BeautifulSoup
import requests
import os

response = requests.request("GET", "https://ygom.top/")
if response.ok:
    response.encoding = 'utf-8'
    soup = BeautifulSoup(response.text, 'html.parser')
    elem = soup.select_one('#downloadButton')
    if elem and elem.get('href'):
        os.system(f"wget -O YGOMobile.apk {elem.get('href')} ")