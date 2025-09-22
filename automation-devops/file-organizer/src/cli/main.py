#!/usr/bin/env python3
"""
File Organizer CLI

Interactive command-line interface for the Advanced File Organizer.
Provides a user-friendly way to organize files with various options.

Features:
- Interactive mode with guided setup
- Multiple organization strategies
- Real-time progress display
- Comprehensive reporting
- Rollback functionality
"""

import os
import sys
import argparse
import json
from pathlib import Path
from typing import Dict, List, Optional
import click
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TimeElapsedColumn
from rich.prompt import Prompt, Confirm, IntPrompt
from rich.syntax import Syntax
from rich.tree import Tree
import questionary

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))
from organizer.file_organizer import FileOrganizer


class FileOrganizerCLI:
    """Command-line interface for File Organizer."""
    
    def __init__(self):
        self.console = Console()
        self.organizer = None
        
    def run(self):
        """Main CLI entry point."""
        self.console.print(Panel.fit(
            "[bold blue]🗂️  Advanced File Organizer[/bold blue]\n"
            "[dim]Intelligent file organization and management tool[/dim]",
            style="blue"
        ))
        
        # Get action from user
        action = questionary.select(
            "What would you like to do?",
            choices=[
                {"name": "🗂️  Organize files", "value": "organize"},
                {"name": "🔍 Find duplicates", "value": "duplicates"},
                {"name": "📅 Organize by date", "value": "by_date"},
                {"name": "🧹 Clean empty directories", "value": "clean"},
                {"name": "↩️  Rollback operation", "value": "rollback"},
                {"name": "⚙️  Configure settings", "value": "config"},
                {"name": "📊 View statistics", "value": "stats"},
                {"name": "❌ Exit", "value": "exit"}
            ]
        ).ask()
        
        if action == "exit":
            self.console.print("👋 Goodbye!")
            return
        
        # Initialize organizer
        try:
            self.organizer = FileOrganizer()
        except Exception as e:
            self.console.print(f"[bold red]Error initializing organizer: {e}[/bold red]")
            return
        
        # Execute selected action
        if action == "organize":
            self.organize_files()
        elif action == "duplicates":
            self.find_duplicates()
        elif action == "by_date":
            self.organize_by_date()
        elif action == "clean":
            self.clean_empty_directories()
        elif action == "rollback":
            self.rollback_operation()
        elif action == "config":
            self.configure_settings()
        elif action == "stats":
            self.show_statistics()

    def organize_files(self):
        """Organize files using configured rules."""
        self.console.print("\n[bold]📁 File Organization[/bold]")
        
        # Get source path
        source_path = questionary.path("Enter the path to organize:").ask()
        if not source_path:
            return
        
        if not Path(source_path).exists():
            self.console.print(f"[bold red]Path does not exist: {source_path}[/bold red]")
            return
        
        # Get options
        dry_run = questionary.confirm("Preview changes only? (dry run)").ask()
        backup = not dry_run and questionary.confirm("Create backup before organizing?").ask()
        
        self.console.print(f"\n[bold]Organizing:[/bold] {source_path}")
        self.console.print(f"[bold]Mode:[/bold] {'DRY RUN' if dry_run else 'EXECUTE'}")
        if backup:
            self.console.print("[bold]Backup:[/bold] Yes")
        
        if not dry_run:
            if not Confirm.ask("\nProceed with organization?"):
                return
        
        # Perform organization with progress tracking
        try:
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                BarColumn(),
                TimeElapsedColumn(),
                console=self.console
            ) as progress:
                task = progress.add_task("Organizing files...", total=None)
                
                report = self.organizer.organize(source_path, dry_run, backup)
                
                progress.update(task, completed=100, total=100)
            
            self._display_report(report, dry_run)
            
        except Exception as e:
            self.console.print(f"[bold red]Organization failed: {e}[/bold red]")

    def find_duplicates(self):
        """Find and handle duplicate files."""
        self.console.print("\n[bold]🔍 Duplicate File Detection[/bold]")
        
        # Get search path
        search_path = questionary.path("Enter path to scan for duplicates:").ask()
        if not search_path or not Path(search_path).exists():
            self.console.print("[bold red]Invalid path[/bold red]")
            return
        
        # Get hash algorithm
        algorithm = questionary.select(
            "Select hash algorithm:",
            choices=["md5", "sha1", "sha256"],
            default="md5"
        ).ask()
        
        # Find duplicates
        self.console.print(f"\n[bold]Scanning for duplicates...[/bold]")
        
        with Progress(
            SpinnerColumn(),
            TextColumn("Finding duplicates..."),
            console=self.console
        ) as progress:
            progress.add_task("Scanning", total=None)
            duplicates = self.organizer.find_duplicates(search_path, algorithm)
        
        if not duplicates:
            self.console.print("[bold green]✅ No duplicates found![/bold green]")
            return
        
        # Display duplicates
        self._display_duplicates(duplicates)
        
        # Ask what to do with duplicates
        if questionary.confirm("Delete duplicate files? (keeps first occurrence)").ask():
            self._handle_duplicates(duplicates)

    def organize_by_date(self):
        """Organize files by date."""
        self.console.print("\n[bold]📅 Date-based Organization[/bold]")
        
        source_path = questionary.path("Enter path to organize by date:").ask()
        if not source_path or not Path(source_path).exists():
            self.console.print("[bold red]Invalid path[/bold red]")
            return
        
        # Date pattern options
        patterns = {
            "Year/Month": "%Y/%m",
            "Year/Month/Day": "%Y/%m/%d",
            "Year only": "%Y",
            "Month-Year": "%m-%Y",
            "Custom": "custom"
        }
        
        pattern_choice = questionary.select(
            "Select date organization pattern:",
            choices=list(patterns.keys())
        ).ask()
        
        if pattern_choice == "Custom":
            pattern = questionary.text(
                "Enter custom date pattern (e.g., %Y/%m for Year/Month):"
            ).ask()
        else:
            pattern = patterns[pattern_choice]
        
        dry_run = questionary.confirm("Preview changes only?").ask()
        
        try:
            results = self.organizer.organize_by_date(source_path, pattern, dry_run)
            self._display_date_organization_results(results, dry_run)
        except Exception as e:
            self.console.print(f"[bold red]Error: {e}[/bold red]")

    def clean_empty_directories(self):
        """Clean empty directories."""
        self.console.print("\n[bold]🧹 Clean Empty Directories[/bold]")
        
        path = questionary.path("Enter path to clean:").ask()
        if not path or not Path(path).exists():
            self.console.print("[bold red]Invalid path[/bold red]")
            return
        
        dry_run = questionary.confirm("Preview only? (recommended)").ask()
        
        try:
            removed_dirs = self.organizer.clean_empty_directories(path, dry_run)
            
            if removed_dirs:
                self.console.print(f"\n[bold]{'Would remove' if dry_run else 'Removed'} {len(removed_dirs)} empty directories:[/bold]")
                for directory in removed_dirs:
                    self.console.print(f"  📁 {directory}")
            else:
                self.console.print("[bold green]✅ No empty directories found![/bold green]")
                
        except Exception as e:
            self.console.print(f"[bold red]Error: {e}[/bold red]")

    def rollback_operation(self):
        """Rollback a previous operation."""
        self.console.print("\n[bold]↩️  Rollback Operation[/bold]")
        
        # Get available transactions
        transactions = self._get_transaction_history()
        
        if not transactions:
            self.console.print("[yellow]No transactions found to rollback.[/yellow]")
            return
        
        # Display transaction options
        choices = []
        for trans_id, count in transactions.items():
            choices.append(f"{trans_id} ({count} operations)")
        
        selected = questionary.select(
            "Select transaction to rollback:",
            choices=choices
        ).ask()
        
        if not selected:
            return
        
        transaction_id = selected.split(' ')[0]
        
        self.console.print(f"[bold red]⚠️  This will undo all operations from transaction: {transaction_id}[/bold red]")
        
        if questionary.confirm("Are you sure you want to proceed?").ask():
            try:
                success = self.organizer.rollback(transaction_id)
                if success:
                    self.console.print("[bold green]✅ Rollback completed successfully![/bold green]")
                else:
                    self.console.print("[bold red]❌ Rollback failed![/bold red]")
            except Exception as e:
                self.console.print(f"[bold red]Rollback error: {e}[/bold red]")

    def configure_settings(self):
        """Configure organizer settings."""
        self.console.print("\n[bold]⚙️  Configuration[/bold]")
        
        config_actions = [
            {"name": "View current configuration", "value": "view"},
            {"name": "Edit configuration file", "value": "edit"},
            {"name": "Create new configuration", "value": "create"},
            {"name": "Reset to defaults", "value": "reset"}
        ]
        
        action = questionary.select(
            "Configuration action:",
            choices=config_actions
        ).ask()
        
        if action == "view":
            self._view_configuration()
        elif action == "edit":
            self._edit_configuration()
        elif action == "create":
            self._create_configuration()
        elif action == "reset":
            self._reset_configuration()

    def show_statistics(self):
        """Show organization statistics."""
        self.console.print("\n[bold]📊 Statistics[/bold]")
        
        # Display current session stats
        stats_table = Table(title="Current Session Statistics")
        stats_table.add_column("Metric", style="cyan")
        stats_table.add_column("Value", style="magenta")
        
        for key, value in self.organizer.stats.items():
            formatted_key = key.replace('_', ' ').title()
            if 'bytes' in key.lower():
                formatted_value = self._format_bytes(value)
            else:
                formatted_value = str(value)
            stats_table.add_row(formatted_key, formatted_value)
        
        self.console.print(stats_table)

    def _display_report(self, report: Dict, dry_run: bool):
        """Display organization report."""
        stats = report['statistics']
        results = report['results']
        
        # Statistics table
        stats_table = Table(title=f"Organization Report ({'DRY RUN' if dry_run else 'EXECUTED'})")
        stats_table.add_column("Metric", style="cyan")
        stats_table.add_column("Count", style="magenta")
        
        stats_table.add_row("Files Processed", str(stats['files_processed']))
        stats_table.add_row("Files Moved", str(stats['files_moved']))
        stats_table.add_row("Files Copied", str(stats['files_copied']))
        stats_table.add_row("Duplicates Found", str(stats['duplicates_found']))
        stats_table.add_row("Directories Created", str(stats['directories_created']))
        stats_table.add_row("Errors", str(stats['errors']))
        stats_table.add_row("Data Organized", self._format_bytes(stats['bytes_organized']))
        
        self.console.print(stats_table)
        
        # Error details if any
        if results['errors']:
            self.console.print("\n[bold red]Errors:[/bold red]")
            for error in results['errors'][:10]:  # Show first 10 errors
                self.console.print(f"  ❌ {error}")
            if len(results['errors']) > 10:
                self.console.print(f"  ... and {len(results['errors']) - 10} more errors")
        
        if not dry_run:
            self.console.print(f"\n[dim]Transaction ID: {report['transaction_id']}[/dim]")
            self.console.print("[dim]Use 'Rollback operation' to undo these changes[/dim]")

    def _display_duplicates(self, duplicates: Dict):
        """Display duplicate files in a formatted way."""
        self.console.print(f"\n[bold red]Found {len(duplicates)} sets of duplicate files:[/bold red]")
        
        total_duplicates = sum(len(files) - 1 for files in duplicates.values())
        total_size = 0
        
        for i, (file_hash, files) in enumerate(duplicates.items(), 1):
            if i > 10:  # Show only first 10 sets
                remaining = len(duplicates) - 10
                self.console.print(f"\n[dim]... and {remaining} more duplicate sets[/dim]")
                break
                
            file_size = Path(files[0]).stat().st_size
            total_size += file_size * (len(files) - 1)  # Size of duplicates only
            
            self.console.print(f"\n[bold]Set {i}:[/bold] {len(files)} files ({self._format_bytes(file_size)} each)")
            for j, file_path in enumerate(files):
                marker = "📁" if j == 0 else "🔴"
                self.console.print(f"  {marker} {file_path}")
        
        self.console.print(f"\n[bold]Total duplicates:[/bold] {total_duplicates} files")
        self.console.print(f"[bold]Wasted space:[/bold] {self._format_bytes(total_size)}")

    def _handle_duplicates(self, duplicates: Dict):
        """Handle duplicate file deletion."""
        deleted_count = 0
        freed_space = 0
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=self.console
        ) as progress:
            task = progress.add_task("Deleting duplicates...", total=len(duplicates))
            
            for files in duplicates.values():
                # Keep first file, delete the rest
                for duplicate_file in files[1:]:
                    try:
                        file_path = Path(duplicate_file)
                        file_size = file_path.stat().st_size
                        file_path.unlink()  # Delete file
                        deleted_count += 1
                        freed_space += file_size
                    except Exception as e:
                        self.console.print(f"[red]Error deleting {duplicate_file}: {e}[/red]")
                
                progress.advance(task)
        
        self.console.print(f"\n[bold green]✅ Deleted {deleted_count} duplicate files[/bold green]")
        self.console.print(f"[bold green]💾 Freed {self._format_bytes(freed_space)} of space[/bold green]")

    def _display_date_organization_results(self, results: Dict, dry_run: bool):
        """Display results of date-based organization."""
        moved_count = len(results['moved'])
        error_count = len(results['errors'])
        
        self.console.print(f"\n[bold]{'Would organize' if dry_run else 'Organized'} {moved_count} files by date[/bold]")
        
        if error_count > 0:
            self.console.print(f"[red]{error_count} errors occurred[/red]")
        
        # Show sample of organized files
        if results['moved']:
            self.console.print("\n[bold]Sample of organized files:[/bold]")
            for i, item in enumerate(results['moved'][:10]):
                date = item['date'].split('T')[0]  # Extract date part
                self.console.print(f"  📁 {Path(item['target']).parent} ← {Path(item['source']).name} ({date})")
            
            if moved_count > 10:
                self.console.print(f"  [dim]... and {moved_count - 10} more files[/dim]")

    def _get_transaction_history(self) -> Dict:
        """Get transaction history from database."""
        # This would query the actual database in a real implementation
        # For now, return a placeholder
        return {
            "20241201_143022": 45,
            "20241201_121045": 23,
            "20241130_095510": 67
        }

    def _view_configuration(self):
        """View current configuration."""
        config = self.organizer.config
        
        # Convert config to formatted JSON
        json_str = json.dumps(config, indent=2)
        syntax = Syntax(json_str, "json", theme="monokai", line_numbers=True)
        
        self.console.print(Panel(syntax, title="Current Configuration"))

    def _edit_configuration(self):
        """Edit configuration file."""
        config_path = self.organizer.config_path
        self.console.print(f"[bold]Configuration file:[/bold] {config_path}")
        self.console.print("Please edit the file manually and restart the application.")

    def _create_configuration(self):
        """Create new configuration interactively."""
        self.console.print("🚧 Interactive configuration creation not yet implemented.")
        self.console.print("Please edit the configuration file manually.")

    def _reset_configuration(self):
        """Reset configuration to defaults."""
        if questionary.confirm("Reset configuration to defaults? This cannot be undone.").ask():
            try:
                config_path = Path(self.organizer.config_path)
                if config_path.exists():
                    config_path.unlink()
                self.console.print("[bold green]✅ Configuration reset to defaults[/bold green]")
            except Exception as e:
                self.console.print(f"[bold red]Error resetting configuration: {e}[/bold red]")

    def _format_bytes(self, bytes_value: int) -> str:
        """Format bytes into human readable format."""
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if bytes_value < 1024.0:
                return f"{bytes_value:.1f} {unit}"
            bytes_value /= 1024.0
        return f"{bytes_value:.1f} PB"


# Click commands for non-interactive usage
@click.group()
def cli():
    """Advanced File Organizer CLI"""
    pass

@cli.command()
@click.argument('path')
@click.option('--dry-run', is_flag=True, help='Preview changes without executing')
@click.option('--no-backup', is_flag=True, help='Skip backup creation')
@click.option('--config', help='Configuration file path')
def organize(path, dry_run, no_backup, config):
    """Organize files in the specified path."""
    try:
        organizer = FileOrganizer(config)
        report = organizer.organize(path, dry_run, not no_backup)
        
        console = Console()
        console.print(f"Files processed: {report['statistics']['files_processed']}")
        console.print(f"Files moved: {report['statistics']['files_moved']}")
        console.print(f"Errors: {report['statistics']['errors']}")
        
        if dry_run:
            console.print("\n⚠️  This was a DRY RUN - no files were actually moved")
            
    except Exception as e:
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)

@cli.command()
@click.argument('path')
@click.option('--algorithm', default='md5', help='Hash algorithm (md5, sha1, sha256)')
def duplicates(path, algorithm):
    """Find duplicate files in the specified path."""
    try:
        organizer = FileOrganizer()
        duplicates_found = organizer.find_duplicates(path, algorithm)
        
        console = Console()
        if duplicates_found:
            console.print(f"Found {len(duplicates_found)} sets of duplicate files")
            for i, (hash_val, files) in enumerate(duplicates_found.items(), 1):
                if i <= 10:  # Show first 10 sets
                    console.print(f"\nSet {i}: {len(files)} files")
                    for file_path in files:
                        console.print(f"  {file_path}")
        else:
            console.print("No duplicates found!")
            
    except Exception as e:
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)

@cli.command()
def interactive():
    """Start interactive mode."""
    cli_app = FileOrganizerCLI()
    cli_app.run()


if __name__ == '__main__':
    # Check if running in interactive mode (no arguments)
    if len(sys.argv) == 1:
        cli_app = FileOrganizerCLI()
        cli_app.run()
    else:
        cli()

