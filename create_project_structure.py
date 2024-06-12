import os

def create_project_structure():
    base_dir = './'
    directories = [
        'backend',
        'frontend',
        'api'
    ]
    backend_files = [
        'backend/__init__.py',
        'backend/greedy_search.py',
        'backend/data.py'
    ]
    frontend_files = [
        'frontend/index.html',
        'frontend/styles.css',
        'frontend/script.js'
    ]
    api_files = [
        'api/__init__.py',
        'api/routes.py',
        'api/models.py'
    ]

    # Create base directory
    if not os.path.exists(base_dir):
        os.makedirs(base_dir)

    # Create directories
    for directory in directories:
        dir_path = os.path.join(base_dir, directory)
        if not os.path.exists(dir_path):
            os.makedirs(dir_path)

    # Create backend files
    for file in backend_files:
        file_path = os.path.join(base_dir, file)
        with open(file_path, 'w') as f:
            f.write('')

    # Create frontend files
    for file in frontend_files:
        file_path = os.path.join(base_dir, file)
        with open(file_path, 'w') as f:
            f.write('')

    # Create API files
    for file in api_files:
        file_path = os.path.join(base_dir, file)
        with open(file_path, 'w') as f:
            f.write('')

    print(f"Project structure created in {base_dir}")

if __name__ == "__main__":
    create_project_structure()