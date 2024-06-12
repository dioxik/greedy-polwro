from flask import request, jsonify

def setup_routes(app):
    @app.route('/')
    def hello():
        return "Hello, World!"

    @app.route('/api/greedy-search', methods=['POST'])
    def perform_greedy_search():
        data = request.json
        result = greedy_search(data)
        return jsonify(result)
