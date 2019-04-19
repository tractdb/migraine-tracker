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

  getGoalNameByID(goalID: string) : string{
    if(/^\d+$/.test(goalID)){ // it's just a number so it's not a subgoal
      for(let i=0; i<this.goalList.length; i++){
        if(this.goalList[i].goalID === goalID){
          return this.goalList[i].goalName;
        }
      }
    }
    else{
      let goalIDs = Object.keys(this.subgoals);
      for(let i=0; i<goalIDs.length; i++){
        for(let j=0; j<this.subgoals[goalIDs[i]].subgoals.length; j++){
          if(this.subgoals[goalIDs[i]].subgoals[j].goalID === goalID){
            return this.subgoals[goalIDs[i]].subgoals[j].subgoalName;
          }
        }
      }
    }
    return null;
  }



  getSubgoalList() : {[subgoalDetails:string]: any;} {
    return this.subgoals;
  }


  getGoalList() : [{[goalDetails:string]: any;}] {
    return this.goalList;
  }


  getSubgoalByGoalID(id: string) : {[subgoalDetails:string]: any;}  {
    if(id in this.subgoals){
      return this.subgoals[id];
    }
    return null;
  }

}
