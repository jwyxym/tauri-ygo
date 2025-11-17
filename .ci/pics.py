from bs4 import BeautifulSoup
import requests
import os


headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
}
response = requests.request("GET", "https://ygom.top/", headers=headers)
print(response.status_code)
print(response.text)
if response.ok:
    response.encoding = 'utf-8'
    soup = BeautifulSoup(response.text, 'html.parser')
    elem = soup.select_one('#downloadButton')
    if elem:
        link = elem.get('href')
        if link:
            print(link)
            os.system(f"wget -O YGOMobile.apk {link} ")