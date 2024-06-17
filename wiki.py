import wikipediaapi
import wikipedia

def wiki_links_access(topic):
    wiki_wiki = wikipediaapi.Wikipedia('personal-wiki (sharatjacob2@gmail.com)', 'en')
    print(topic)
    page_py = wiki_wiki.page(topic)
    title = page_py.sections[0].title
    link_list = wikipedia.page(topic).html()
    print(title)
    link_list = link_list[link_list.find('<p>'):]
    link_list = link_list[0:link_list.find(title)]
    print(link_list)
    link_list = link_list.split('</a>')
    i = 0
    while i < len(link_list):
        if '#93' in link_list[i]:
            link_list.pop(i)
            continue
        link_list[i] = link_list[i][link_list[i].find('<a'):]
        link_list[i] = link_list[i][link_list[i].find('>') + 1:]
        i = i + 1
    print(link_list)
    return link_list

