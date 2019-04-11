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
  private currentSubgoal : {[goalProp: string] : any} = {};
  private selectedSubgoals : string[] = [];
  private goalType : string;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public globalFunctions: GlobalFunctionsServiceProvider) {
  }

  ionViewDidLoad() {
    this.currentSubgoal = this.navParams.data['currentSubgoal'];
    this.goalType = this.navParams.data['currentSubgoal']['GoalCategory'];
    let subgoals = this.currentSubgoal['subgoals'];
    for(let i=0; i<subgoals.length; i++){
      this.currentSubgoal['subgoals'][i].colors = this.globalFunctions.buttonColors(false);
    }
  }

  addGoal(subgoal : {[subgoalProp : string] : any}){
    if (this.selectedSubgoals.indexOf(subgoal.goalID) < 0 ) {
      this.selectedSubgoals.push(subgoal.goalID);
    }
    subgoal.colors = this.globalFunctions.buttonColors(true);
  }


  removeGoal(subgoal : {[subgoalProp : string] : any}) {
    const index = this.selectedSubgoals.indexOf(subgoal.goalID);
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

    let nextSubgoalIndex = this.navParams.data['allSubgoals'].indexOf(this.currentSubgoal) + 1;
    if(nextSubgoalIndex < this.navParams.data['allSubgoals'].length){
      this.navParams.data['currentSubgoal'] = this.navParams.data['allSubgoals'][nextSubgoalIndex];
      this.navCtrl.push(SelectSubgoalsPage, this.navParams.data);
    }
    else{
      this.navCtrl.push(EnterTextGoalPage, {'configPath': this.navParams.data.configPath,
                                                'goalIDs': this.navParams.data['goalIDs'].concat(this.selectedSubgoals)});
    }
  }


  toggleDetails(configStep : {[stepDetials: string] : any}) {
    this.globalFunctions.toggleDetails(configStep);
  }




}
