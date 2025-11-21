from bs4 import BeautifulSoup
import requests
import os

response = requests.request("GET", "https://api.jwyxym.top/web/ygom")
if response.ok:
    response.encoding = 'utf-8'
    soup = BeautifulSoup(response.text, 'html.parser')
    elem = soup.select_one('#downloadButton')
    if elem:
        link = elem.get('href')
        if link:
            os.system(f'wget --header="Referer: https://ygom.top/" --header="User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36" -O YGOMobile.apk {link}')