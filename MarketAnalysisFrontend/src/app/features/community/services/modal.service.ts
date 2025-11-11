import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private showCreatePostSubject = new BehaviorSubject<boolean>(false);
  public showCreatePost$ = this.showCreatePostSubject.asObservable();

  openCreatePost(): void {
    this.showCreatePostSubject.next(true);
  }

  closeCreatePost(): void {
    this.showCreatePostSubject.next(false);
  }

  get showCreatePost(): boolean {
    return this.showCreatePostSubject.value;
  }
}

