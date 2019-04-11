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

  getGoalByID(goalID: string) : string{
    if(/^\d+$/.test(goalID)){
      let goalIDs = Object.keys(this.subgoals);
      for(let i=0; i<goalIDs.length; i++){
        for(let j=0; j<this.subgoals[goalIDs[i]].subgoals.length; j++){
          if(this.subgoals[goalIDs[i]].subgoals[j].id === goalID){
            return this.subgoals[goalIDs[i]].subgoals[j].name;
          }
        }
      }
    }
    else{
      for(let i=0; i<this.goalList.length; i++){
        if(this.goalList[i].id === goalID){
          return this.goalList[i].name;
        }
      }
    }
    return null;
  }


  getGoalsByIDs(goalIDs : string[]) : string[]{
    let goalNames = [];
    for(let i=0; i<goalIDs.length; i++){
      goalNames.push(this.getGoalByID(goalIDs[i]));
    }
    return goalNames;
  }



  getSubgoalList() : {[subgoalDetails:string]: any;} {
    return this.subgoals;
  }


  getGoalList() : [{[goalDetails:string]: any;}] {
    return this.goalList;
  }


  getSubgoalByID(id: string) : {[subgoalDetails:string]: any;}  {
    if(id in this.subgoals){
      return this.subgoals[id];
    }

    return null;
  }

}
