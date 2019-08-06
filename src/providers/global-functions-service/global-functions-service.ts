import { Injectable } from '@angular/core';
import {GoalDetailsServiceProvider} from "../goal-details-service/goal-details-service";
import {DataDetailsServiceProvider} from "../data-details-service/data-details-service";
import {DateFunctionServiceProvider} from "../date-function-service/date-function-service";


@Injectable()
export class GlobalFunctionsServiceProvider {


  private contactEmail = "jesscs@cs.washington.edu";

  constructor(private goalDetails: GoalDetailsServiceProvider,
              private dataDetailsProvider: DataDetailsServiceProvider,
              private dateFuns: DateFunctionServiceProvider) {
  }


  getContactEmail(){
    return this.contactEmail;
  }


  getWhetherMigraine(symptomDict : {[symptom:string] : any}) : boolean{
    // todo: maybe have it be true/false/null?  Right now no indication means false in this
    if(symptomDict === undefined) return false;
    if('migraineToday' in symptomDict) return symptomDict['migraineToday'] === 'Yes';
    else if('peakMigraineSeverity' in symptomDict && Number(symptomDict['peakMigraineSeverity']) > 0){
      return true;
    }
    else if('migraineDuration' in symptomDict && Number(symptomDict['migraineDuration']) > 0){
      return true;
    }
    else if('migraineStartTime' in symptomDict || 'impactOnDisability' in symptomDict){
      return true;
    }
    return false;
  }



  getWhetherTrackedMeds(trackedDict: {[dataType:string] : any}) : boolean{
    let typesToCheck = ["Treatment", "Change"]; // kinda awful, should be in files or something.  Oh well...
    for(let i=0; i<typesToCheck.length; i++){
      let dataType = typesToCheck[i];
      if(trackedDict[dataType] === undefined) continue;
      let itemsTracked = Object.keys(trackedDict[dataType]);
      for(let j=0; j<itemsTracked.length; j++){
        if(this.dataDetailsProvider.getWhetherIsMed(dataType, itemsTracked[j])){
          let trackedVal = trackedDict[dataType][itemsTracked[j]];
          if(trackedVal === 'Yes'){
            return true;
          }
          if(Number(trackedVal) && Number(trackedVal) > 0){
            return true;
          }
        }
      }
    }
    return false;
  }


  getGoalHierarchy(currentGoalIDs : string[]){
    currentGoalIDs.sort();
    let goalHierarchy = {};
    for(let i=0; i<currentGoalIDs.length; i++){
      let goalID = currentGoalIDs[i];
      let goalInfo = this.goalDetails.getGoalByID(goalID, false);
      if(goalInfo['isTopGoal']){ // it's not a subogal
        goalHierarchy[goalInfo.name] = [];
        let allGoalSubgoals = goalInfo['subgoals'] ? goalInfo['subgoals'] : [];
        for(let j=0; j<allGoalSubgoals.length; j++){
          if(currentGoalIDs.indexOf(allGoalSubgoals[j].goalID) > -1){
            goalHierarchy[goalInfo.name].push(allGoalSubgoals[j].name)
          }
        }
      }
    }
    return goalHierarchy;
  }



  calculatePriorGoalProgress(data : {[dataConfigDetails: string] : any},
                             dataType : string,
                             previouslyTracked : {[dataType:string] : any}[], timespan : string=undefined) {
    let timesTracked = 0;
    if(!timespan){
      timespan = data.goal.timespan;
    }
    for(let i=0; i<previouslyTracked.length; i++){
      if(data.id !== 'frequentMedUse' && (previouslyTracked[i][dataType] === undefined
        || previouslyTracked[i][dataType][data.id] === undefined)) {
        continue;
      }
      let cutoff;
      if(timespan === "Week") {
        this.dateFuns.dateArithmatic(new Date(), 'subtract', 1, 'week');
      }
      else if(timespan === "Month"){
        cutoff = this.dateFuns.dateArithmatic(new Date(), 'subtract', 1, 'month');
      }
      else{
        continue; // if it's daily we don't bother, since they can see what they entered
      }
      if(new Date(previouslyTracked[i]['startTime']) > cutoff) {
        if(data.id === 'frequentMedUse'){ // the one calculated field
          timesTracked += this.getWhetherTrackedMeds(previouslyTracked[i]) ? 1 : 0;
        }
        else if(data.field === 'number'){
          timesTracked += Number(previouslyTracked[i][dataType][data.id]);
        }
        else if(data.field !== 'binary' || previouslyTracked[i][dataType][data.id] === 'Yes'){
          timesTracked += 1;
        }
      }
    }
    return timesTracked;
  }


}
