import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationPipe } from '../translation.service';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-pos-counter',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslationPipe],
  templateUrl: './pos-counter.component.html'
})
export class PosCounterComponent {
  @Input({ required: true }) vm!: AppComponent;
}
