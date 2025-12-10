import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * ModalService
 *
 * State management for community modals
 *
 * Manages visibility state for:
 * - Create post modal
 * - (Extensible for other community modals)
 *
 * Uses BehaviorSubject for reactive state management
 */
@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private showCreatePostSubject = new BehaviorSubject<boolean>(false);
  public showCreatePost$ = this.showCreatePostSubject.asObservable();

  /** Open create post modal */
  openCreatePost(): void {
    this.showCreatePostSubject.next(true);
  }

  /** Close create post modal */
  closeCreatePost(): void {
    this.showCreatePostSubject.next(false);
  }

  /** Get current create post modal state */
  get showCreatePost(): boolean {
    return this.showCreatePostSubject.value;
  }
}
