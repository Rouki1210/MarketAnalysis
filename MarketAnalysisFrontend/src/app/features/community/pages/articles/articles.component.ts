import { Component, signal, OnInit, DoCheck } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Article } from '../../models/post.model';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl font-bold text-foreground">Articles</h1>
          <p class="text-muted-foreground mt-1">Latest insights on coins and the market</p>
        </div>
      </div>

      <!-- Category Filter -->
      <div class="flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
        <button
          *ngFor="let category of categories"
          (click)="selectedCategory.set(category)"
          [class.bg-primary]="selectedCategory() === category"
          [class.text-primary-foreground]="selectedCategory() === category"
          [class.bg-muted]="selectedCategory() !== category"
          [class.text-muted-foreground]="selectedCategory() !== category"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
        >
          {{ category }}
        </button>
      </div>

      <!-- Articles Grid -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          *ngFor="let article of filteredArticles()"
          (click)="openArticle(article)"
          class="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors cursor-pointer group"
        >
          <!-- Category Badge -->
          <div class="flex items-center justify-between mb-4">
            <span 
              class="text-xs px-3 py-1 rounded-full font-medium"
              [ngClass]="{
                'bg-blue-500/20 text-blue-400': article.category === 'Coin',
                'bg-purple-500/20 text-purple-400': article.category === 'Market',
                'bg-green-500/20 text-green-400': article.category === 'Education'
              }"
            >
              {{ article.category }}
            </span>
          </div>

          <!-- Article Content -->
          <h3 class="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
            {{ article.title }}
          </h3>
          <p class="text-sm text-muted-foreground line-clamp-3">
            {{ article.summary }}
          </p>

          <!-- Read More -->
          <div class="mt-4 flex items-center text-primary text-sm font-medium">
            <span>Read more</span>
            <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="filteredArticles().length === 0" class="text-center py-16">
        <div class="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-foreground mb-2">No articles found</h3>
        <p class="text-muted-foreground">Try selecting a different category</p>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class ArticlesComponent implements OnInit, DoCheck {
  selectedCategory = signal<string>('All');
  categories = ['All', 'Coin', 'Market', 'Education'];

  articles: Article[] = [
    {
      id: 'a1',
      title: 'Understanding Bitcoin Halvings and Market Impact',
      summary: 'A comprehensive look at Bitcoin halving cycles and how they historically affect price action and market sentiment.',
      category: 'Coin'
    },
    {
      id: 'a2',
      title: 'DeFi Protocols: A Beginner Guide',
      summary: 'Learn about decentralized finance protocols, how they work, and why they are revolutionizing traditional finance.',
      category: 'Education'
    },
    {
      id: 'a3',
      title: 'Market Analysis: Q1 2024 Crypto Trends',
      summary: 'Analyzing the major trends and movements in the cryptocurrency market during the first quarter of 2024.',
      category: 'Market'
    },
    {
      id: 'a4',
      title: 'Ethereum 2.0: What You Need to Know',
      summary: 'Everything about Ethereum transition to proof-of-stake and what it means for investors and developers.',
      category: 'Coin'
    },
    {
      id: 'a5',
      title: 'Technical Analysis Basics for Crypto Trading',
      summary: 'Master the fundamentals of technical analysis to make better trading decisions in the crypto market.',
      category: 'Education'
    },
    {
      id: 'a6',
      title: 'Altcoin Season: Indicators and Strategies',
      summary: 'Identify altcoin season patterns and learn strategies to capitalize on these market cycles.',
      category: 'Market'
    },
    {
      id: 'a7',
      title: 'Solana Ecosystem: Top Projects to Watch',
      summary: 'Explore the fastest-growing projects in the Solana ecosystem and their potential impact.',
      category: 'Coin'
    },
    {
      id: 'a8',
      title: 'Crypto Security: Protecting Your Assets',
      summary: 'Essential security practices every crypto investor should follow to keep their assets safe.',
      category: 'Education'
    },
    {
      id: 'a9',
      title: 'Institutional Adoption: The New Bull Market Driver',
      summary: 'How institutional investment is reshaping the cryptocurrency market landscape.',
      category: 'Market'
    }
  ];

  constructor(private router: Router) {}

  filteredArticles = signal<Article[]>(this.articles);

  ngOnInit(): void {
    this.updateFilteredArticles();
  }

  ngDoCheck(): void {
    this.updateFilteredArticles();
  }

  private updateFilteredArticles(): void {
    const category = this.selectedCategory();
    if (category === 'All') {
      this.filteredArticles.set(this.articles);
    } else {
      this.filteredArticles.set(
        this.articles.filter(a => a.category === category)
      );
    }
  }

  openArticle(article: Article): void {
    this.router.navigate(['/community/articles', article.id]);
  }
}

