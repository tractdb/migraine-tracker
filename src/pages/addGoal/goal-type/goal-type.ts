import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {GoalDetailsServiceProvider} from "../../../providers/goal-details-service/goal-details-service";
import {SelectSubgoalsPage} from "../select-subgoals/select-subgoals";
import {GlobalFunctionsServiceProvider} from "../../../providers/global-functions-service/global-functions-service";
import {EnterTextGoalPage} from "../enter-text-goal/enter-text-goal";
import {DataDetailsServiceProvider} from "../../../providers/data-details-service/data-details-service";


@Component({
  selector: 'page-goal-type',
  templateUrl: 'goal-type.html',
})
export class GoalTypePage {


  private goalList;
  private selectedGoals;


  constructor(public navCtrl: NavController,
              public goalDetailsServiceProvider: GoalDetailsServiceProvider,
              public globalFunctions: GlobalFunctionsServiceProvider) {
    this.selectedGoals = [];
  }

  ionViewDidLoad() {
    this.goalDetailsServiceProvider.getGoalData().subscribe(goalData => {
      this.goalList = goalData;
      this.goalDetailsServiceProvider.setGoalList(this.goalList);
      for(let i=0;i<this.goalList.length; i++){
        this.goalList[i].colors = this.globalFunctions.buttonColors(false);
      }
    },
    error => {
      console.log(error);
    });
  }

  addGoal(goal){
    if (this.selectedGoals.indexOf(goal.goalName) < 0 ) {
      this.selectedGoals.push(goal.goalName);
    }
    goal.colors = this.globalFunctions.buttonColors(true);
  }


  removeGoal(goal) {
    const index = this.selectedGoals.indexOf(goal.goalName);
    if (index > -1) {
      this.selectedGoals.splice(index, 1);
    }
    goal.colors = this.globalFunctions.buttonColors(false);
  }


  continueSetup() {
    this.selectedGoals.sort();
    let configStep = {"step": "goalType", "description": "Selected Goals", "added": this.selectedGoals};
    configStep = this.globalFunctions.toggleDetails(configStep);
    let dataToSend = {"configPath": [configStep]};
    let allSubgoals = [];
    for(let i=0; i<this.selectedGoals.length; i++){
      let subgoals = this.goalDetailsServiceProvider.getSubgoalByName(this.selectedGoals[i]);
      if(subgoals !== null){
        allSubgoals.push({"goal": this.selectedGoals[i], "subgoals": subgoals});
      }
    }

    if(allSubgoals.length > 0){
      dataToSend['allSubgoals'] = allSubgoals;
      dataToSend['currentSubgoal'] = allSubgoals[0];
      this.navCtrl.push(SelectSubgoalsPage, dataToSend);
    }
    else{
      this.navCtrl.push(EnterTextGoalPage, dataToSend);
    }
  }
}
