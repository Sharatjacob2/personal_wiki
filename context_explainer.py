from huggingface_hub import InferenceClient
import re
import os
import wikipediaapi
import wikipedia
from wiki import get_wikipedia_intro_links

token = os.environ['HUGGINGFACEHUB_API_TOKEN']

# setting the llm as mistral
repo_id = "mistralai/Mistral-7B-Instruct-v0.2"
llm = InferenceClient(model=repo_id,token=token)

# function that is called by the three llm agents to create the prompt
def prompt_writer(sys_msg, token_count):
  # user_message = f"Q: {user_input} A: "
  prompt = f"<s>[INST] {sys_msg} Answer:"
  print("prompter working")

  # Run the model
  temp = llm.text_generation(
  prompt=prompt, # Prompt
  max_new_tokens=token_count, # Generate upto
  stop_sequences=["</s>"],
  ) # 
  print("prompter generated")

  temp = temp[temp.find("Answer:")+2:]
  temp = r"%r" % temp
  temp = temp[1:-1]
  temp = temp.replace(r"\n","<br>")
  temp = temp.replace(r"\'","")
  print(temp)
  return temp


# llm that generates the first explanation
def explainer(topic):
  print("explainer working")
  system_message = '''You are a proficient scientist, known for your adept teaching skills. 
  You are skilled at taking a topic and answering with a large detailed explanation. 
  Avoid bullet points. [/INST] 
  Topic:'''
  explanation = prompt_writer(system_message + topic, 1024)
  return explanation


# llm that identifies all the relevant terms in the explanation
def tagger(explanation):
  print("tagger working")
  system_message = '''You identify ALL the terms in a paragraph that could benefit explanation/expansion. 
  You are encouraged to list NAMES in the paragraph.
  You print the terms ONLY as a NUMBERED list. 
  The following are instructions to follow. 
  Print the terms EXACTLY as referred to in the paragraph. 
  Avoid brackets. Choose wisely. 
  Restrict yourself to ONLY a single term per item on the list. 
  Limit the terms to one or two words, if possible. 
  Avoid completion of the paragraph. 
  Only do the task assigned to you. 
  Generate nothing other than the list. Avoid HTML tags.
  Do not list terms that belong to analogies used in the paragraph. 
  Do not explain any term. Avoid generating terms that aren't in the paragraph. Avoid commas. [/INST] 
  Paragraph:'''
  tags = prompt_writer(system_message + explanation, 512)
  return tags

# llm that explains the new topic in context of the old topic
def in_context_explainer(context_topic, topic):
  print("in_context_explainer working")
  system_message = f'''You are uniquely skilled at explaining one topic in the context of another topic. You answer with a good explanation of the topic and why it matters to the other topic. [/INST] 
  Explain {context_topic} in the context of {topic}. '''
  context_explanation = prompt_writer(system_message, 512)
  tags = tagger(context_explanation)
  tags = tag_handler(tags, context_topic)
  return context_explanation, tags

# function that combines the explainer and tagger llms to generate the modified explanation
def main_explainer(topic):
  tags = []
  if topic == '':
    return 'Please enter topic.', tags

  explanation = explainer(topic)
  tags = tagger(explanation)
  tags = tag_handler(tags, topic)
  return explanation, tags

# bunch of wild hard-coded data processing style stuff because the llm will not listen to me
def tag_handler(unhandled_tags, topic_check):
  format_check = f'<button class="tag" data-maintopicvalue="{topic_check}"></button>'
  print(format_check)
  tags = unhandled_tags
  tags = re.split('\d.',tags)
  tags.pop(0)
  # tags_length = len(tags)
  i = 0
  print(tags)

  while i < len(tags):
    print(i)
    if len(tags[i]) <= 3:
      tags.pop(i)
      continue
    if tags[i] == '\n' or tags[i] == '':
      tags.pop(i)
      continue 
    if '<br>' in tags[i]:
      tags[i] = tags[i][0:tags[i].find('<br>')]
      if len(tags[i]) <= 3:
        tags.pop(i)
        continue

    if ':' in tags[i]:
      tags[i] = tags[i][0:tags[i].find(':')]
      if len(tags[i]) <= 3:
        tags.pop(i)
        continue

    if ',' in tags[i]:
      tags[i] = tags[i][0:tags[i].find(',')]
      if len(tags[i]) <= 3:
        tags.pop(i)
        continue

    if '(' in tags[i]:
      tags[i] = tags[i][0:tags[i].find('(')]
      if len(tags[i]) <= 3:
        tags.pop(i)
        continue

    if len(tags[i]) >= 2:
      if tags[i][0] == " " and  tags[i][-1] == " ":  
        tags[i] = tags[i][1:-1]
      if tags[i][0] == "." and tags[i][1] == " ":
        tags[i] = tags[i][2:]
      if tags[i][0] == " ":  
        tags[i] = tags[i][1:]

    if tags[i] == '\n' or tags[i] == '':
      tags.pop(i)
      continue
    if tags[i].lower() in topic_check.lower():
      tags.pop(i)
      continue
    if tags[i] in format_check:
      tags.pop(i)
      continue
    if 'Data' in tags[i]:
      tags.pop(i)
      continue
    print(tags[i])
    i = i+1

  while i < len(tags):
      if tags[i] in format_check:
        tags.pop(i)
        continue

  print(tags)
  return tags


def wiki_assist(temp_topic):
  context = ' '
  tags = []
  topic = []
  if temp_topic == '':
    return 'Please enter topic.', tags, context, topic 
  wiki_wiki = wikipediaapi.Wikipedia('personal-wiki (sharatjacob2@gmail.com)', 'en')
  topic = wikipedia.search(temp_topic)     
  if len(topic) < 1:
    return "Unrecognizable term has been entered, please rephrase or search different topic.", tags, context, topic
  page_py = wiki_wiki.page(topic[0])
  print(topic)

  sys_msg = '''<s> [INST] You take in the Wikipedia summary page of a specific topic and you give a large detailed explanation, but in the style of a reasonably educated layman. 
  Speak formally. Add details from the summary provided. Avoid addressing the individual you are explaining. [/INST] 
  Topic:'''

  user_topic = topic[0]
  wikipedia_context = "Wikipedia Summary of Topic: " + context
  sys_msg = sys_msg + user_topic + wikipedia_context

  prompt = f"{sys_msg} [/INST]"
  explanation = llm.text_generation(prompt, stop_sequences=["</s>"],max_new_tokens=1024)
  tags = get_wikipedia_intro_links(topic[0])
  print(tags)

  format_check = f'<button class="tag" data-maintopicvalue="{temp_topic.upper()}"></button>'
  print(format_check)
  i = 0
  while i < len(tags):
      print(i)
      print(tags[i])
      if tags[i].upper() in format_check:
        print(i)
        tags.pop(i)
        continue
      i = i + 1

  temp = r"%r" % explanation
  temp = temp[1:-1]
  temp = temp.replace(r"\n","<br>")
  temp = temp.replace(r"\'","")
  print(temp)

  if len(topic) < 10:
    topic = topic[1:9]

  return temp, tags, context, topic

def wiki_context_assist(context_topic, topic):
    
    wiki_wiki = wikipediaapi.Wikipedia('personal-wiki (sharatjacob2@gmail.com)', 'en')
    true_topic = context_topic
    context_topics = wikipedia.search(context_topic)
    tags = []
    if len(context_topics) < 1:
      return "Unrecognizable term has been entered, please rephrase or search different topic.", tags
    context_topic = context_topics[0]
    context_page = wiki_wiki.page(context_topic)

    topics = wikipedia.search(topic)
    topic = topics[0]
    main_page = wiki_wiki.page(topic)

    summary_of_context = context_page.summary
    summary_of_main = main_page.summary

    system_message = f'''You are uniquely skilled at explaining one topic in the context of another topic. 
    You answer with a good explanation of the topic and why it matters to the other topic. 
    You are given the wikipedia summaries of both the context topic and the main topic as well.[/INST] 
    Wikipedia summary of main topic: {summary_of_main}
    Wikipedia summary of context topic: {summary_of_context}
    Explain {context_topic} in the context of {topic}. Use multiple paragraphs.''' 
    prompt = f"{system_message} [/INST]"
    context_explanation = llm.text_generation(prompt, stop_sequences=["</s>"],max_new_tokens=1024)
    tags = tagger(context_explanation)
    tags = tag_handler(tags, true_topic)

    temp = r"%r" % context_explanation
    temp = temp[1:-1]
    temp = temp.replace(r"\n","<br>")
    temp = temp.replace(r"\'","")
    print(temp)

    return temp, tags
