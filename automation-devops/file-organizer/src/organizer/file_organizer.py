#!/usr/bin/env python3
"""
Advanced File Organizer

A sophisticated file organization tool that automatically categorizes,
moves, and manages files based on intelligent rules and patterns.

Features:
- Smart file categorization by type and content
- Duplicate detection with multiple hash algorithms
- Date-based organization with flexible patterns
- Custom rule engine for complex scenarios
- Undo/rollback functionality with transaction logging
- Safe mode with backup creation
- Detailed logging and statistics
- Cross-platform compatibility

Author: Carlos Alberto Jurez
License: MIT
"""

import os
import sys
import shutil
import hashlib
import json
import re
import logging
import argparse
from pathlib import Path
from datetime import datetime, timedelta
from collections import defaultdict, Counter
from typing import Dict, List, Set, Optional, Tuple, Callable
import sqlite3
import magic
from send2trash import send2trash
import yaml


class FileOrganizer:
    """
    Advanced file organizer with intelligent categorization and management.
    """
    
    def __init__(self, config_path: Optional[str] = None):
        """
        Initialize the File Organizer.
        
        Args:
            config_path: Path to configuration file
        """
        self.config_path = config_path or self._get_default_config_path()
        self.config = self._load_config()
        
        # Setup logging
        self.logger = self._setup_logging()
        
        # Initialize database for transaction tracking
        self.db_path = Path.home() / '.file_organizer' / 'transactions.db'
        self.db_path.parent.mkdir(exist_ok=True)
        self._init_database()
        
        # File type detection
        self.mime = magic.Magic(mime=True)
        
        # Statistics tracking
        self.stats = {
            'files_processed': 0,
            'files_moved': 0,
            'files_copied': 0,
            'duplicates_found': 0,
            'errors': 0,
            'directories_created': 0,
            'bytes_organized': 0
        }
        
        # Transaction ID for rollback capability
        self.transaction_id = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        self.logger.info(f"File Organizer initialized (Transaction: {self.transaction_id})")

    def organize(self, source_path: str, dry_run: bool = False, 
                backup: bool = True) -> Dict:
        """
        Main organization method.
        
        Args:
            source_path: Path to organize
            dry_run: If True, only show what would be done
            backup: Create backup before moving files
            
        Returns:
            Dictionary with organization results
        """
        source = Path(source_path).resolve()
        
        if not source.exists():
            raise FileNotFoundError(f"Source path does not exist: {source}")
        
        self.logger.info(f"Starting organization of: {source}")
        self.logger.info(f"Mode: {'DRY RUN' if dry_run else 'EXECUTE'}")
        
        # Backup if requested and not dry run
        if backup and not dry_run:
            self._create_backup(source)
        
        # Scan and analyze files
        files_to_process = self._scan_files(source)
        self.logger.info(f"Found {len(files_to_process)} files to process")
        
        # Process files according to rules
        results = self._process_files(files_to_process, dry_run)
        
        # Generate report
        report = self._generate_report(results)
        
        if not dry_run:
            self.logger.info("Organization completed successfully")
        
        return report

    def find_duplicates(self, path: str, algorithm: str = 'md5') -> Dict:
        """
        Find duplicate files using various hashing algorithms.
        
        Args:
            path: Path to scan for duplicates
            algorithm: Hash algorithm (md5, sha1, sha256)
            
        Returns:
            Dictionary mapping hashes to lists of duplicate files
        """
        self.logger.info(f"Scanning for duplicates in: {path}")
        
        file_hashes = defaultdict(list)
        path_obj = Path(path)
        
        for file_path in path_obj.rglob('*'):
            if file_path.is_file():
                try:
                    file_hash = self._calculate_hash(file_path, algorithm)
                    file_hashes[file_hash].append(str(file_path))
                    self.stats['files_processed'] += 1
                except Exception as e:
                    self.logger.error(f"Error hashing {file_path}: {e}")
                    self.stats['errors'] += 1
        
        # Filter to only duplicates
        duplicates = {h: files for h, files in file_hashes.items() if len(files) > 1}
        
        self.logger.info(f"Found {len(duplicates)} sets of duplicate files")
        self.stats['duplicates_found'] = len(duplicates)
        
        return duplicates

    def clean_empty_directories(self, path: str, dry_run: bool = False) -> List[str]:
        """
        Remove empty directories recursively.
        
        Args:
            path: Root path to clean
            dry_run: If True, only show what would be removed
            
        Returns:
            List of directories that were (or would be) removed
        """
        removed_dirs = []
        path_obj = Path(path)
        
        # Get all directories, sorted by depth (deepest first)
        all_dirs = sorted([d for d in path_obj.rglob('*') if d.is_dir()], 
                         key=lambda x: len(x.parts), reverse=True)
        
        for dir_path in all_dirs:
            try:
                # Check if directory is empty
                if not any(dir_path.iterdir()):
                    if not dry_run:
                        dir_path.rmdir()
                        self.logger.debug(f"Removed empty directory: {dir_path}")
                    removed_dirs.append(str(dir_path))
            except Exception as e:
                self.logger.error(f"Error removing directory {dir_path}: {e}")
        
        self.logger.info(f"{'Would remove' if dry_run else 'Removed'} "
                        f"{len(removed_dirs)} empty directories")
        
        return removed_dirs

    def organize_by_date(self, source_path: str, pattern: str = '%Y/%m', 
                        dry_run: bool = False) -> Dict:
        """
        Organize files by date using specified pattern.
        
        Args:
            source_path: Source directory
            pattern: Date pattern for folder structure
            dry_run: Preview mode
            
        Returns:
            Organization results
        """
        source = Path(source_path)
        results = {'moved': [], 'errors': []}
        
        for file_path in source.rglob('*'):
            if file_path.is_file():
                try:
                    # Get file modification time
                    mod_time = datetime.fromtimestamp(file_path.stat().st_mtime)
                    
                    # Generate target directory
                    date_folder = mod_time.strftime(pattern)
                    target_dir = source / 'organized_by_date' / date_folder
                    target_path = target_dir / file_path.name
                    
                    if not dry_run:
                        target_dir.mkdir(parents=True, exist_ok=True)
                        shutil.move(str(file_path), str(target_path))
                        self._log_transaction('move', str(file_path), str(target_path))
                    
                    results['moved'].append({
                        'source': str(file_path),
                        'target': str(target_path),
                        'date': mod_time.isoformat()
                    })
                    
                    self.stats['files_moved'] += 1
                    
                except Exception as e:
                    error = f"Error organizing {file_path}: {e}"
                    self.logger.error(error)
                    results['errors'].append(error)
                    self.stats['errors'] += 1
        
        return results

    def rollback(self, transaction_id: Optional[str] = None) -> bool:
        """
        Rollback a previous organization operation.
        
        Args:
            transaction_id: Specific transaction to rollback (default: latest)
            
        Returns:
            True if successful, False otherwise
        """
        if not transaction_id:
            transaction_id = self._get_latest_transaction()
        
        if not transaction_id:
            self.logger.error("No transactions found to rollback")
            return False
        
        self.logger.info(f"Rolling back transaction: {transaction_id}")
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Get all operations for this transaction (in reverse order)
            cursor.execute("""
                SELECT operation, source_path, target_path 
                FROM transactions 
                WHERE transaction_id = ? 
                ORDER BY timestamp DESC
            """, (transaction_id,))
            
            operations = cursor.fetchall()
            
            for op, source, target in operations:
                try:
                    if op == 'move' and Path(target).exists():
                        # Move file back to original location
                        shutil.move(target, source)
                        self.logger.debug(f"Rolled back: {target} -> {source}")
                    elif op == 'copy' and Path(target).exists():
                        # Remove copied file
                        Path(target).unlink()
                        self.logger.debug(f"Removed copied file: {target}")
                except Exception as e:
                    self.logger.error(f"Error rolling back {source} -> {target}: {e}")
            
            # Mark transaction as rolled back
            cursor.execute("""
                UPDATE transactions 
                SET rolled_back = 1 
                WHERE transaction_id = ?
            """, (transaction_id,))
            
            conn.commit()
            conn.close()
            
            self.logger.info(f"Transaction {transaction_id} rolled back successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"Error during rollback: {e}")
            return False

    def _scan_files(self, path: Path) -> List[Path]:
        """Scan directory and return list of files to process."""
        files = []
        
        if path.is_file():
            return [path]
        
        for item in path.rglob('*'):
            if item.is_file() and not self._should_ignore(item):
                files.append(item)
        
        return files

    def _process_files(self, files: List[Path], dry_run: bool) -> Dict:
        """Process files according to organization rules."""
        results = {
            'moved': [],
            'copied': [],
            'skipped': [],
            'errors': []
        }
        
        for file_path in files:
            try:
                target_location = self._determine_target_location(file_path)
                
                if not target_location:
                    results['skipped'].append(str(file_path))
                    continue
                
                # Check if file already exists at target
                if target_location.exists():
                    if self._files_are_identical(file_path, target_location):
                        results['skipped'].append(str(file_path))
                        continue
                    else:
                        # Handle conflict
                        target_location = self._resolve_naming_conflict(target_location)
                
                # Perform the operation
                if not dry_run:
                    self._execute_file_operation(file_path, target_location)
                
                results['moved'].append({
                    'source': str(file_path),
                    'target': str(target_location)
                })
                
                self.stats['files_moved'] += 1
                self.stats['bytes_organized'] += file_path.stat().st_size
                
            except Exception as e:
                error = f"Error processing {file_path}: {e}"
                self.logger.error(error)
                results['errors'].append(error)
                self.stats['errors'] += 1
        
        return results

    def _determine_target_location(self, file_path: Path) -> Optional[Path]:
        """Determine where a file should be moved based on rules."""
        # Get file info
        file_info = self._analyze_file(file_path)
        
        # Apply rules in order of priority
        for rule in self.config['rules']:
            if self._matches_rule(file_info, rule):
                target_dir = Path(rule['target_directory'])
                
                # Handle relative paths
                if not target_dir.is_absolute():
                    target_dir = file_path.parent / target_dir
                
                # Create directory if it doesn't exist
                if rule.get('create_subdirs', False):
                    target_dir = self._create_subdirectory_structure(target_dir, file_info)
                
                target_dir.mkdir(parents=True, exist_ok=True)
                self.stats['directories_created'] += 1
                
                return target_dir / file_path.name
        
        return None

    def _analyze_file(self, file_path: Path) -> Dict:
        """Analyze file and return comprehensive information."""
        stat = file_path.stat()
        
        return {
            'name': file_path.name,
            'stem': file_path.stem,
            'suffix': file_path.suffix.lower(),
            'size': stat.st_size,
            'modified': datetime.fromtimestamp(stat.st_mtime),
            'created': datetime.fromtimestamp(stat.st_ctime),
            'mime_type': self._get_mime_type(file_path),
            'category': self._categorize_file(file_path),
            'path': str(file_path),
            'hash': self._calculate_hash(file_path) if file_path.stat().st_size < 100 * 1024 * 1024 else None  # Only hash files < 100MB
        }

    def _matches_rule(self, file_info: Dict, rule: Dict) -> bool:
        """Check if file matches a specific rule."""
        conditions = rule.get('conditions', {})
        
        # Check each condition
        for condition_type, condition_value in conditions.items():
            if condition_type == 'extensions':
                if file_info['suffix'] not in condition_value:
                    return False
            
            elif condition_type == 'mime_types':
                if file_info['mime_type'] not in condition_value:
                    return False
            
            elif condition_type == 'categories':
                if file_info['category'] not in condition_value:
                    return False
            
            elif condition_type == 'size_min':
                if file_info['size'] < condition_value:
                    return False
            
            elif condition_type == 'size_max':
                if file_info['size'] > condition_value:
                    return False
            
            elif condition_type == 'name_pattern':
                if not re.search(condition_value, file_info['name'], re.IGNORECASE):
                    return False
            
            elif condition_type == 'age_days':
                age = (datetime.now() - file_info['modified']).days
                if age < condition_value:
                    return False
        
        return True

    def _categorize_file(self, file_path: Path) -> str:
        """Categorize file based on type and content."""
        extension = file_path.suffix.lower()
        mime_type = self._get_mime_type(file_path)
        
        # Image files
        if extension in {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp', '.svg'}:
            return 'images'
        
        # Video files
        if extension in {'.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm', '.m4v'}:
            return 'videos'
        
        # Audio files
        if extension in {'.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma', '.m4a'}:
            return 'audio'
        
        # Document files
        if extension in {'.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt'}:
            return 'documents'
        
        # Spreadsheets
        if extension in {'.xls', '.xlsx', '.csv', '.ods'}:
            return 'spreadsheets'
        
        # Presentations
        if extension in {'.ppt', '.pptx', '.odp'}:
            return 'presentations'
        
        # Archives
        if extension in {'.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'}:
            return 'archives'
        
        # Code files
        if extension in {'.py', '.js', '.html', '.css', '.cpp', '.java', '.php', '.rb'}:
            return 'code'
        
        # Executables
        if extension in {'.exe', '.msi', '.deb', '.rpm', '.dmg', '.app'}:
            return 'executables'
        
        # Use MIME type as fallback
        if mime_type:
            if mime_type.startswith('image/'):
                return 'images'
            elif mime_type.startswith('video/'):
                return 'videos'
            elif mime_type.startswith('audio/'):
                return 'audio'
            elif mime_type.startswith('text/'):
                return 'documents'
        
        return 'others'

    def _get_mime_type(self, file_path: Path) -> str:
        """Get MIME type of file."""
        try:
            return self.mime.from_file(str(file_path))
        except Exception:
            return 'unknown'

    def _calculate_hash(self, file_path: Path, algorithm: str = 'md5') -> str:
        """Calculate file hash."""
        hash_obj = hashlib.new(algorithm)
        
        try:
            with open(file_path, 'rb') as f:
                for chunk in iter(lambda: f.read(4096), b''):
                    hash_obj.update(chunk)
            return hash_obj.hexdigest()
        except Exception as e:
            self.logger.error(f"Error calculating hash for {file_path}: {e}")
            return ''

    def _files_are_identical(self, file1: Path, file2: Path) -> bool:
        """Check if two files are identical."""
        # Quick check: compare sizes first
        if file1.stat().st_size != file2.stat().st_size:
            return False
        
        # Compare hashes
        return self._calculate_hash(file1) == self._calculate_hash(file2)

    def _resolve_naming_conflict(self, target_path: Path) -> Path:
        """Resolve naming conflicts by adding numbers."""
        counter = 1
        original_stem = target_path.stem
        suffix = target_path.suffix
        parent = target_path.parent
        
        while target_path.exists():
            new_name = f"{original_stem}_{counter}{suffix}"
            target_path = parent / new_name
            counter += 1
        
        return target_path

    def _execute_file_operation(self, source: Path, target: Path):
        """Execute the file move/copy operation."""
        operation = self.config.get('default_operation', 'move')
        
        if operation == 'move':
            shutil.move(str(source), str(target))
            self._log_transaction('move', str(source), str(target))
        elif operation == 'copy':
            shutil.copy2(str(source), str(target))
            self._log_transaction('copy', str(source), str(target))
            self.stats['files_copied'] += 1

    def _create_subdirectory_structure(self, base_dir: Path, file_info: Dict) -> Path:
        """Create subdirectory structure based on file info."""
        # Year/Month structure for media files
        if file_info['category'] in {'images', 'videos'}:
            date = file_info['modified']
            return base_dir / str(date.year) / f"{date.month:02d}"
        
        # Size-based structure for large files
        if file_info['size'] > 100 * 1024 * 1024:  # > 100MB
            return base_dir / 'large_files'
        
        return base_dir

    def _should_ignore(self, file_path: Path) -> bool:
        """Check if file should be ignored."""
        ignore_patterns = self.config.get('ignore_patterns', [])
        
        for pattern in ignore_patterns:
            if re.search(pattern, str(file_path), re.IGNORECASE):
                return True
        
        # Ignore system files
        if file_path.name.startswith('.'):
            return True
        
        return False

    def _create_backup(self, source_path: Path):
        """Create backup of source directory."""
        backup_dir = Path.home() / '.file_organizer' / 'backups' / self.transaction_id
        backup_dir.mkdir(parents=True, exist_ok=True)
        
        self.logger.info(f"Creating backup at: {backup_dir}")
        
        try:
            if source_path.is_file():
                shutil.copy2(source_path, backup_dir / source_path.name)
            else:
                shutil.copytree(source_path, backup_dir / source_path.name)
            
            self.logger.info("Backup created successfully")
        except Exception as e:
            self.logger.error(f"Backup creation failed: {e}")
            raise

    def _generate_report(self, results: Dict) -> Dict:
        """Generate comprehensive organization report."""
        return {
            'transaction_id': self.transaction_id,
            'timestamp': datetime.now().isoformat(),
            'statistics': self.stats,
            'results': results,
            'config_used': self.config['name'] if 'name' in self.config else 'default'
        }

    def _log_transaction(self, operation: str, source: str, target: str):
        """Log transaction for rollback capability."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO transactions 
                (transaction_id, timestamp, operation, source_path, target_path)
                VALUES (?, ?, ?, ?, ?)
            """, (self.transaction_id, datetime.now().isoformat(), 
                  operation, source, target))
            
            conn.commit()
            conn.close()
        except Exception as e:
            self.logger.error(f"Error logging transaction: {e}")

    def _get_latest_transaction(self) -> Optional[str]:
        """Get the most recent transaction ID."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT transaction_id FROM transactions 
                WHERE rolled_back = 0 
                ORDER BY timestamp DESC LIMIT 1
            """)
            
            result = cursor.fetchone()
            conn.close()
            
            return result[0] if result else None
        except Exception:
            return None

    def _init_database(self):
        """Initialize SQLite database for transaction tracking."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                transaction_id TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                operation TEXT NOT NULL,
                source_path TEXT NOT NULL,
                target_path TEXT NOT NULL,
                rolled_back INTEGER DEFAULT 0
            )
        """)
        
        conn.commit()
        conn.close()

    def _setup_logging(self) -> logging.Logger:
        """Setup logging configuration."""
        log_level = self.config.get('log_level', 'INFO')
        log_file = self.config.get('log_file')
        
        logger = logging.getLogger('file_organizer')
        logger.setLevel(getattr(logging, log_level))
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        
        # File handler if specified
        if log_file:
            file_handler = logging.FileHandler(log_file)
            file_handler.setLevel(getattr(logging, log_level))
            
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            file_handler.setFormatter(formatter)
            logger.addHandler(file_handler)
        
        # Simple console formatter
        console_formatter = logging.Formatter('%(levelname)s: %(message)s')
        console_handler.setFormatter(console_formatter)
        logger.addHandler(console_handler)
        
        return logger

    def _load_config(self) -> Dict:
        """Load configuration from file."""
        if Path(self.config_path).exists():
            try:
                with open(self.config_path, 'r') as f:
                    if self.config_path.endswith('.yaml') or self.config_path.endswith('.yml'):
                        return yaml.safe_load(f)
                    else:
                        return json.load(f)
            except Exception as e:
                print(f"Error loading config: {e}")
        
        return self._get_default_config()

    def _get_default_config_path(self) -> str:
        """Get default configuration file path."""
        config_dir = Path.home() / '.file_organizer'
        config_dir.mkdir(exist_ok=True)
        return str(config_dir / 'config.yaml')

    def _get_default_config(self) -> Dict:
        """Get default configuration."""
        return {
            'name': 'Default Configuration',
            'default_operation': 'move',
            'log_level': 'INFO',
            'ignore_patterns': [
                r'\.git/',
                r'\.DS_Store',
                r'Thumbs\.db',
                r'.*\.tmp$'
            ],
            'rules': [
                {
                    'name': 'Images',
                    'conditions': {
                        'categories': ['images']
                    },
                    'target_directory': 'organized/images',
                    'create_subdirs': True
                },
                {
                    'name': 'Videos',
                    'conditions': {
                        'categories': ['videos']
                    },
                    'target_directory': 'organized/videos',
                    'create_subdirs': True
                },
                {
                    'name': 'Documents',
                    'conditions': {
                        'categories': ['documents', 'spreadsheets', 'presentations']
                    },
                    'target_directory': 'organized/documents'
                },
                {
                    'name': 'Audio',
                    'conditions': {
                        'categories': ['audio']
                    },
                    'target_directory': 'organized/music'
                },
                {
                    'name': 'Archives',
                    'conditions': {
                        'categories': ['archives']
                    },
                    'target_directory': 'organized/archives'
                },
                {
                    'name': 'Code',
                    'conditions': {
                        'categories': ['code']
                    },
                    'target_directory': 'organized/code'
                }
            ]
        }


if __name__ == '__main__':
    # Simple command-line interface
    parser = argparse.ArgumentParser(description='Advanced File Organizer')
    parser.add_argument('path', help='Path to organize')
    parser.add_argument('--dry-run', action='store_true', help='Preview changes without executing')
    parser.add_argument('--no-backup', action='store_true', help='Skip backup creation')
    parser.add_argument('--config', help='Configuration file path')
    
    args = parser.parse_args()
    
    try:
        organizer = FileOrganizer(args.config)
        report = organizer.organize(args.path, args.dry_run, not args.no_backup)
        
        print(f"\n{'=' * 50}")
        print("ORGANIZATION REPORT")
        print(f"{'=' * 50}")
        print(f"Files processed: {report['statistics']['files_processed']}")
        print(f"Files moved: {report['statistics']['files_moved']}")
        print(f"Errors: {report['statistics']['errors']}")
        print(f"Transaction ID: {report['transaction_id']}")
        
        if args.dry_run:
            print("\n⚠️  This was a DRY RUN - no files were actually moved")
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
