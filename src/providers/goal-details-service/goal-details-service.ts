import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable()
export class GoalDetailsServiceProvider {

  private goalList : any;

  constructor(public http: HttpClient) {
    this.loadGoalList();
  }


  loadSubgoalList() {
    // we just separated the files so it's easier to modify; want them appended now
    this.http.get('assets/subgoals.json', {},).subscribe(subgoalData => {
        for(let i=0; i<this.goalList.length; i++){
          if(subgoalData[this.goalList[i]['goalID']]){
            this.goalList[i]['subgoals'] = subgoalData[this.goalList[i]['goalID']];
          }
        }
      },
      error => {
        console.log(error);
      });
  }

  loadGoalList() {
    this.http.get('assets/supportedGoals.json', {},).subscribe(goalData => {
        this.goalList = goalData;
        this.loadSubgoalList();
      },
      error => {
        console.log(error);
      });
  }

  getSubgoals(goalID : string) : {[subgoalAtr : string ] : string}[]{
    for(let i=0; i<this.goalList.length; i++) {
      if (this.goalList[i].goalID === goalID) {
        return this.goalList[i].subgoals;
      }
    }
    return null;
  }



  getGoalNameByID(goalID: string) : string{
    // for whenever we want to display the goals
    for(let i=0; i<this.goalList.length; i++){
      if(this.goalList[i].goalID === goalID){
        return this.goalList[i].goalName;
      }
      for(let j=0; j<this.goalList[i].subgoals.length; j++){
        // could check if the goalID is a number / has a number, but eh.  Tiny list.
        if(this.goalList[i].subgoals[j].goalID === goalID){
          return this.goalList[i].subgoals[j].subgoalName;
        }
      }
    }
    return null;
  }



  getGoalList() : [{[goalDetails:string]: any;}] {
    return this.goalList;
  }

}
