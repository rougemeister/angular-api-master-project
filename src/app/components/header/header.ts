import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent {
  @Output() createPost = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();
  @Output() categoryChange = new EventEmitter<string>();

  searchTerm: string = '';
  selectedCategory: string = '';

  categories: string[] = ['Technology', 'Lifestyle', 'Business', 'Education', 'Entertainment'];

  onSearch(): void {
    this.search.emit(this.searchTerm);
  }

  onCategoryChange(): void {
    this.categoryChange.emit(this.selectedCategory);
  }

  triggerCreate(): void {
    this.createPost.emit();
  }
}
