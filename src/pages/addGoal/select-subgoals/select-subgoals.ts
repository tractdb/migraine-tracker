import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {GlobalFunctionsServiceProvider} from "../../../providers/global-functions-service/global-functions-service";
import {EnterTextGoalPage} from "../enter-text-goal/enter-text-goal";

/**
 * Generated class for the SelectSubgoalsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-select-subgoals',
  templateUrl: 'select-subgoals.html',
})
export class SelectSubgoalsPage {

  private subgoalDict;
  private pageTitle;
  private subgoals;
  private selectedSubgoals;
  private configPath;
  private goalType;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public globalFunctions: GlobalFunctionsServiceProvider) {
    this.selectedSubgoals = [];
  }

  ionViewDidLoad() {
    this.goalType = this.navParams.data['unseenSubgoals'][0]["goal"].split(" ")[0];
    this.subgoalDict = this.navParams.data['unseenSubgoals'][0]["subgoals"];
    this.pageTitle = this.subgoalDict['Title']; // because of an incomprehensible error when I try to just use the dict
    this.subgoals = this.subgoalDict['subgoals'];
    for(let i=0; i<this.subgoals.length; i++){
      this.subgoals[i].colors = this.globalFunctions.buttonColors(false);
    }
    this.configPath = this.navParams.data['configPath'];
  }

  addGoal(subgoal){
    if (this.selectedSubgoals.indexOf(subgoal.subgoalName) < 0 ) {
      this.selectedSubgoals.push(subgoal.subgoalName);
    }
    subgoal.colors = this.globalFunctions.buttonColors(true);
  }


  removeGoal(subgoal) {
    const index = this.selectedSubgoals.indexOf(subgoal.subgoalName);
    if (index > -1) {
      this.selectedSubgoals.splice(index, 1);
    }
    subgoal.colors = this.globalFunctions.buttonColors(false);
  }

  continueSetup() {
    let configStep = {"step": this.goalType.toLowerCase()+"Subgoal",
      "description": "Selected " + this.goalType + " Subgoals",
      "added": this.selectedSubgoals};
    configStep = this.globalFunctions.toggleDetails(configStep);
    this.navParams.data.configPath.push(configStep);
    this.navParams.data['unseenSubgoals'].splice(0,1);
    if(this.navParams.data['unseenSubgoals'].length > 0){
      this.navCtrl.push(SelectSubgoalsPage, this.navParams.data);
    }
    else{
      this.navCtrl.push(EnterTextGoalPage, this.navParams.data);
    }
  }


  toggleDetails(configStep) {
    this.globalFunctions.toggleDetails(configStep);
  }




}
