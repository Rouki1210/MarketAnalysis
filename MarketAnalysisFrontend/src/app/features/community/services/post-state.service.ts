import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Post } from '../models/post.model';

/**
 * PostStateService
 *
 * Reactive state management for community posts
 *
 * Features:
 * - Centralized post list state
 * - Filter selection state (trending/new/top)
 * - Add/update/remove post operations
 * - Observable streams for reactive UI updates
 *
 * Used by post-related components for shared state
 */
@Injectable({
  providedIn: 'root',
})
export class PostStateService {
  private postsSubject = new BehaviorSubject<Post[]>([]);
  private selectedFilterSubject = new BehaviorSubject<string>('trending');

  public posts$ = this.postsSubject.asObservable();
  public selectedFilter$ = this.selectedFilterSubject.asObservable();

  get posts(): Post[] {
    return this.postsSubject.value;
  }

  get selectedFilter(): string {
    return this.selectedFilterSubject.value;
  }

  setPosts(posts: Post[]): void {
    this.postsSubject.next(posts);
  }

  setSelectedFilter(filter: string): void {
    this.selectedFilterSubject.next(filter);
  }

  addPost(post: Post): void {
    const currentPosts = this.postsSubject.value;
    this.postsSubject.next([post, ...currentPosts]);
  }

  updatePost(id: string, updatedData: Partial<Post>): void {
    const currentPosts = this.postsSubject.value;
    const updatedPosts = currentPosts.map((post) =>
      post.id === id ? { ...post, ...updatedData } : post
    );
    this.postsSubject.next(updatedPosts);
  }

  removePost(id: string): void {
    const currentPosts = this.postsSubject.value;
    const filteredPosts = currentPosts.filter((post) => post.id !== id);
    this.postsSubject.next(filteredPosts);
  }
}
