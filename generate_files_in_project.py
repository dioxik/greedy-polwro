import os

def generate_frontend_structure():
    # Tworzenie katalogów
    os.makedirs("frontend/public", exist_ok=True)
    os.makedirs("frontend/src", exist_ok=True)

    # # Tworzenie plików
    # with open("frontend/public/index.html", "w") as f:
    #     f.write("<!DOCTYPE html>\n<html lang='en'>\n<head>\n  <meta charset='UTF-8'>\n  <title>Document</title>\n</head>\n<body>\n  <div id='root'></div>\n</body>\n</html>")

    # with open("frontend/public/styles.css", "w") as f:
    #     f.write("/* Put your styles here */")

    # with open("frontend/src/App.js", "w") as f:
    #     f.write("import React from 'react';\n\nfunction App() {\n  return (\n    <div>\n      <h1>Hello, World!</h1>\n    </div>\n  );\n}\n\nexport default App;")

    # with open("frontend/src/index.js", "w") as f:
    #     f.write("import React from 'react';\nimport ReactDOM from 'react-dom';\nimport App from './App';\nimport './index.css';\n\nReactDOM.render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n  document.getElementById('root')\n);")

    # with open("frontend/Dockerfile", "w") as f:
    #     f.write("FROM node:alpine\n\nWORKDIR /app\n\nCOPY . .\n\nRUN npm install\n\nEXPOSE 3000\n\nCMD ['npm', 'start']")
    with open("frontend/package.json", "w") as f:
        f.write('{\n  "name": "my-react-app",\n  "version": "1.0.0",\n  "private": true,\n  "scripts": {\n    "start": "react-scripts start",\n    "build": "react-scripts build",\n    "test": "react-scripts test",\n    "eject": "react-scripts eject"\n  },\n  "dependencies": {\n    "react": "^17.0.2",\n    "react-dom": "^17.0.2",\n    "react-scripts": "4.0.3"\n  }\n}')

# Wywołanie funkcji
generate_frontend_structure()
