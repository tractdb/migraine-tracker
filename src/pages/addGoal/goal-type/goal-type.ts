import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {GoalDetailsServiceProvider} from "../../../providers/goal-details-service/goal-details-service";
import {DataConfigPage} from "../data-config/data-config";
import {DataDetailsServiceProvider} from "../../../providers/data-details-service/data-details-service";

@Component({
  selector: 'page-goal-type',
  templateUrl: 'goal-type.html',
})

export class GoalTypePage {

  private goalList : [{[goalDetails:string]: any;}];
  private selectedGoals : string[]= [];
  private textGoals;
  private textGoalExpand = false;
  private goalsWithoutSubgoals : string[] = [];

  constructor(private navCtrl: NavController,
              private goalDetailsServiceProvider: GoalDetailsServiceProvider,
              private dataDetails: DataDetailsServiceProvider) {
    this.selectedGoals = [];
  }

  ionViewDidLoad() {
    this.goalList = this.goalDetailsServiceProvider.getGoalList();
  }

  removeAllSubgoals(subgoals){
    // if someone unselects a goal we need to unselect all the subgoals as well
    for(let i=0; i<subgoals.length; i++){
      const index = this.selectedGoals.indexOf(subgoals[i].goalID);
      if(index > -1){
        this.selectedGoals.splice(index, 1);
      }
    }
  }

  showInfo(subgoal){
    console.log(subgoal);
  }

  checkForSubgoals(goal){
    // see if there's still at least one subgoal selected for the goal; if not don't let them continue
    let subgoal = false;
    for(let i=0; i<goal.subgoals.length; i++){
      if(this.selectedGoals.indexOf(goal['goalID']) >-1){
        subgoal = true;
        break;
      }
    }
    if(!subgoal) this.goalsWithoutSubgoals.push(goal.goalID);
  }

  subgoalRequirementMet(goalID){
    const missingSubgoalIndex = this.goalsWithoutSubgoals.indexOf(goalID);
    if(missingSubgoalIndex > -1){ // if you now have a subgoal for all goals that need it, you can continue
      this.goalsWithoutSubgoals.splice(missingSubgoalIndex);
    }
  }

  addGoal(goal : {string : any}, subgoalID : string = null) {
    if(subgoalID){ // it's a subgoal
      this.selectedGoals.push(subgoalID);
      this.subgoalRequirementMet(goal['goalID']);
    }
    else{ // it's not a subgoal
      this.selectedGoals.push(goal['goalID']);
      if(goal['subgoals']){ // if it has subgoals, make sure you can't continue
        this.goalsWithoutSubgoals.push(goal['goalID']);
      }
    }
  }


  removeGoal(goal : {string:any}, subgoalID : string = null) {
    if(subgoalID){ // it's a subgoal; check if any of that goal's subgoals are still selected
      this.selectedGoals.splice(this.selectedGoals.indexOf(subgoalID), 1);
      this.checkForSubgoals(goal);
    }
    if(!subgoalID){ // it's not a subgoal; remove all of its subgoals
      this.selectedGoals.splice(this.selectedGoals.indexOf(goal['goalID']), 1);
      this.subgoalRequirementMet(goal['goalID']);
      this.removeAllSubgoals(goal['subgoals']);
    }
  }


  continueSetup() {
    let dataToSend = {'goalIDs': this.selectedGoals, 'textGoals': this.textGoals};

    let configData = this.dataDetails.findNextConfigData(this.selectedGoals, '');

    if (configData!== null){
      dataToSend['dataPage'] = configData;
      this.navCtrl.push(DataConfigPage, dataToSend);
    }

    else{
      let error = new Error("All data conditional, no conditions met.");
      throw(error);
    }

  }
}
