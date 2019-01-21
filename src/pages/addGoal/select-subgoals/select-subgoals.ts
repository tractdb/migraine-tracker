import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {GlobalFunctionsServiceProvider} from "../../../providers/global-functions-service/global-functions-service";

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
  selectedSubgoals;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public globalFunctions: GlobalFunctionsServiceProvider) {
    this.selectedSubgoals = [];
  }

  ionViewDidLoad() {
    console.log( this.navParams.data['unseenSubgoals'])
    this.subgoalDict = this.navParams.data['unseenSubgoals'].splice(0,1)[0];
    console.log( this.navParams.data['unseenSubgoals'])
    this.pageTitle = this.subgoalDict['Title']; // because of an incomprehensible error when I try to just use the dict
    this.subgoals = this.subgoalDict['subgoals'];
    for(let i=0; i<this.subgoals.length; i++){
      this.subgoals[i].colors = this.globalFunctions.buttonColors(false);
    }
  }

  addGoal(subgoal){
    if (this.selectedSubgoals.indexOf(subgoal) < 0 ) {
      this.selectedSubgoals.push(subgoal);
    }
    subgoal.colors = this.globalFunctions.buttonColors(true);
  }


  removeGoal(subgoal) {
    const index = this.selectedSubgoals.indexOf(subgoal);
    if (index > -1) {
      this.selectedSubgoals.splice(index, 1);
    }
    subgoal.colors = this.globalFunctions.buttonColors(false);
  }

  continueSetup() {
    this.navParams.data.selectedGoals = this.navParams.data['selectedGoals'].concat(this.selectedSubgoals);
    if(this.navParams.data['unseenSubgoals'].length > 0){
      this.navCtrl.push(SelectSubgoalsPage, this.navParams.data);
    }
    else{
      console.log("continue to blank goal input page?");
    }
  }

}
