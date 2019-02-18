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
  activeGoals;
  goalHierarchy;
  goalTypes;
  textGoals;
  editingTextGoal = false;
  newTextGoals;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public couchDBService: CouchDbServiceProvider,
              public globalFunctionsService: GlobalFunctionsServiceProvider) {
  }

  ionViewDidLoad() {
    this.activeGoals = this.couchDBService.getActiveGoals();
    this.textGoals = this.activeGoals.textGoals;
    this.goalHierarchy = this.globalFunctionsService.getGoalHierarchy(this.activeGoals.goals);
    this.goalTypes = Object.keys(this.goalHierarchy);
    console.log(this.goalHierarchy);
  }

  addGoal() {
    this.navCtrl.push(GoalTypePage);
  }


  deleteGoal(goal) {
    this.activeGoals.goals.splice(goal);
    this.couchDBService.removeGoal(goal);
  }



  deleteTextGoal(){
    this.textGoals = "";
    this.couchDBService.removeGoal('textGoal');
  }


  saveTextGoal(){
    this.couchDBService.editTextGoal(this.textGoals);
    this.textGoals = this.newTextGoals;
    this.editingTextGoal = !this.editingTextGoal;

  }

  editTextGoal(){
    this.editingTextGoal = !this.editingTextGoal;
  }

}
