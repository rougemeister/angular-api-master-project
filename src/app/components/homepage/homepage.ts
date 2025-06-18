import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { OnInit, inject } from '@angular/core';   
import { ApiService } from '../../core/services/api-service';
import { Post, PostWithImage } from '../../core/model/model';
import { Posts } from "../posts/posts";
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-homepage',
  imports: [Posts, AsyncPipe],
  templateUrl: './homepage.html',
  styleUrl: './homepage.scss'
})
export class Homepage implements OnInit {
 posts$!: Observable<PostWithImage[]>;
  apiService: ApiService = inject(ApiService);

  ngOnInit(): void { 
    this.posts$ = this.apiService.getPostsWithImages();
  
  }
}
