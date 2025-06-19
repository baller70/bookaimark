#!/usr/bin/env python3
"""
branch_maker.py

Watches a directory for newly created component files.
For each new component file, automatically creates a Git branch
and commits the file to that branch.
"""

import os
import sys
import time
import logging
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from git import Repo, InvalidGitRepositoryError
from github import Github
import argparse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('branch_maker.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class ComponentFileHandler(FileSystemEventHandler):
    """Handler for file system events focused on component files."""
    
    def __init__(self, repo_path, github_token=None):
        self.repo_path = Path(repo_path)
        self.github_token = github_token
        self.repo = None
        self.github = None
        
        # Initialize Git repository
        try:
            self.repo = Repo(repo_path)
            logger.info(f"Initialized Git repository at {repo_path}")
        except InvalidGitRepositoryError:
            logger.error(f"Invalid Git repository at {repo_path}")
            sys.exit(1)
        
        # Initialize GitHub client if token provided
        if github_token:
            try:
                self.github = Github(github_token)
                logger.info("GitHub client initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize GitHub client: {e}")
    
    def is_component_file(self, file_path):
        """Check if the file is a component file."""
        path = Path(file_path)
        
        # Check for common component file patterns
        component_patterns = [
            '.tsx', '.jsx', '.vue', '.svelte'
        ]
        
        component_directories = [
            'components', 'src/components', 'frontend/src/components',
            'pages', 'src/pages', 'frontend/src/pages'
        ]
        
        # Check file extension
        if not any(path.suffix == pattern for pattern in component_patterns):
            return False
        
        # Check if file is in a component directory
        path_str = str(path)
        if not any(comp_dir in path_str for comp_dir in component_directories):
            return False
        
        return True
    
    def create_branch_name(self, file_path):
        """Generate a branch name based on the component file."""
        path = Path(file_path)
        
        # Extract component name from filename
        component_name = path.stem.lower()
        
        # Remove common suffixes
        suffixes_to_remove = ['.component', '.page', '.view']
        for suffix in suffixes_to_remove:
            if component_name.endswith(suffix):
                component_name = component_name[:-len(suffix)]
        
        # Create branch name
        branch_name = f"feature/component-{component_name}"
        
        # Ensure branch name is unique
        counter = 1
        original_branch_name = branch_name
        while branch_name in [branch.name for branch in self.repo.branches]:
            branch_name = f"{original_branch_name}-{counter}"
            counter += 1
        
        return branch_name
    
    def create_and_switch_branch(self, branch_name):
        """Create and switch to a new branch."""
        try:
            # Create new branch from current HEAD
            new_branch = self.repo.create_head(branch_name)
            new_branch.checkout()
            logger.info(f"Created and switched to branch: {branch_name}")
            return True
        except Exception as e:
            logger.error(f"Failed to create branch {branch_name}: {e}")
            return False
    
    def commit_file(self, file_path, branch_name):
        """Add and commit the new file."""
        try:
            # Add the file to staging
            self.repo.index.add([file_path])
            
            # Create commit message
            component_name = Path(file_path).stem
            commit_message = f"feat: add {component_name} component\n\nAutomatically created branch and committed new component file."
            
            # Commit the file
            self.repo.index.commit(commit_message)
            logger.info(f"Committed {file_path} to branch {branch_name}")
            return True
        except Exception as e:
            logger.error(f"Failed to commit {file_path}: {e}")
            return False
    
    def push_to_remote(self, branch_name):
        """Push the branch to remote repository."""
        try:
            origin = self.repo.remote('origin')
            origin.push(branch_name)
            logger.info(f"Pushed branch {branch_name} to remote")
            return True
        except Exception as e:
            logger.warning(f"Failed to push branch {branch_name}: {e}")
            return False
    
    def create_pull_request(self, branch_name, file_path):
        """Create a pull request for the new component."""
        if not self.github:
            return False
        
        try:
            # Get repository name
            repo_url = self.repo.remote('origin').url
            repo_name = repo_url.split('/')[-1].replace('.git', '')
            owner = repo_url.split('/')[-2].split(':')[-1]
            
            # Get GitHub repository
            gh_repo = self.github.get_repo(f"{owner}/{repo_name}")
            
            # Create PR
            component_name = Path(file_path).stem
            title = f"Add {component_name} component"
            body = f"""
## New Component: {component_name}

This PR adds a new component file: `{file_path}`

### Changes
- ✨ Added new component: {component_name}
- 🔧 Automatically created via branch_maker.py

### Review Notes
Please review the component implementation and ensure it follows project standards.
"""
            
            pr = gh_repo.create_pull(
                title=title,
                body=body,
                head=branch_name,
                base='main'
            )
            
            logger.info(f"Created pull request: {pr.html_url}")
            return True
        except Exception as e:
            logger.error(f"Failed to create pull request: {e}")
            return False
    
    def on_created(self, event):
        """Handle file creation events."""
        if event.is_directory:
            return
        
        file_path = event.src_path
        
        # Check if it's a component file
        if not self.is_component_file(file_path):
            return
        
        logger.info(f"New component file detected: {file_path}")
        
        # Wait a moment for file to be fully written
        time.sleep(1)
        
        # Generate branch name
        branch_name = self.create_branch_name(file_path)
        
        # Store current branch to return to later
        current_branch = self.repo.active_branch.name
        
        try:
            # Create and switch to new branch
            if self.create_and_switch_branch(branch_name):
                # Commit the file
                if self.commit_file(file_path, branch_name):
                    # Push to remote
                    self.push_to_remote(branch_name)
                    
                    # Create pull request if GitHub is configured
                    self.create_pull_request(branch_name, file_path)
                    
                    logger.info(f"Successfully processed {file_path} on branch {branch_name}")
                else:
                    logger.error(f"Failed to commit {file_path}")
            else:
                logger.error(f"Failed to create branch for {file_path}")
        
        finally:
            # Return to original branch
            try:
                self.repo.heads[current_branch].checkout()
                logger.info(f"Returned to branch: {current_branch}")
            except Exception as e:
                logger.error(f"Failed to return to branch {current_branch}: {e}")

def main():
    """Main function to start the file watcher."""
    parser = argparse.ArgumentParser(description='Watch for new component files and create branches')
    parser.add_argument('--path', '-p', default='.', help='Path to watch (default: current directory)')
    parser.add_argument('--github-token', '-t', help='GitHub token for creating pull requests')
    parser.add_argument('--recursive', '-r', action='store_true', help='Watch subdirectories recursively')
    
    args = parser.parse_args()
    
    # Validate path
    watch_path = Path(args.path).resolve()
    if not watch_path.exists():
        logger.error(f"Path does not exist: {watch_path}")
        sys.exit(1)
    
    logger.info(f"Starting branch_maker.py")
    logger.info(f"Watching path: {watch_path}")
    logger.info(f"Recursive: {args.recursive}")
    
    # Create event handler
    event_handler = ComponentFileHandler(
        repo_path=watch_path,
        github_token=args.github_token
    )
    
    # Create observer
    observer = Observer()
    observer.schedule(event_handler, str(watch_path), recursive=args.recursive)
    
    # Start watching
    observer.start()
    logger.info("File watcher started. Press Ctrl+C to stop.")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        logger.info("File watcher stopped.")
    
    observer.join()

if __name__ == "__main__":
    main() 