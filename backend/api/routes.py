# backend/api/routes.py

from flask import Flask, jsonify, request

def setup_routes(app: Flask):
    @app.route('/')
    def hello():
        return "Hello, World!"

    @app.route('/api/greedy-search', methods=['POST'])
    def perform_greedy_search():
        data = request.json
        options = data.get('options', [])  # Opcje do przeszukania
        
        # Implementacja algorytmu przeszukiwania z zachłannością
        # Tutaj umieść logikę algorytmu
        
        # Zwracamy wyniki
        results = {}  # Tutaj będą wyniki przeszukiwania
        return jsonify(results)
