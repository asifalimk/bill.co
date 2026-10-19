import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationPipe } from '../translation.service';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-sales-return',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslationPipe],
  templateUrl: './sales-return.component.html'
})
export class SalesReturnComponent {
  @Input({ required: true }) vm!: AppComponent;
}
