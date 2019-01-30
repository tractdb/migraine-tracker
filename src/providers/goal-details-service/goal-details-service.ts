import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable()
export class GoalDetailsServiceProvider {

  private allGoalData;
  private goalList;
  private subgoals;


  getSubgoals() {
    this.http.get('assets/subgoals.json', {},).subscribe(subgoalData => {
        this.subgoals = subgoalData;
      },
      error => {
        console.log(error);
      });
  }

  getGoalList() {
    this.allGoalData = this.http.get('assets/supportedGoals.json', {},);
  }

  constructor(public http: HttpClient) {
    this.getGoalList();
    this.getSubgoals();

  }

  getGoalData() {
    return this.allGoalData;
  }

  setGoalList(goalList) {
    this.goalList = goalList;
  }


  getSubgoalByName(name) {

    let fullName = null;

    if(name in this.subgoals){ // full name was used
      fullName = name;
    }

    else { //used only "learning", for ex
      Object.keys(this.subgoals).forEach(function(subgoal) {
        if(subgoal.includes(name)){
          fullName = subgoal;
        }
      });
    }

    if(fullName !== null){
      return this.subgoals[fullName];
    }

    return null;

  }

}
