import { Component, inject, OnInit} from '@angular/core';
import { PostWithImage } from '../../core/model/model';
import { ApiService } from '../../core/services/api-service';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-detail-post',
  imports: [],
  templateUrl: './detail-post.html',
  styleUrl: './detail-post.scss'
})
export class DetailPost implements OnInit {
  post: PostWithImage | undefined;
  apiService = inject(ApiService);
  route = inject(ActivatedRoute);
  router = inject(Router)

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.apiService.getPostByIdWithImageAndComments(+id).subscribe((post) => {
        this.post = post;
      });
    }

  }
  
 goToEditPost(): void {
    if (this.post && this.post.id !== undefined) {
      this.router.navigate(['/edit', this.post.id]);
    }
}
  goBack():void {
    this.router.navigate(['posts'])
  }
  deletePost() {
    if (this.post && this.post.id !== undefined) {
      this.apiService.deletePost(this.post.id);
    }
  }
}
