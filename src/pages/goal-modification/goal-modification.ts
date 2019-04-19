import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {CouchDbServiceProvider} from "../../providers/couch-db-service/couch-db-service";
import {GoalTypePage} from "../addGoal/goal-type/goal-type";
import {GlobalFunctionsServiceProvider} from "../../providers/global-functions-service/global-functions-service";

/**
 * Generated class for the GoalModificationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-goal-modification',
  templateUrl: 'goal-modification.html',
})
export class GoalModificationPage {
  activeGoals : {[goalProps: string] : any};
  goalTypes : string[];
  goalHierarchy;
  textGoals : string;
  editingTextGoal : boolean = false;
  oldTextGoals : string;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public couchDBService: CouchDbServiceProvider,
              public globalFunctionsService: GlobalFunctionsServiceProvider) {
  }

  ionViewDidLoad() {
    if(this.navParams.data.configPath){ //todo: notification stuff
      this.activeGoals = this.couchDBService.addGoalFromSetup(this.navParams.data);
    }
    else{
      this.activeGoals = this.couchDBService.getActiveGoals();
    }
    this.textGoals = this.activeGoals.textGoals;
    this.goalHierarchy = this.globalFunctionsService.getGoalHierarchy(this.activeGoals.goals);
    this.goalTypes = Object.keys(this.goalHierarchy);
  }

  addGoal() {
    this.navCtrl.push(GoalTypePage);
  }


  deleteGoal(goal) {
    // todo: push to couch, etc.
    this.activeGoals.goals.splice(this.activeGoals.goals.indexOf(goal), 1);
    this.couchDBService.removeGoal(goal);
    if(goal in this.goalHierarchy){
      delete(this.goalHierarchy[goal]);
      this.goalTypes = Object.keys(this.goalHierarchy);
    }
    else{
      for(let i=0; i<this.goalTypes.length; i++){
        console.log(this.goalHierarchy[this.goalTypes[i]])
        let subgoalIndex = this.goalHierarchy[this.goalTypes[i]].indexOf(goal);
        if(subgoalIndex > -1){
          this.goalHierarchy[this.goalTypes[i]].splice(subgoalIndex, 1);
          if(this.goalHierarchy[this.goalTypes[i]].length === 0){
            delete(this.goalHierarchy[this.goalTypes[i]]);
            this.goalTypes = Object.keys(this.goalHierarchy);
          }
          break;
        }
      }
    }
  }



  deleteTextGoal(){
    this.textGoals = "";
    this.oldTextGoals = "";
    this.couchDBService.removeGoal('textGoal');
  }

  cancelNewTextGoal() {
    this.editingTextGoal = !this.editingTextGoal;
    this.textGoals = this.oldTextGoals;
  }


  saveTextGoal(){
    this.couchDBService.editTextGoal(this.textGoals);
    this.editingTextGoal = !this.editingTextGoal;

  }

  editTextGoal(){
    this.oldTextGoals = this.textGoals;
    this.editingTextGoal = !this.editingTextGoal;
  }

}
