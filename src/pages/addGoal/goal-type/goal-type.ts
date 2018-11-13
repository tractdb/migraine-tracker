import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {HttpClient} from "@angular/common/http";
import {GoalDescriptionPage} from "../goal-description/goal-description";


@Component({
  selector: 'page-goal-type',
  templateUrl: 'goal-type.html',
})
export class GoalTypePage {

  private allGoalData;
  private goalList;

  private getGoalData() {
    this.http.get('assets/supportedGoals.json', {},)
      .subscribe(goalData => {
          this.allGoalData = goalData;
          this.goalList = this.allGoalData;
        },
        error => {
          console.log(error);
        });
  }

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public http: HttpClient) {
  }

  ionViewDidLoad() {
    if (this.navParams.data["subgoals"]){
      this.goalList = this.navParams.data["subgoals"];
    }
    else{ // I think this happens more times than it should need to :-/
      this.getGoalData();
    }
  }

  toggleContent(goal) {
    if(goal.collapse === undefined) {
      goal.collapse = false;
    }
    goal.collapse = !goal.collapse;
  }

  configureGoal(goal) {
    if(goal["subgoals"]) {
      this.navCtrl.push(GoalTypePage, goal); // so "back" works
    }
    else{
      this.navCtrl.push(GoalDescriptionPage, goal);
    }
  }

}
