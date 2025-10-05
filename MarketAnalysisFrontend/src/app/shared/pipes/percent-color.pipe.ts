import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'percentColor',
  standalone: true
})
export class PercentColorPipe implements PipeTransform {
  transform(value: string | number, returnClass: boolean = true): string {
    const numValue = typeof value === 'string' 
      ? parseFloat(value.replace(/[^0-9.-]/g, '')) 
      : value;

    if (isNaN(numValue)) return returnClass ? 'text-muted-foreground' : 'muted';

    if (returnClass) {
      return numValue >= 0 ? 'text-secondary' : 'text-accent';
    } else {
      return numValue >= 0 ? 'secondary' : 'accent';
    }
  }
}

