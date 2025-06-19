import os
import json
import shutil
from git import Repo

# Load desired structure from config file (structure_config.json)
# Example format:
# {
#   "frontend": ["components", "pages", "storybook", "public"],
#   "backend": ["mcp", "auth", "payments", "storage", "monitoring", "scripts"],
#   "config": [".eslintrc.json", "tsconfig.json", "next.config.js", "tailwind.config.js"],
#   "docs": ["README.md", "CHANGELOG.md", "COMMIT_SUMMARY.md"],
#   "cursor-rules": [".cursorrules", ".cursor/"],
#   ".github": [".github/"]
# }

CONFIG_FILE = "structure_config.json"

def load_structure_config():
    with open(CONFIG_FILE, 'r') as f:
        return json.load(f)

def ensure_folder(path):
    if not os.path.exists(path):
        os.makedirs(path)

def move_item(src, dest_folder):
    dest_path = os.path.join(dest_folder, os.path.basename(src))
    ensure_folder(dest_folder)
    print(f"Moving {src} -> {dest_path}")
    shutil.move(src, dest_path)

def enforce_structure(repo_path):
    config = load_structure_config()
    repo = Repo(repo_path)
    root_items = os.listdir(repo_path)
    
    for item in root_items:
        src_path = os.path.join(repo_path, item)
        # Skip config file itself, .git, and Python script
        if item in [CONFIG_FILE, '.git', 'enforce_structure.py']:
            continue
        
        # Determine destination based on config
        moved = False
        for folder, patterns in config.items():
            for pattern in patterns:
                if item == pattern or item.startswith(pattern.rstrip('/')):
                    # Don't move if already in correct location
                    if folder == item:
                        moved = True
                        break
                    dest_folder = os.path.join(repo_path, folder)
                    move_item(src_path, dest_folder)
                    moved = True
                    break
            if moved:
                break

        # If not matched, keep in misc (but don't move misc into itself)
        if not moved and item != 'misc':
            dest_folder = os.path.join(repo_path, 'misc')
            move_item(src_path, dest_folder)

    # Stage, commit, and push changes
    repo.git.add(A=True)
    repo.index.commit("chore: enforce defined root structure")
    current_branch = repo.active_branch.name
    repo.remote(name="origin").push(current_branch)
    print("Structure enforcement complete and pushed to origin.")

if __name__ == "__main__":
    enforce_structure(os.getcwd()) 