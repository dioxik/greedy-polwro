from flask import Flask, jsonify, request
from backend.greedy_search import greedy_search

app = Flask(__name__)

@app.route('/api/greedy-search', methods=['POST'])
def perform_greedy_search():
    data = request.json
    result = greedy_search(data)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
