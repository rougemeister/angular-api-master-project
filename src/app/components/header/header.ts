import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header{

  router = inject(Router)
  @Output() createPost = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();
  @Output() categoryChange = new EventEmitter<string>();

  searchTerm: string = '';
  selectedCategory: string = '';

  categories: string[] = ['Technology', 'Lifestyle', 'Business', 'Education', 'Entertainment'];

  onSearch(): void {
    this.search.emit(this.searchTerm);
  }

 

  triggerCreate(): void {
    this.createPost.emit();
  }

  login(): void {
    this.router.navigate(['/login'])
  }
}
