from flask import Flask, render_template, request, jsonify, send_from_directory
from context_explainer import main_explainer, in_context_explainer, wiki_assist

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/llm_output', methods=['POST'])
def llm_output():
    data = request.json
    prompt = data.get("input")
    wiki_toggle = data.get("wikiToggle")
    if (wiki_toggle == False):
        output_explanation, output_tags, output_context, output_wiki_links  =  wiki_assist(prompt)
        return jsonify({"explanation": output_explanation, "tags": output_tags, "context": output_context, "links": output_wiki_links})
    else:    
        output_explanation, output_tags  =  main_explainer(prompt)
        return jsonify({"explanation": output_explanation, "tags": output_tags})

@app.route('/llm_context_output', methods=['POST'])
def llm_context_output():
    data = request.json
    topic = data.get("topic")
    context = data.get("context")
    output_explanation, output_tags  =  in_context_explainer(context, topic)
    return jsonify({"explanation": output_explanation, "tags": output_tags})

# if __name__ == '__main__':
#     app.run(port=5000, debug=True)

