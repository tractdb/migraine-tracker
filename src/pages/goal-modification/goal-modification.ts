import { Component } from '@angular/core';
import {ModalController, NavController, NavParams} from 'ionic-angular';
import {CouchDbServiceProvider} from "../../providers/couch-db-service/couch-db-service";
import {GoalTypePage} from "../addGoal/goal-type/goal-type";
import {GlobalFunctionsServiceProvider} from "../../providers/global-functions-service/global-functions-service";



@Component({
  selector: 'page-goal-modification',
  templateUrl: 'goal-modification.html',
})
export class GoalModificationPage {
  private goalTypes : string[];
  private goalHierarchy;
  private textGoals : string;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public couchDBService: CouchDbServiceProvider,
              public globalFunctionsService: GlobalFunctionsServiceProvider) {
  }

  ionViewDidLoad() {
    if(this.navParams.data.goalsOnly){

      this.textGoals = this.navParams.data.textGoals;
      this.goalHierarchy = this.globalFunctionsService.getGoalHierarchy(this.navParams.data.goalIDs);
      this.goalTypes = Object.keys(this.goalHierarchy);
      this.couchDBService.modifyGoals(this.navParams.data);
    }
    else{
      let activeGoals;
      if(this.navParams.data.configPath){ //todo: notification stuff
        activeGoals = this.couchDBService.addGoalFromSetup(this.navParams.data);
      }
      else{
        activeGoals = this.couchDBService.getActiveGoals();
      }
      this.textGoals = activeGoals.textGoals;
      this.goalHierarchy = this.globalFunctionsService.getGoalHierarchy(activeGoals.goals);
      this.goalTypes = Object.keys(this.goalHierarchy);
    }
  }

  addGoal() {
    this.navCtrl.push(GoalTypePage, {'modifying':true});

  }

}
