import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../common/button.component';
import { Post } from '../../models/post.model';
import { PostService } from '../../services/post.service';
import { CreatePostDto } from '../../services/community.service';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" (click)="close.emit()">
      <div class="bg-slate-800 border border-purple-500/20 rounded-xl p-6 w-full max-w-md mx-4" (click)="$event.stopPropagation()">
        <h2 class="text-white font-semibold mb-4">Create New Post</h2>
        
        <form (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <label class="block text-gray-300 text-sm mb-2">Title</label>
            <input
              [(ngModel)]="postData.title"
              name="title"
              type="text"
              class="w-full bg-white/10 border border-purple-500/30 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              placeholder="Post title"
              required>
          </div>
          
          <div class="mb-4">
            <label class="block text-gray-300 text-sm mb-2">Content</label>
            <textarea
              [(ngModel)]="postData.content"
              name="content"
              rows="4"
              class="w-full bg-white/10 border border-purple-500/30 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              placeholder="What's on your mind?"
              required></textarea>
          </div>
          
          <div class="mb-6">
            <label class="block text-gray-300 text-sm mb-2">Tags (comma separated)</label>
            <input
              [(ngModel)]="tagsInput"
              name="tags"
              type="text"
              class="w-full bg-white/10 border border-purple-500/30 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              placeholder="BTC, ETH, Analysis">
          </div>
          
          <div class="flex gap-3">
            <app-button type="submit" [disabled]="!postData.title || !postData.content">
              Create Post
            </app-button>
            <app-button type="button" variant="ghost" (onClick)="close.emit()">
              Cancel
            </app-button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class CreatePostComponent {
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<Partial<Post>>();

  postData: Partial<Post> = {
    title: '',
    content: '',
    tags: []
  };
  tagsInput = '';

  constructor(private postService: PostService) {}

  onSubmit(): void {
    if (!this.postData.title || !this.postData.content) {
      return;
    }
    this.postData.tags = this.tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
    this.submit.emit(this.postData);
    const payload : CreatePostDto ={
      title: this.postData.title || '',
      content: this.postData.content || '',
      topicIds: []
    };
    this.postService.createPost(payload).subscribe({
      next: (post) => {
        console.log('✅ Post created:', post);
        this.resetForm();
        this.close.emit();
      },
      error: (error) => {
        console.error('❌ Error creating post:', error);
      }
    });
    // Close modal after submitting
  }

  private resetForm(): void {
    this.postData = {
      title: '',
      content: '',
      tags: []
    };
    this.tagsInput = '';
  }
}

