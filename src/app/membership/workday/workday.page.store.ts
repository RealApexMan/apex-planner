import { computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Workday } from '@app/core/entity/workday';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { Subject, takeUntil, timer } from 'rxjs';
import {
  getActivePomodoroIndex,
  getActiveTask,
  getActiveTaskIndex,
  getTaskEmojiStatus,
  isTaskCompleted,
  MAXIMUM_POMODORO_DURATION,
  PomodoroList,
  Task,
  TaskList,
} from './task.model';

interface WorkdayState {
  workday: Workday;
  progress: number;
}

export const WorkdayStore = signalStore(
  withState<WorkdayState>({
    workday: Workday.createEmpty(),
    progress: 0,
  }),
  withProps(() => ({
    destroyRef: inject(DestroyRef),
    /*
     * Using Subject for intra-store event.
     */
    pomodoroCompleted: new Subject<void>(),
  })),
  withComputed((state) => {
    const pomodoroProgress = computed(() => {
      return Math.floor((state.progress() / MAXIMUM_POMODORO_DURATION) * 100);
    });

    return {
      pomodoroProgress,
    };
  }),
  withMethods(({ destroyRef, pomodoroCompleted, ...store }) => ({
    startWorkday() {
      patchState(store, ({ workday }) => ({
        workday: workday.setExecutionMode(),
      }));
      timer(0, 1000)
        .pipe(takeUntil(pomodoroCompleted), takeUntilDestroyed(destroyRef))
        .subscribe((elapsedSeconds: number) => {
          patchState(store, { progress: elapsedSeconds });
          patchState(store, (state) => {
            // Update current pomodoro time immutably so signals detect the change
            const task = getActiveTask(state.taskList);
            const taskIndex = getActiveTaskIndex(state.taskList);

            if (!task) {
              throw new Error('No active task found');
            }

            const pomodoroIndex = getActivePomodoroIndex(task);

            if (pomodoroIndex === -1) {
              throw new Error('No active pomodoro found');
            }

            // Create a new pomodoro list and a new task object (immutable update)
            const newPomodoroList = [...task.pomodoroList] as PomodoroList;
            newPomodoroList[pomodoroIndex] = elapsedSeconds;

            const updatedTask: Task = {
              ...task,
              pomodoroList: newPomodoroList,
              statusEmoji: getTaskEmojiStatus({
                ...task,
                pomodoroList: newPomodoroList,
              }),
            };

            const taskList: TaskList = store.taskList().toSpliced(taskIndex, 1, updatedTask);

          patchState(store, ({ workday }) => {
            return { workday: workday.tick() };
          });
        });
    },
    addTask() {
      patchState(store, ({ workday }) => ({
        workday: workday.addEmptyTask(),
      }));
    },
    removeTask(index: number) {
      patchState(store, ({ workday }) => ({
        workday: workday.removeTask(index),
      }));
    },
    updateDate(event: Event) {
      const date = (event.target as HTMLInputElement).value;
      patchState(store, ({ workday }) => ({
        workday: workday.createEmptyAtDate(date),
      }));
    },
    updateTask(index: number, updatedTask: Task) {
      patchState(store, ({ workday }) => ({
        workday: workday.updateTask(index, updatedTask),
      }));
    },
    // TODO: Persist current Workday on Firestore.
    // saveWorkday(workday: Workday): Observable<void> {
    //   console.log('Workday saved!', workday);
    //   return of(undefined);
    // },
  }))
);
