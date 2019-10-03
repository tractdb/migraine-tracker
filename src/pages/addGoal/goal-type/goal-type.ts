import { Component } from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {GoalDetailsServiceProvider} from "../../../providers/goal-details-service/goal-details-service";
import {DataConfigPage} from "../data-config/data-config";
import {DataDetailsServiceProvider} from "../../../providers/data-details-service/data-details-service";
import {CouchDbServiceProvider} from "../../../providers/couch-db-service/couch-db-service";
import {GoalModificationPage} from "../../goal-modification/goal-modification";
import {Goal} from "../../../interfaces/customTypes";

@Component({
  selector: 'page-goal-type',
  templateUrl: 'goal-type.html',
})

export class GoalTypePage {

  private goalList : Goal[];
  private modifying : boolean = false;
  private selectedGoals : string[]= [];
  private textGoals : string;
  private textGoalExpand : boolean = false;
  private goalsWithoutSubgoals : string[] = [];

  constructor(private navCtrl: NavController, public navParams: NavParams,
              private couchDBService: CouchDbServiceProvider,
              private goalDetailsServiceProvider: GoalDetailsServiceProvider,
              private dataDetails: DataDetailsServiceProvider) {
  }

  ionViewDidLoad() {
    this.modifying = this.navParams.data['modifying'];
    let activeGoals = this.couchDBService.getActiveGoals();
    if(activeGoals !== null){
      this.selectedGoals = activeGoals['goals'];
      this.textGoals = activeGoals.textGoals;
      this.textGoalExpand = true;
    }
    this.goalList = this.goalDetailsServiceProvider.getGoalList();
  }

  removeAllSubgoals(subgoals : Goal[]){
    // if someone unselects a goal we need to unselect all the subgoals as well
    for(let i=0; i<subgoals.length; i++){
      const index = this.selectedGoals.indexOf(subgoals[i].goalID);
      if(index > -1){
        this.selectedGoals.splice(index, 1);
      }
    }
  }

  showInfo(subgoal : Goal){
    console.log(subgoal);
  }

  checkForSubgoals(goal : Goal){
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

  subgoalRequirementMet(goalID : string){
    const missingSubgoalIndex = this.goalsWithoutSubgoals.indexOf(goalID);
    if(missingSubgoalIndex > -1){ // if you now have a subgoal for all goals that need it, you can continue
      this.goalsWithoutSubgoals.splice(missingSubgoalIndex);
    }
  }

  addGoal(goal : Goal, subgoalID : string = null) {
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


  removeGoal(goal : Goal, subgoalID : string = null) {
    if(subgoalID){ // it's a subgoal; check if any of that goal's subgoals are still selected
      this.selectedGoals.splice(this.selectedGoals.indexOf(subgoalID), 1);
      this.checkForSubgoals(goal);
    }
    if(!subgoalID){ // it's not a subgoal; remove all of its subgoals
      console.log(goal)
      this.selectedGoals.splice(this.selectedGoals.indexOf(goal['goalID']), 1);
      this.subgoalRequirementMet(goal['goalID']);
      if(goal['subgoals']) this.removeAllSubgoals(goal['subgoals']);
    }
  }


  continueSetup(exit=false) {
    let dataToSend = {'goalIDs': this.selectedGoals, 'textGoals': this.textGoals};

    if(exit){
      dataToSend['goalsOnly'] = true;
      this.navCtrl.setRoot(GoalModificationPage, dataToSend);
    }

    else{
      let configData = this.dataDetails.findNextConfigData(this.selectedGoals, null);

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


}
