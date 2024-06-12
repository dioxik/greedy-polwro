from flask import Flask, jsonify, request

def setup_routes(app: Flask):
    @app.route('/')
    def hello():
        return "Hello, World!"

    @app.route('/api/greedy-search', methods=['POST'])
    def perform_greedy_search():
        data = request.json
        # Tu umieść logikę przeszukiwania z algorytmem zachłannym
        return jsonify({"message": "Greedy search results"})
