from flask import Flask, render_template, request, jsonify
from context_explainer import main_explainer, in_context_explainer

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/llm_output', methods=['POST'])
def llm_output():
    data = request.json
    prompt = data.get("input")
    output_explanation, output_tags  =  main_explainer(prompt)
    return jsonify({"explanation": output_explanation, "tags": output_tags})

@app.route('/llm_context_output', methods=['POST'])
def llm_context_output():
    data = request.json
    topic = data.get("topic")
    context = data.get("context")
    output_explanation, output_tags  =  in_context_explainer(context, topic)
    return jsonify({"explanation": output_explanation, "tags": output_tags})

if __name__ == '__main__':
    app.run(port=5000, debug=True)

