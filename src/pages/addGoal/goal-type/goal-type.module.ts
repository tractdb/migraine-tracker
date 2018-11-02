import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GoalTypePage } from './goal-type';

@NgModule({
  declarations: [
    GoalTypePage,
  ],
  imports: [
    IonicPageModule.forChild(GoalTypePage),
  ],
})
export class GoalTypePageModule {}
