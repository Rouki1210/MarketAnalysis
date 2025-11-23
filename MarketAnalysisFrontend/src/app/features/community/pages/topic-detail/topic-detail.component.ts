import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunityService } from '../../services/community.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';

interface CommentItem {
  id: string;
  author: string;
  avatar?: string;
  text: string;
  createdAt: string;
}

@Component({
  selector: 'app-topic-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <ng-container *ngIf="postExists(); else notFound">
      <article class="space-y-6">
        <div class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
          <h1 class="text-2xl font-bold text-white mb-2">{{ title() }}</h1>
          <p class="text-gray-400 text-sm">{{ createdAt() }}</p>
          <p class="text-gray-200 mt-4">{{ content() }}</p>

          <div class="flex items-center gap-4 mt-4">
            <button (click)="toggleLike()" [class]="likeClasses()">
              <span class="mr-1">{{ liked() ? '❤️' : '🤍' }}</span>{{ likes() }}
            </button>
            <button (click)="toggleBookmark()" [class]="bookmarkClasses()">
              <span class="mr-1">{{ bookmarked() ? '🔖' : '📖' }}</span>{{ bookmarks() }}
            </button>
          </div>
        </div>

        <section class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
          <h2 class="text-white font-semibold mb-4">Comments ({{ comments().length }})</h2>

          <form (submit)="addComment($event)" class="flex items-center gap-3 mb-6">
            <input
              [(ngModel)]="newComment"
              name="comment"
              type="text"
              placeholder="Write a comment..."
              class="flex-1 bg-black/30 border border-purple-500/20 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500"
            />
            <button class="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">Comment</button>
          </form>

          <div class="space-y-4">
            <div *ngFor="let c of comments()" class="flex items-start gap-3">
              <div class="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-lg">{{ c.avatar || '🙂' }}</div>
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-white font-medium text-sm">{{ c.author }}</span>
                  <span class="text-gray-400 text-xs">{{ c.createdAt }}</span>
                </div>
                <p class="text-gray-200">{{ c.text }}</p>
              </div>
            </div>
          </div>
        </section>
      </article>
    </ng-container>

    <ng-template #notFound>
      <div class="text-center py-12">
        <h2 class="text-2xl text-white font-semibold mb-2">Post not found</h2>
        <p class="text-gray-400">The post you are looking for does not exist.</p>
      </div>
    </ng-template>
  `,
  styles: []
})
export class TopicDetailComponent implements OnInit {
  postExists = signal(true);
  title = signal('');
  content = signal('');
  createdAt = signal('');
  likes = signal(0);
  bookmarks = signal(0);
  liked = signal(false);
  bookmarked = signal(false);

  comments = signal<CommentItem[]>([]);
  newComment = '';

  constructor(private route: ActivatedRoute, private communityService: CommunityService) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.loadPost(parseInt(id));
    const dataset: Record<string, { title: string; content: string; createdAt: string; likes: number; bookmarks: number; }> = {};

    const data = dataset[id];
    if (!data) {
      this.postExists.set(false);
      return;
    }

    this.title.set(data.title);
    this.content.set(data.content);
    this.createdAt.set(data.createdAt);
    this.likes.set(data.likes);
    this.bookmarks.set(data.bookmarks);
  }

  loadPost(id: number): void {
    // Simulated data loading logic
    this.communityService.getPostById(id).subscribe(post => {
      console.log('Loaded post:', post);
      if (post) {
        this.title.set(post.title);
        this.content.set(post.content);
        this.createdAt.set(post.createdAt);
        this.likes.set(post.likes);
        this.bookmarks.set(post.bookmarks);
        this.liked.set(post.isLiked || false);
        this.bookmarked.set(post.isBookmarked || false);
      } else {
        this.postExists.set(false);
      }
    });

  }

  likeClasses = signal('');
  bookmarkClasses = signal('');

  ngDoCheck(): void {
    this.likeClasses.set(
      `flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${this.liked() ? 'text-red-400 bg-red-400/10' : 'text-gray-400 hover:text-white hover:bg-white/10'
      }`
    );

    this.bookmarkClasses.set(
      `flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${this.bookmarked() ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-400 hover:text-white hover:bg-white/10'
      }`
    );
  }

  toggleLike(): void {
    this.liked.set(!this.liked());
    this.likes.set(this.likes() + (this.liked() ? 1 : -1));
  }

  toggleBookmark(): void {
    this.bookmarked.set(!this.bookmarked());
    this.bookmarks.set(this.bookmarks() + (this.bookmarked() ? 1 : -1));
  }

  addComment(event: Event): void {
    event.preventDefault();
    const text = this.newComment.trim();
    if (!text) return;
    const currentComments = this.comments();
    this.comments.set([
      { id: `c${Date.now()}`, author: 'You', avatar: '🫵', text, createdAt: 'Just now' },
      ...currentComments
    ]);
    this.newComment = '';
  }
}

