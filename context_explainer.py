import os
from langchain import HuggingFaceHub
import re

os.environ["HUGGINGFACEHUB_API_TOKEN"] = "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"

# setting the llm as mistral
repo_id = "mistralai/Mistral-7B-Instruct-v0.2"
llm = HuggingFaceHub(repo_id=repo_id, model_kwargs={"temperature":0.9, "max_length": 1024})

# function that is called by the three llm agents to create the prompt
def prompt_writer(sys_msg, token_count):
  # user_message = f"Q: {user_input} A: "
  prompt = f"<s>[INST] {sys_msg} Answer:"
  print("prompter working")

  # Run the model
  temp = llm(
  prompt, # Prompt
  max_tokens=token_count, # Generate upto
  stop=["</s>"],
  echo=False # Echo prompt
  ) # 
  print("prompter generated")

  temp = temp[temp.find("Answer:")+7:]
  print(temp)
  return temp


# llm that generates the first explanation
def explainer(topic):
  print("explainer working")
  system_message = '''You are a proficient scientist, known for your adept teaching skills. 
  You are skilled at taking a topic and answering with a large detailed explanation. 
  Avoid bullet points. [/INST] 
  Topic:'''
  explanation = prompt_writer(system_message + topic, 1500)
  return explanation


# llm that identifies all the relevant terms in the explanation
def tagger(explanation):
  print("tagger working")
  system_message = '''You identify ALL the TECHNICAL/MATHEMATICAL/SCIENTIFIC terms in a paragraph. You print ONLY the TEN most technical terms in a numerical list. The following are instructions to follow. Print the terms EXACTLY as referred to in the paragraph. Avoid brackets. Choose wisely. Restrict yourself to ONLY a single term per item on the list. Limit the terms to one or two words, if possible. Avoid completion of the paragraph. Only do the task assigned to you. Generate nothing other than the list. Do not list terms that belong to analogies used in the paragraph. Do not explain any term. Avoid generating terms that aren't in the paragraph. Avoid commas. [/INST] Paragraph:'''
  tags = prompt_writer(system_message + explanation, 256)
  return tags

# llm that explains the new topic in context of the old topic
def in_context_explainer(context_topic, topic):
  print("in_context_explainer working")
  system_message = f'''You are uniquely skilled at explaining one topic in the context of another topic. You answer with a good explanation of the topic and why it matters to the other topic. [/INST] 
  Explain {context_topic} in the context of {topic}. '''
  context_explanation = prompt_writer(system_message, 1500)
  tags = tagger(context_explanation)
  tags = tag_handler(tags)

  print(tags)
  return context_explanation, tags

# function that tries to preserve the case of the tags when reformatting the explanation
def update_case_based_on_string(main_string, substrings):
    updated_substrings = []

    for substring in substrings:
        # Create a case-insensitive search pattern
        pattern = re.compile(re.escape(substring), re.IGNORECASE)
        match = pattern.search(main_string)

        if match:
            # Find the matched substring in the original string
            matched_substring = match.group()
            # Update the case of the substring in the list to match the original string
            updated_substrings.append(matched_substring)
        else:
            # If the substring is not found, keep it as is
            updated_substrings.append(substring)

    return updated_substrings

# function that combines the explainer and tagger llms to generate the modified explanation
def main_explainer(topic):
  explanation = explainer(topic)
  tags = tagger(explanation)
  tags = tag_handler(tags)
  tags = update_case_based_on_string(explanation,tags)
  return explanation, tags

# bunch of wild hard-coded data processing style stuff because the llm will not listen to me
def tag_handler(unhandled_tags):
  tags = unhandled_tags
  tags = re.split('\d.',tags)
  tags.pop(0)
  tags_length = len(tags) - 1
  print(tags)

  for i in range(tags_length):
    if '\n' in tags[i]:
      tags[i] = tags[i][0:tags[i].find('\n')]
    if ':' in tags[i]:
      tags[i] = tags[i][0:tags[i].find(':')]  
    if ',' in tags[i]:
      tags[i] = tags[i][0:tags[i].find(',')]
    if len(tags[i]) >=2:      
      if tags[i][0] == " " and  tags[i][-1] == " ":   
        tags[i] = tags[i][1:-1]
    if '(' in tags[i]:
      tags[i] = tags[i][0:tags[i].find('(')]
    if tags[i] == "":
      tags.pop(i)
      tags_length = tags_length - 1

  while len(tags) > 10:
    tags.pop()

  print(tags)
  return tags


