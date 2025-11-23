import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TaskFieldDumbComponent } from './task-field/task-field.dumb.component';
import { WorkdayStore } from './workday.page.store';

@Component({
  selector: 'app-workday',
  imports: [TaskFieldDumbComponent],
  templateUrl: './workday.page.component.html',
  styleUrl: './workday.page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [WorkdayStore],
})
export class WorkdayPageComponent {
  readonly store = inject(WorkdayStore);
}
