import { Component } from '@angular/core';
import { Input } from '@angular/core';
import {  PostWithImage } from '../../core/model/model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-posts',
  imports: [CommonModule],
  templateUrl: './posts.html',
  styleUrl: './posts.scss'
})
export class Posts {
  @Input() 
  post!: PostWithImage

}
