import requests
from bs4 import BeautifulSoup

def get_wikipedia_intro_links(page_title):
    # Define the API endpoint and parameters
    url = "https://en.wikipedia.org/w/api.php"
    params = {
        "action": "parse",
        "page": page_title,
        "prop": "text",
        "section": 0,
        "format": "json"
    }
    
    # Make the request to the Wikipedia API
    response = requests.get(url, params=params)
    data = response.json()
    
    # Extract the HTML content of the introduction
    html_content = data.get('parse', {}).get('text', {}).get('*', '')
    
    # Parse the HTML to find links
    soup = BeautifulSoup(html_content, 'html.parser')
    links = soup.find_all('a')
    link_titles = [link.get('title') for link in links if link.get('title')]
    return link_titles

# Example usage
# page_title = "Python (programming language)"
# links = get_wikipedia_intro_links(page_title)
# print((links))
