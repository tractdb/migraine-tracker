import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable()
export class GoalDetailsServiceProvider {

  private goalList : any;
  private subgoals : {[subgoalDetails:string]: any;};


  constructor(public http: HttpClient) {
    this.getSubgoals();
    this.loadGoalList();
  }


  getSubgoals() {
    this.http.get('assets/subgoals.json', {},).subscribe(subgoalData => {
        this.subgoals = subgoalData;
      },
      error => {
        console.log(error);
      });
  }

  loadGoalList() {
    this.http.get('assets/supportedGoals.json', {},).subscribe(goalData => {
        this.goalList = goalData;
      },
      error => {
        console.log(error);
      });
  }



  getSubgoalList() : {[subgoalDetails:string]: any;} {
    return this.subgoals;
  }


  getGoalList() : [{[goalDetails:string]: any;}] {
    return this.goalList;
  }


  getSubgoalByName(name: string) : {[subgoalDetails:string]: any;}  {
    if(name in this.subgoals){
      return this.subgoals[name];
    }

    return null;
  }

}
