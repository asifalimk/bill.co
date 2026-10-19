import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationPipe } from '../translation.service';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-purchases',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslationPipe],
  templateUrl: './purchases.component.html'
})
export class PurchasesComponent {
  @Input({ required: true }) vm!: AppComponent;
}
