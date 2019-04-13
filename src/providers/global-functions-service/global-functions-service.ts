import { Injectable } from '@angular/core';
import {GoalDetailsServiceProvider} from "../goal-details-service/goal-details-service";
import {DataDetailsServiceProvider} from "../data-details-service/data-details-service";
import {DateFunctionServiceProvider} from "../date-function-service/date-function-service";


@Injectable()
export class GlobalFunctionsServiceProvider {

  private medIDs : string[] = this.dataDetailsProvider.getMedTrackingIDs();

  constructor(private goalDetails: GoalDetailsServiceProvider,
              private dataDetailsProvider: DataDetailsServiceProvider,
              private dateFuns: DateFunctionServiceProvider) {
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
    else if('migraineStartTime' in symptomDict){
      return true;
    }
    return false;
  }



  getWhetherTrackedMeds(treatmentDict: {[treatment:string] : any}) : boolean{
    if(treatmentDict === undefined) return false;
    for(let i=0; i<this.medIDs.length; i++){
      if(this.medIDs[i] in treatmentDict){
        let trackedVal = treatmentDict[this.medIDs[i]];
        if(trackedVal === 'Yes'){
          return true;
        }
        if(Number(trackedVal) && Number(trackedVal) > 0){
          return true;
        }
        else{
          console.log(trackedVal);
        }
      }
    }
    return false;
  }


  getGoalHierarchy(goals){
    let allGoals = {};
    let allSubgoals = this.goalDetails.getSubgoalList();
    let allGoalTypes = this.goalDetails.getGoalList();
    for(let i=0; i<goals.length; i++){
      if(goals[i] in allSubgoals){
        let possibleSubgoals = allSubgoals[goals[i]].subgoals;
        let subgoals = [];
        for(let j=0; j<possibleSubgoals.length; j++){
          if(goals.indexOf(possibleSubgoals[j]['subgoalName'])>-1){
            subgoals.push(possibleSubgoals[j]['subgoalName']);
          }
        }
        allGoals[goals[i]] = subgoals;
      }
      else{
        for(let j=0; j<allGoalTypes.length; j++){
          if(allGoalTypes[j].goalName === goals[i]){
            allGoals[goals[i]] = undefined;
          }
        }
      }
    }
    return allGoals;
  }


  getDataIDs(dataToTrack : {[dataType: string] : any}) : string[] {
    if(!dataToTrack) return [];
    let dataIDs = [];
    let dataTypes = Object.keys(dataToTrack);
    for(let i=0; i<dataTypes.length; i++){
      for(let j=0; j<dataToTrack[dataTypes[i]].length; j++){
        dataIDs.push(dataToTrack[dataTypes[i]][j].id);
      }
    }
    return dataIDs;
  }


  calculatePriorGoalProgress(data : {[dataConfigDetails: string] : any},
                             dataType : string,
                             previouslyTracked : {[dataType:string] : any}[], timespan : string=undefined) {
    let timesTracked = 0;
    if(!timespan){
      timespan = data.goal.timespan;
    }
    for(let i=0; i<previouslyTracked.length; i++){
      if(previouslyTracked[i][dataType] === undefined
        || (previouslyTracked[i][dataType][data.id] === undefined && data.id !== 'frequentMedUse')) {
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
          timesTracked += this.getWhetherTrackedMeds(previouslyTracked[i][dataType]) ? 1 : 0;
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


  buttonColors(added){
    if(added){
      return {"add": "secondary", "remove": "light"};
    }
    else{
      return {"add": "light", "remove": "danger"};
    }
  }


  toggleDetails(configStep) {
    if (configStep.showDetails || configStep.showDetails == undefined) {
      configStep.showDetails = false;
      configStep.icon = 'ios-add-circle-outline';
    }
    else {
      configStep.showDetails = true;
      configStep.icon = 'ios-remove-circle-outline';
    }
    return configStep;
  }

}
