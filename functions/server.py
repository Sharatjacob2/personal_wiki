import json
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return jsonify(message="Hello, Flask on Netlify Functions!")

# Handler for Netlify Function
def handler(event, context):
    from flask import request, jsonify
    from werkzeug.datastructures import Headers
    from werkzeug.wrappers import Response

    # Create a Flask test client
    with app.test_client() as client:
        # Create a Flask test request
        headers = Headers()
        for key, value in event['headers'].items():
            headers.add(key, value)
        
        response = client.open(
            method=event['httpMethod'],
            path=event['path'],
            query_string=event['queryStringParameters'],
            headers=headers,
            data=event['body'],
        )
        
        # Create a response to return to Netlify
        return {
            'statusCode': response.status_code,
            'headers': dict(response.headers),
            'body': response.get_data(as_text=True),
        }

if __name__ == "__main__":
    app.run(debug=True)
