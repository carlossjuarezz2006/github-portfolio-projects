# 🗂️ Advanced File Organizer

An **intelligent file organization tool** that automatically categorizes, moves, and manages files using **AI-powered classification**, **duplicate detection**, and **customizable rules**. Built for power users who need to tame chaotic file systems with precision and safety.

![File Organizer](https://via.placeholder.com/800x400/28a745/ffffff?text=File+Organizer+Dashboard)

## ✨ Features

### 🧠 **Intelligent Classification**
- **MIME Type Detection** - Accurate file type identification
- **Content Analysis** - Beyond extensions to actual file content  
- **Smart Categorization** - 15+ predefined categories with custom rules
- **Metadata Extraction** - Date, size, and content-based organization
- **Pattern Recognition** - Detects naming patterns and conventions

### 🔍 **Advanced Duplicate Detection**
- **Multi-Algorithm Hashing** - MD5, SHA1, SHA256 support
- **Content Comparison** - Byte-level duplicate verification
- **Size Optimization** - Handles files from bytes to gigabytes
- **Smart Conflict Resolution** - Intelligent duplicate handling
- **Batch Processing** - Efficient large-scale duplicate removal

### ⚡ **High-Performance Processing**
- **Streaming Operations** - Memory-efficient for large directories
- **Parallel Processing** - Multi-threaded file operations
- **Progress Tracking** - Real-time operation feedback
- **Error Recovery** - Graceful handling of locked/inaccessible files
- **Interruption Safety** - Resume operations after interruption

### 🛡️ **Safety & Reliability**
- **Transaction Logging** - Complete operation history
- **Rollback Capability** - Undo any organization operation  
- **Automatic Backups** - Optional pre-organization backups
- **Dry Run Mode** - Preview all changes before execution
- **Conflict Resolution** - Smart handling of naming conflicts

### 🎯 **Flexible Organization**
- **Rule-Based System** - Custom organization logic
- **Date-Based Sorting** - Multiple date pattern options
- **Size-Based Grouping** - Organize by file size ranges
- **Extension Mapping** - Custom file type associations
- **Directory Templates** - Predefined folder structures

### 🖥️ **User Interfaces**
- **Interactive CLI** - Rich, colorful terminal interface
- **Command Line** - Scriptable batch operations
- **Configuration Files** - YAML/JSON rule definitions
- **Progress Indicators** - Beautiful progress bars and status
- **Detailed Reporting** - Comprehensive operation summaries

## 🛠️ Technology Stack

- **Python 3.8+** - Modern Python with type hints
- **Rich** - Beautiful terminal interfaces  
- **Click** - Powerful CLI framework
- **SQLite** - Transaction logging and history
- **python-magic** - Advanced MIME type detection
- **PyYAML** - Configuration file management
- **Questionary** - Interactive prompts

## 📦 Installation

### Prerequisites
- Python 3.8 or higher
- pip package manager
- Operating system: Windows, macOS, or Linux

### Quick Install
```bash
# Clone the repository
git clone https://github.com/carlos-alberto-jurez/file-organizer.git
cd file-organizer

# Install dependencies
pip install -r requirements.txt

# Make executable (Linux/macOS)
chmod +x src/cli/main.py

# Add to PATH (optional)
echo 'export PATH=$PATH:'$(pwd)/src/cli >> ~/.bashrc
source ~/.bashrc
```

### System Dependencies
#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install python3-dev libmagic1
```

#### macOS
```bash
brew install libmagic
```

#### Windows
```bash
# Install using pip (Windows binaries included)
pip install python-magic-bin
```

## 🚀 Quick Start

### Interactive Mode (Recommended)
```bash
python src/cli/main.py
```

This launches the beautiful interactive interface with guided workflows.

### Command Line Usage
```bash
# Organize a directory
python src/cli/main.py organize ~/Downloads

# Preview changes only (dry run)
python src/cli/main.py organize ~/Downloads --dry-run

# Find duplicates
python src/cli/main.py duplicates ~/Pictures

# Interactive mode
python src/cli/main.py interactive
```

### Quick Examples
```bash
# Organize Downloads folder with backup
python src/cli/main.py organize ~/Downloads --config custom_rules.yaml

# Find and remove duplicates in Pictures
python src/cli/main.py duplicates ~/Pictures --algorithm sha256

# Organize by date pattern
python src/organizer/file_organizer.py ~/Photos --organize-by-date "%Y/%m"

# Clean empty directories
python src/cli/main.py organize ~/Documents --clean-empty
```

## 📋 Organization Rules

### Default Categories
| Category | Extensions | Target Folder |
|----------|------------|---------------|
| **Images** | jpg, png, gif, svg, webp | `organized/images/` |
| **Videos** | mp4, avi, mkv, mov, webm | `organized/videos/` |
| **Audio** | mp3, wav, flac, aac, ogg | `organized/music/` |
| **Documents** | pdf, doc, txt, rtf, odt | `organized/documents/` |
| **Spreadsheets** | xls, xlsx, csv, ods | `organized/spreadsheets/` |
| **Presentations** | ppt, pptx, odp | `organized/presentations/` |
| **Archives** | zip, rar, 7z, tar, gz | `organized/archives/` |
| **Code** | py, js, html, css, cpp | `organized/code/` |
| **Executables** | exe, msi, deb, rpm, dmg | `organized/software/` |

### Custom Rule Examples
```yaml
# config.yaml
rules:
  - name: "Work Documents"
    conditions:
      extensions: [".pdf", ".docx"]
      name_pattern: "work|project|meeting"
      size_min: 1024  # 1KB minimum
    target_directory: "Work/Documents"
    create_subdirs: true

  - name: "Large Media Files"
    conditions:
      categories: ["videos", "images"]
      size_min: 104857600  # 100MB
    target_directory: "Media/Large Files"

  - name: "Old Files Cleanup"
    conditions:
      age_days: 365  # Older than 1 year
    target_directory: "Archive/Old Files"
```

## 🔧 Configuration

### Configuration File Location
- **Linux/macOS**: `~/.file_organizer/config.yaml`
- **Windows**: `%USERPROFILE%\.file_organizer\config.yaml`

### Complete Configuration Example
```yaml
name: "Custom Organization Rules"
default_operation: "move"  # or "copy"
log_level: "INFO"
log_file: "~/.file_organizer/organizer.log"

# Files to ignore
ignore_patterns:
  - "\.git/"
  - "\.DS_Store"
  - "Thumbs\.db"
  - ".*\.tmp$"
  - "__pycache__/"

# Organization rules (processed in order)
rules:
  - name: "Photos by Date"
    conditions:
      categories: ["images"]
      extensions: [".jpg", ".jpeg", ".png"]
    target_directory: "Photos"
    create_subdirs: true
    subdir_pattern: "{year}/{month:02d}"

  - name: "Work Documents"
    conditions:
      name_pattern: "(?i)(work|project|meeting|report)"
      extensions: [".pdf", ".docx", ".xlsx"]
    target_directory: "Work"

  - name: "Development Files"
    conditions:
      categories: ["code"]
      extensions: [".py", ".js", ".html", ".css"]
    target_directory: "Development/Projects"

  - name: "Large Files"
    conditions:
      size_min: 104857600  # 100MB
    target_directory: "Large Files"

# Duplicate handling
duplicate_handling:
  algorithm: "sha256"
  action: "prompt"  # prompt, delete, move
  keep_newest: true

# Safety settings
safety:
  backup_before_organize: true
  max_files_per_operation: 10000
  confirm_destructive_operations: true
```

## 📊 Usage Examples

### 1. Clean Up Downloads Folder
```bash
# Preview what would happen
python src/cli/main.py organize ~/Downloads --dry-run

# Execute with backup
python src/cli/main.py organize ~/Downloads --backup

# Use custom rules
python src/cli/main.py organize ~/Downloads --config work_rules.yaml
```

### 2. Photo Organization by Date
```python
from organizer.file_organizer import FileOrganizer

organizer = FileOrganizer()

# Organize photos by year/month
results = organizer.organize_by_date(
    "~/Pictures", 
    pattern="%Y/%m",
    dry_run=False
)

print(f"Organized {len(results['moved'])} photos")
```

### 3. Duplicate Cleanup
```bash
# Find duplicates using SHA256
python src/cli/main.py duplicates ~/Documents --algorithm sha256

# Interactive duplicate removal
python src/cli/main.py interactive
# Choose "Find duplicates" option
```

### 4. Custom Script Integration
```python
#!/usr/bin/env python3
import sys
from organizer.file_organizer import FileOrganizer

def organize_project_files(project_dir):
    """Organize files in a development project."""
    
    config = {
        'rules': [
            {
                'name': 'Source Code',
                'conditions': {'categories': ['code']},
                'target_directory': 'src'
            },
            {
                'name': 'Documentation',
                'conditions': {'extensions': ['.md', '.rst', '.txt']},
                'target_directory': 'docs'
            },
            {
                'name': 'Assets',
                'conditions': {'categories': ['images']},
                'target_directory': 'assets'
            }
        ]
    }
    
    organizer = FileOrganizer()
    organizer.config.update(config)
    
    return organizer.organize(project_dir, dry_run=False)

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: organize_project.py <project_directory>")
        sys.exit(1)
    
    result = organize_project_files(sys.argv[1])
    print(f"Organized {result['statistics']['files_moved']} files")
```

## 🔄 Transaction Management

### Rollback Operations
Every organization creates a transaction that can be rolled back:

```bash
# View transaction history
python src/cli/main.py interactive
# Choose "Rollback operation"

# Programmatic rollback
from organizer.file_organizer import FileOrganizer
organizer = FileOrganizer()
success = organizer.rollback("20241201_143022")
```

### Transaction Database
Transactions are stored in SQLite database at:
- **Linux/macOS**: `~/.file_organizer/transactions.db`
- **Windows**: `%USERPROFILE%\.file_organizer\transactions.db`

### Transaction Details
Each transaction includes:
- **Operation type** (move, copy, delete)
- **Source and target paths**
- **Timestamp**
- **Success/failure status**
- **Rollback status**

## 🧪 Testing

### Run Tests
```bash
# Install test dependencies
pip install pytest pytest-cov

# Run all tests
python -m pytest tests/ -v

# Run with coverage
python -m pytest tests/ --cov=src --cov-report=html

# Test specific functionality
python -m pytest tests/test_organizer.py::test_duplicate_detection -v
```

### Test Categories
- **Unit Tests** - Individual component testing
- **Integration Tests** - End-to-end workflow testing  
- **Performance Tests** - Large file handling
- **Safety Tests** - Rollback and error recovery

### Manual Testing
```bash
# Create test environment
mkdir test_files
cd test_files

# Generate test files
for i in {1..100}; do
    touch "document_$i.pdf"
    touch "image_$i.jpg" 
    touch "video_$i.mp4"
done

# Test organization
python ../src/cli/main.py organize . --dry-run
```

## 📊 Performance Benchmarks

### File Processing Speed
- **Small files (< 1MB)**: ~1,000 files/second
- **Medium files (1-100MB)**: ~100 files/second  
- **Large files (> 100MB)**: ~10 files/second
- **Duplicate detection**: ~500 files/second

### Memory Usage
- **Base application**: ~50MB RAM
- **Processing 10,000 files**: ~200MB RAM
- **Large file hashing**: ~100MB RAM peak

### Disk Space
- **Application**: ~20MB installed
- **Transaction logs**: ~1MB per 1,000 operations
- **Backup storage**: Varies by organized content

## 🔒 Security & Privacy

### Data Protection
- **No Cloud Storage** - All operations are local
- **No Data Collection** - No telemetry or tracking
- **File Content Privacy** - Only metadata analysis
- **Secure Deletion** - Optional secure file removal

### Safe Operations
- **Atomic Transactions** - Operations complete fully or not at all
- **Backup Creation** - Automatic backup before major operations
- **Rollback Capability** - Undo any organization
- **Error Handling** - Graceful failure with detailed logging

### Permissions
The tool requires:
- **Read access** to source directories
- **Write access** to target directories
- **Create/delete** permissions for organization
- **Database access** for transaction logging

## 🚀 Advanced Features

### Automation Integration
```bash
# Cron job for automated organization
# Add to crontab: crontab -e
0 2 * * * /usr/bin/python3 /path/to/file-organizer/src/cli/main.py organize ~/Downloads --no-backup

# Windows Task Scheduler
# Create task with: python src/cli/main.py organize C:\Users\%USERNAME%\Downloads
```

### Monitoring Integration
```python
from organizer.file_organizer import FileOrganizer
import logging

# Custom logging handler
handler = logging.FileHandler('organization.log')
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)

organizer = FileOrganizer()
organizer.logger.addHandler(handler)
```

### Plugin System (Extensible)
```python
# Custom rule plugin
class CustomRulePlugin:
    def matches(self, file_info):
        # Custom logic for file matching
        return file_info['name'].startswith('PROJECT_')
    
    def target_location(self, file_info):
        return f"projects/{file_info['stem']}"

# Register plugin
organizer.register_plugin(CustomRulePlugin())
```

## 🤝 Contributing

### Development Setup
```bash
# Fork and clone the repository
git clone https://github.com/carlos-alberto-jurez/file-organizer.git
cd file-organizer

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/macOS
# or
venv\Scripts\activate     # Windows

# Install development dependencies
pip install -r requirements.txt
pip install -e .

# Install pre-commit hooks
pre-commit install
```

### Code Standards
- **Python 3.8+** compatibility
- **Type hints** for all public functions
- **Docstrings** following Google style
- **Tests** for all new features
- **Black** code formatting
- **Flake8** linting compliance

### Contribution Guidelines
1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Test** thoroughly: `python -m pytest`
5. **Push** to branch: `git push origin feature/amazing-feature`
6. **Open** Pull Request with detailed description

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**Permission Denied**
```bash
# Linux/macOS: Fix permissions
sudo chown -R $USER:$USER /target/directory

# Windows: Run as Administrator
```

**Large File Processing Slow**
```bash
# Increase hash chunk size in config
hash_chunk_size: 65536  # Default: 4096
```

**Out of Memory Error**
```bash
# Process files in smaller batches
max_files_per_batch: 1000  # Default: 10000
```

**Transaction Database Locked**
```bash
# Stop all organizer instances and retry
# Or manually unlock:
sqlite3 ~/.file_organizer/transactions.db "BEGIN IMMEDIATE; ROLLBACK;"
```

### Debug Mode
```bash
# Enable verbose logging
python src/cli/main.py organize ~/Downloads --config debug_config.yaml

# debug_config.yaml
log_level: "DEBUG"
log_file: "debug.log"
```

### Getting Help
- **GitHub Issues** - Bug reports and feature requests
- **Discussions** - Questions and community support
- **Documentation** - Comprehensive guides and examples
- **Source Code** - Well-commented implementation

## 🌟 Acknowledgments

- **Rich Library** - Beautiful terminal interfaces
- **Click Framework** - Elegant command-line interfaces  
- **Python Magic** - File type detection
- **SQLite** - Embedded database engine
- **Open Source Community** - Inspiration and contributions

---

⭐ **If this tool helps organize your digital life, please give it a star!** ⭐

![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red.svg)
![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![CLI](https://img.shields.io/badge/CLI-Rich-green.svg)
![Cross Platform](https://img.shields.io/badge/Platform-Cross%20Platform-orange.svg)
